import { MongoClient } from 'mongodb';

let client = null;
let db = null;
let isConnecting = false;

function getClient() {
    if (!client) {
        const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || '';
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }
        client = new MongoClient(MONGODB_URI, {
            tls: true,
            ssl: true,
            tlsAllowInvalidCertificates: true, // Try this if you have SSL issues locally
            minPoolSize: 1,
            maxPoolSize: 10,
        });
    }
    return client;
}

export async function connectDB() {
    if (db) {
        return db;
    }

    if (isConnecting) {
        // Wait for existing connection attempt
        while (!db) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return db;
    }

    try {
        isConnecting = true;
        const mongoClient = getClient();
        await mongoClient.connect();
        db = mongoClient.db('rkmods');
        console.log('✅ Connected to MongoDB');
        return db;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    } finally {
        isConnecting = false;
    }
}

// For backward compatibility, export a pool-like object
const pool = {
    query: async (text, params) => {
        throw new Error('SQL queries not supported with MongoDB. Use connectDB() instead.');
    }
};

export default pool;
