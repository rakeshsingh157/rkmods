const { Pool } = require('pg');

// Test direct connection (non-pooler)
const directUrl = 'postgresql://neondb_owner:npg_5JyvLbu1iWSK@ep-super-sun-aid88wdk.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
    connectionString: directUrl,
    ssl: {
        rejectUnauthorized: false
    }
});

async function testConnection() {
    try {
        console.log('Testing direct connection to Neon...');
        const client = await pool.connect();
        console.log('✅ Connected successfully!');

        const result = await client.query('SELECT NOW()');
        console.log('Current time from database:', result.rows[0]);

        client.release();
        await pool.end();
        console.log('Connection test completed successfully');
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('Error code:', error.code);
    }
}

testConnection();
