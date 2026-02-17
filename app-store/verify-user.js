require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

// Get MongoDB URI from environment or use connection string directly if not loaded
const uri = process.env.MONGODB_URI || 'mongodb+srv://kumarpatelrakesh222_db_user:btXSMWKMPgVhLgSx@rkmods.z0vgyqc.mongodb.net/?appName=rkmods';
const client = new MongoClient(uri);

async function verifyUser() {
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const database = client.db('rkmods');
        const users = database.collection('users');

        const email = 'kumarpatelrakesh222@gmail.com';

        const updateResult = await users.updateOne(
            { email: email },
            { $set: { email_verified: true } }
        );

        console.log(`Matched ${updateResult.matchedCount} documents and modified ${updateResult.modifiedCount} documents.`);

        if (updateResult.matchedCount > 0) {
            console.log(`✅ User ${email} has been verified.`);
        } else {
            console.log(`❌ User ${email} not found.`);
        }

    } catch (error) {
        console.error('❌ Error verifying user:', error);
    } finally {
        await client.close();
    }
}

verifyUser();
