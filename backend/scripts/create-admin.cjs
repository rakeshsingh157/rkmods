const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env' });

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'Not Loaded');

const pool = new Pool({
    // Trying to fix hostname by removing .c-4 which seems invalid or causing DNS issues
    connectionString: process.env.DATABASE_URL.replace('-pooler.c-4', '-pooler'),
    ssl: { rejectUnauthorized: false }
});

async function createAdmin() {
    const email = 'admin@rkmods.com';
    const password = 'AdminPassword123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const res = await pool.query(
            `INSERT INTO users (email, password, role, email_verified, account_status)
       VALUES ($1, $2, 'ADMIN', true, 'active')
       ON CONFLICT (email) DO UPDATE 
       SET password = $2, role = 'ADMIN'
       RETURNING id, email, role`,
            [email, hashedPassword]
        );

        console.log('✅ Admin user created/updated successfully:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log(`   Role: ${res.rows[0].role}`);
    } catch (err) {
        console.error('❌ Error creating admin user:', err);
    } finally {
        await pool.end();
    }
}

createAdmin();
