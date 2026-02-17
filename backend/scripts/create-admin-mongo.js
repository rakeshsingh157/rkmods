import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('❌ MONGODB_URI is not defined in .env');
    process.exit(1);
}

const client = new MongoClient(uri);

async function createAdmin() {
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db('rkmods');
        const users = db.collection('users');

        const email = 'admin@rkmods.com';
        const password = 'AdminPassword123!';
        const hashedPassword = await bcrypt.hash(password, 12);

        const adminUser = {
            email,
            password: hashedPassword,
            role: 'ADMIN',
            email_verified: true,
            account_status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await users.updateOne(
            { email },
            { $set: adminUser },
            { upsert: true }
        );

        console.log('✅ Admin user created/updated successfully');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log(`   Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}, Upserted: ${result.upsertedCount}`);

    } catch (err) {
        console.error('❌ Error creating admin user:', err);
    } finally {
        await client.close();
    }
}

createAdmin();
