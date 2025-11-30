const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const updateSchema = async () => {
    try {
        console.log('Updating schema...');
        
        // Add user_name to reviews
        await pool.query(`
      ALTER TABLE reviews 
      ADD COLUMN IF NOT EXISTS user_name VARCHAR(100) DEFAULT 'Anonymous';
    `);
        
        // Add size to apps
        await pool.query(`
      ALTER TABLE apps 
      ADD COLUMN IF NOT EXISTS size VARCHAR(50);
    `);
        
        // Add screenshots to apps (if not exists)
        await pool.query(`
      ALTER TABLE apps 
      ADD COLUMN IF NOT EXISTS screenshots TEXT[];
    `);
        
        console.log('Schema updated successfully');
    } catch (err) {
        console.error('Error updating schema', err);
    } finally {
        await pool.end();
    }
};

updateSchema();
