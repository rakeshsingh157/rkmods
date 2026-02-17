import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://kumarpatelrakesh222_db_user:btXSMWKMPgVhLgSx@rkmods.z0vgyqc.mongodb.net/?appName=rkmods";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const database = client.db('rkmods'); // Assuming db name is rkmods from URI
        const users = database.collection('users');
        const apps = database.collection('apps');

        console.log("--- USERS ---");
        const userList = await users.find({}).toArray();
        userList.forEach(u => console.log(`ID: ${u._id}, Email: ${u.email}, Role: ${u.role}`));

        console.log("\n--- APPS ---");
        const appList = await apps.find({}).toArray();
        appList.forEach(a => console.log(`ID: ${a._id}, Name: ${a.name}, DevID: ${a.developer_id}, Status: ${a.status}`));

    } finally {
        await client.close();
    }
}

run().catch(console.dir);
