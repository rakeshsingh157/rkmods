import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://kumarpatelrakesh222_db_user:btXSMWKMPgVhLgSx@rkmods.z0vgyqc.mongodb.net/?appName=rkmods";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const database = client.db('rkmods');
        const apps = database.collection('apps');

        console.log("\n--- APPS ---");
        const appList = await apps.find({}).toArray();
        appList.forEach(a => {
            console.log(`ID: ${a._id} (Type: ${a._id.constructor.name})`);
            console.log(`DevID: ${a.developer_id} (Type: ${a.developer_id.constructor.name})`);
            console.log(`DevID Value: ${a.developer_id}`);
        });

    } finally {
        await client.close();
    }
}

run().catch(console.dir);
