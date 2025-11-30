const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const updateSchema = async () => {
    try {
        console.log('Updating schema...');
        await pool.query(`
      ALTER TABLE reviews 
      ADD COLUMN IF NOT EXISTS user_name VARCHAR(100) DEFAULT 'Anonymous';
    `);
        console.log('Schema updated successfully');
    } catch (err) {
        console.error('Error updating schema', err);
    } finally {
        await pool.end();
    }
};

updateSchema();
