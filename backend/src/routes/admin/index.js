import express from 'express';
import { connectDB } from '../../lib/db.js';
import { verifyPassword, generateAccessToken } from '../../lib/auth.js';

const router = express.Router();

// Admin routes
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email, 'Password provided:', password ? 'Yes' : 'No');

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const db = await connectDB();
        const users = db.collection('users');

        const user = await users.findOne({ email });

        if (!user) {
            console.log('User not found in DB');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('User found:', user.email, 'Role:', user.role);

        if (user.role !== 'ADMIN') {
            console.log('Role mismatch');
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const isValid = await verifyPassword(password, user.password);
        console.log('Password valid?', isValid);

        if (!isValid) {
            console.log('Password invalid');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const accessToken = generateAccessToken(user._id.toString(), user.email, user.role);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: 'Login successful',
            accessToken,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin Stats
router.get('/stats', async (req, res) => {
    try {
        const db = await connectDB();
        const users = db.collection('users');
        const apps = db.collection('apps');

        const totalUsers = await users.countDocuments({ role: 'USER' });
        const totalDevelopers = await users.countDocuments({ role: 'DEVELOPER' });
        const totalApps = await apps.countDocuments({});
        const pendingApps = await apps.countDocuments({ status: 'pending' });

        res.json({
            totalUsers,
            totalDevelopers,
            totalApps,
            pendingApps
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Users (Role: USER)
router.get('/users', async (req, res) => {
    try {
        const db = await connectDB();
        const users = db.collection('users');
        const userList = await users.find({ role: 'USER' }).toArray();
        res.json(userList);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Developers (Role: DEVELOPER)
router.get('/developers', async (req, res) => {
    try {
        const db = await connectDB();
        const users = db.collection('users');
        const devList = await users.find({ role: 'DEVELOPER' }).toArray();
        res.json(devList);
    } catch (error) {
        console.error('Error fetching developers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Apps (All or Filtered)
router.get('/apps', async (req, res) => {
    try {
        const db = await connectDB();
        const apps = db.collection('apps');
        const { status } = req.query;

        const query = status ? { status: status } : {};
        const appList = await apps.find(query).toArray();

        res.json(appList);
    } catch (error) {
        console.error('Error fetching apps:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Approve App
router.post('/apps/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await connectDB();
        const apps = db.collection('apps');

        // Need ObjectId for querying by _id, assuming apps use ObjectId
        // If IDs are strings in your DB, remove the ObjectId wrapper
        const { ObjectId } = await import('mongodb');

        let queryId;
        try {
            queryId = new ObjectId(id);
        } catch (e) {
            // Fallback for string IDs if any
            queryId = id;
        }

        const result = await apps.updateOne(
            { _id: queryId },
            { $set: { status: 'approved', updated_at: new Date() } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'App not found' });
        }

        res.json({ message: 'App approved successfully' });
    } catch (error) {
        console.error('Error approving app:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reject App
router.post('/apps/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await connectDB();
        const apps = db.collection('apps');

        const { ObjectId } = await import('mongodb');

        let queryId;
        try {
            queryId = new ObjectId(id);
        } catch (e) {
            queryId = id;
        }

        const result = await apps.updateOne(
            { _id: queryId },
            { $set: { status: 'rejected', updated_at: new Date() } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'App not found' });
        }

        res.json({ message: 'App rejected successfully' });
    } catch (error) {
        console.error('Error rejecting app:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Suspend/Activate User
router.post('/users/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'active' or 'suspended'

        if (!['active', 'suspended'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const db = await connectDB();
        const users = db.collection('users');

        const { ObjectId } = await import('mongodb');
        let queryId;
        try { queryId = new ObjectId(id); } catch (e) { queryId = id; }

        const result = await users.updateOne(
            { _id: queryId },
            { $set: { account_status: status, updated_at: new Date() } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: `User ${status} successfully` });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete User
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await connectDB();
        const users = db.collection('users');

        const { ObjectId } = await import('mongodb');
        let queryId;
        try { queryId = new ObjectId(id); } catch (e) { queryId = id; }

        const result = await users.deleteOne({ _id: queryId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete App
router.delete('/apps/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await connectDB();
        const apps = db.collection('apps');

        const { ObjectId } = await import('mongodb');
        let queryId;
        try { queryId = new ObjectId(id); } catch (e) { queryId = id; }

        const result = await apps.deleteOne({ _id: queryId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'App not found' });
        }

        res.json({ message: 'App deleted successfully' });
    } catch (error) {
        console.error('Error deleting app:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
