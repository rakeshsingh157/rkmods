import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || '';
const client = new MongoClient(MONGODB_URI);

let db: Db | null = null;
let isConnecting = false;

export async function connectDB(): Promise<Db> {
    if (db) {
        return db;
    }

    if (isConnecting) {
        // Wait for existing connection attempt
        while (!db) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return db!;
    }

    try {
        isConnecting = true;
        await client.connect();
        db = client.db('rkmods');
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
    query: async (text: string, params?: any[]) => {
        throw new Error('SQL queries not supported with MongoDB. Use connectDB() instead.');
    }
};

export default pool;
