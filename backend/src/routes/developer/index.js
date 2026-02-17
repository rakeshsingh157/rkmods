import express from 'express';
import { ObjectId } from 'mongodb';
import { connectDB } from '../../lib/db.js';
import { hashPassword, verifyPassword, generateAccessToken, generateEmailVerificationToken, validatePasswordStrength } from '../../lib/auth.js';
import { isValidEmail, sanitizeInput } from '../../lib/security.js';
import { sendVerificationEmail } from '../../lib/email.js';
import { checkRateLimit } from '../../lib/rateLimit.js';
import { authenticateRequest } from '../../middleware/authenticate.js';

const router = express.Router();

// Developer Signup
router.post('/auth/signup', async (req, res) => {
    try {
        const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip;

        const rateLimit = await checkRateLimit(clientIP, 'auth');
        if (!rateLimit.allowed) {
            return res.status(429).json({ error: 'Too many requests', resetAt: rateLimit.resetAt });
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const sanitizedEmail = sanitizeInput(email.toLowerCase());

        if (!isValidEmail(sanitizedEmail)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ error: passwordValidation.error });
        }

        const db = await connectDB();
        const usersCollection = db.collection('users');

        const existingUser = await usersCollection.findOne({ email: sanitizedEmail });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const hashedPassword = await hashPassword(password);
        const verificationToken = generateEmailVerificationToken();

        const newDeveloper = {
            email: sanitizedEmail,
            password: hashedPassword,
            role: 'DEVELOPER',
            verification_token: verificationToken,
            email_verified: false,
            account_status: 'active',
            created_at: new Date()
        };

        const result = await usersCollection.insertOne(newDeveloper);
        const user = { ...newDeveloper, id: result.insertedId };

        // Send verification email (non-blocking)
        sendVerificationEmail(sanitizedEmail, verificationToken, 'developer')
            .catch(error => console.error('Error sending verification email:', error));

        res.status(201).json({
            success: true,
            message: 'Developer account created successfully. Please check your email to verify your account.',
            user: { id: user.id, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error('Developer signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Developer Login
router.post('/auth/login', async (req, res) => {
    try {
        const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.ip;

        const rateLimit = await checkRateLimit(clientIP, 'auth');
        if (!rateLimit.allowed) {
            return res.status(429).json({ error: 'Too many login attempts', resetAt: rateLimit.resetAt });
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const sanitizedEmail = sanitizeInput(email.toLowerCase());

        const db = await connectDB();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({
            email: sanitizedEmail,
            role: 'DEVELOPER'
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateAccessToken(user._id, user.email, user.role);

        res.json({
            success: true,
            message: 'Developer logged in successfully',
            accessToken: token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                email_verified: user.email_verified
            }
        });

    } catch (error) {
        console.error('Developer login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get upload server (DevUploads)
router.get('/upload/devuploads', authenticateRequest, async (req, res) => {
    try {
        const apiKey = process.env.DEVUPLOADS_KEY;
        if (!apiKey) {
            console.error('DEVUPLOADS_KEY is missing');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const response = await fetch(`https://devuploads.com/api/upload/server?key=${apiKey}`);

        if (!response.ok) {
            throw new Error('Failed to get upload server from DevUploads');
        }

        const data = await response.json();

        if (data.status !== 200) {
            throw new Error(data.msg || 'DevUploads API error');
        }

        res.json({
            url: data.result,
            sess_id: data.sess_id
        });

    } catch (error) {
        console.error('Error fetching upload server:', error);
        res.status(500).json({ error: 'Failed to initialize upload' });
    }
});

// Create/Upload App
router.post('/apps', authenticateRequest, async (req, res) => {
    try {
        const {
            name, category, version, description, fileUrl, iconUrl, size,
            screenshots, key_features, changelog
        } = req.body;

        if (!name || !category || !version || !description || !fileUrl) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const sanitizedDescription = sanitizeInput(description);
        const sanitizedName = sanitizeInput(name);

        if (sanitizedName.length < 3) return res.status(400).json({ error: 'App name too short' });
        if (sanitizedDescription.length < 10) return res.status(400).json({ error: 'Description too short' });

        const db = await connectDB();
        const appsCollection = db.collection('apps');

        const newApp = {
            developer_id: req.user.userId,
            name: sanitizedName,
            category,
            version,
            description: sanitizedDescription,
            file_url: fileUrl,
            icon_url: iconUrl || '',
            size: size || '',
            screenshots: screenshots || [],
            key_features: key_features || [],
            changelog: changelog || {
                version: version,
                date: new Date().toISOString().split('T')[0],
                updates: []
            },
            downloads: 0,
            rating: 0,
            reviews_count: 0,
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date()
        };

        const result = await appsCollection.insertOne(newApp);

        res.status(201).json({
            success: true,
            message: 'App submitted successfully',
            appId: result.insertedId
        });

    } catch (error) {
        console.error('App upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET Developer Stats
router.get('/stats', authenticateRequest, async (req, res) => {
    try {
        const db = await connectDB();
        const appsCollection = db.collection('apps');

        // Support both String and ObjectId for developer_id to be safe
        const query = {
            $or: [
                { developer_id: req.user.userId },
                { developer_id: new ObjectId(req.user.userId) }
            ]
        };

        const stats = await appsCollection.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalApps: { $sum: 1 },
                    totalDownloads: { $sum: '$downloads' },
                    totalReviews: { $sum: '$reviews_count' },
                    avgRating: { $avg: '$rating' }
                }
            }
        ]).toArray();

        const result = stats[0] || {
            totalApps: 0,
            totalDownloads: 0,
            totalReviews: 0,
            avgRating: 0
        };

        // Format avgRating to 1 decimal place
        result.avgRating = result.avgRating ? parseFloat(result.avgRating.toFixed(1)) : 0;

        res.json(result);

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET My Apps
router.get('/my-apps', authenticateRequest, async (req, res) => {
    try {
        console.log('[DEBUG] GET /my-apps called');
        console.log('[DEBUG] User from token:', req.user);

        const db = await connectDB();
        const appsCollection = db.collection('apps');

        const query = {
            developer_id: req.user.userId
        };
        console.log('[DEBUG] Querying apps with:', query);

        const apps = await appsCollection.find(query).sort({ created_at: -1 }).toArray();
        console.log(`[DEBUG] Found ${apps.length} apps`);

        if (apps.length === 0) {
            // Debug: check if any apps exist at all
            const allAppsCount = await appsCollection.countDocuments({});
            console.log(`[DEBUG] Total apps in DB: ${allAppsCount}`);
        }

        // Convert _id to id for frontend
        const appsWithId = apps.map(app => ({
            ...app,
            id: app._id.toString()
        }));

        res.json(appsWithId);

    } catch (error) {
        console.error('Get apps error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// UPDATE App
router.put('/apps/:id', authenticateRequest, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name, category, version, description, fileUrl, iconUrl, size,
            screenshots, key_features, changelog
        } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid app ID' });
        }

        const db = await connectDB();
        const appsCollection = db.collection('apps');

        const app = await appsCollection.findOne({
            _id: new ObjectId(id),
            developer_id: req.user.userId
        });

        if (!app) {
            return res.status(404).json({ error: 'App not found or unauthorized' });
        }

        const updates = {
            updated_at: new Date()
        };

        if (name) updates.name = sanitizeInput(name);
        if (category) updates.category = category;
        if (version) updates.version = version;
        if (description) updates.description = sanitizeInput(description);
        if (fileUrl) updates.file_url = fileUrl;
        if (iconUrl) updates.icon_url = iconUrl;
        if (size) updates.size = size;
        if (screenshots) updates.screenshots = screenshots;
        if (key_features) updates.key_features = key_features;
        if (changelog) updates.changelog = changelog;

        await appsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updates }
        );

        res.json({ success: true, message: 'App updated successfully' });

    } catch (error) {
        console.error('Update app error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE App
router.delete('/apps/:id', authenticateRequest, async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid app ID' });
        }

        const db = await connectDB();
        const appsCollection = db.collection('apps');

        const result = await appsCollection.deleteOne({
            _id: new ObjectId(id),
            developer_id: req.user.userId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'App not found or unauthorized' });
        }

        res.json({ success: true, message: 'App deleted successfully' });

    } catch (error) {
        console.error('Delete app error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/auth/verify-email', (req, res) => {
    res.json({ message: 'Email verification endpoint - to be implemented' });
});

export default router;
