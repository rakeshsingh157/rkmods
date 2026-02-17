import { connectDB } from './src/lib/db.js';

async function checkApps() {
    try {
        const db = await connectDB();
        const apps = await db.collection('apps').find({}).limit(1).toArray();
        console.log('App structure:', JSON.stringify(apps, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

checkApps();
