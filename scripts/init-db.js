const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createTables = async () => {
  try {
    console.log('Creating tables...');

    // Apps Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS apps (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        version VARCHAR(50),
        file_url TEXT,
        icon_url TEXT,
        screenshots TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Downloads Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS downloads (
        id SERIAL PRIMARY KEY,
        app_id INTEGER REFERENCES apps(id),
        user_ip VARCHAR(50),
        downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Reviews Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        app_id INTEGER REFERENCES apps(id),
        rating INTEGER,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tables created successfully');
  } catch (err) {
    console.error('Error creating tables', err);
  } finally {
    await pool.end();
  }
};

createTables();
