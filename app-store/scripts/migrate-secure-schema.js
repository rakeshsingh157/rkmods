const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const migrateSchema = async () => {
    try {
        console.log('🚀 Starting secure schema migration...\n');

        // ============================================
        // 1. CREATE USERS TABLE
        // ============================================
        console.log('📋 Creating users table...');
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('USER', 'DEVELOPER', 'ADMIN')),
        email_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255),
        account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'locked')),
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Users table created\n');

        // ============================================
        // 2. CREATE SESSIONS TABLE
        // ============================================
        console.log('📋 Creating sessions table...');
        await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        refresh_token TEXT UNIQUE NOT NULL,
        device_info TEXT,
        ip_address VARCHAR(50),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Sessions table created\n');

        // ============================================
        // 3. MODIFY APPS TABLE
        // ============================================
        console.log('📋 Modifying apps table...');

        // Check if apps table exists
        const appsTableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'apps'
      );
    `);

        if (appsTableExists.rows[0].exists) {
            // Add new columns if they don't exist
            await pool.query(`
        DO $$ 
        BEGIN
          -- Add developer_id column
          IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'apps' AND column_name = 'developer_id'
          ) THEN
            ALTER TABLE apps ADD COLUMN developer_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
          END IF;

          -- Add approval_status column
          IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'apps' AND column_name = 'approval_status'
          ) THEN
            ALTER TABLE apps ADD COLUMN approval_status VARCHAR(20) DEFAULT 'pending' 
            CHECK (approval_status IN ('pending', 'approved', 'rejected'));
          END IF;

          -- Add approved_by column
          IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'apps' AND column_name = 'approved_by'
          ) THEN
            ALTER TABLE apps ADD COLUMN approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
          END IF;

          -- Add approved_at column
          IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'apps' AND column_name = 'approved_at'
          ) THEN
            ALTER TABLE apps ADD COLUMN approved_at TIMESTAMP;
          END IF;

          -- Add rejection_reason column
          IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'apps' AND column_name = 'rejection_reason'
          ) THEN
            ALTER TABLE apps ADD COLUMN rejection_reason TEXT;
          END IF;
        END $$;
      `);
        } else {
            // Create apps table from scratch
            await pool.query(`
        CREATE TABLE apps (
          id SERIAL PRIMARY KEY,
          developer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          version VARCHAR(50),
          file_url TEXT,
          icon_url TEXT,
          screenshots TEXT[],
          approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
          approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          approved_at TIMESTAMP,
          rejection_reason TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
        }
        console.log('✅ Apps table modified\n');

        // ============================================
        // 4. MODIFY REVIEWS TABLE
        // ============================================
        console.log('📋 Modifying reviews table...');

        const reviewsTableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'reviews'
      );
    `);

        if (reviewsTableExists.rows[0].exists) {
            // Add new columns if they don't exist
            await pool.query(`
        DO $$ 
        BEGIN
          -- Add user_id column
          IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'reviews' AND column_name = 'user_id'
          ) THEN
            ALTER TABLE reviews ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
          END IF;

          -- Add user_name column for guests
          IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'reviews' AND column_name = 'user_name'
          ) THEN
            ALTER TABLE reviews ADD COLUMN user_name VARCHAR(255);
          END IF;

          -- Add ip_address column
          IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'reviews' AND column_name = 'ip_address'
          ) THEN
            ALTER TABLE reviews ADD COLUMN ip_address VARCHAR(50);
          END IF;

          -- Add fingerprint column
          IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'reviews' AND column_name = 'fingerprint'
          ) THEN
            ALTER TABLE reviews ADD COLUMN fingerprint VARCHAR(255);
          END IF;

          -- Add trust_score column
          IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'reviews' AND column_name = 'trust_score'
          ) THEN
            ALTER TABLE reviews ADD COLUMN trust_score INTEGER DEFAULT 0;
          END IF;

          -- Add moderation_status column
          IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'reviews' AND column_name = 'moderation_status'
          ) THEN
            ALTER TABLE reviews ADD COLUMN moderation_status VARCHAR(20) DEFAULT 'approved' 
            CHECK (moderation_status IN ('pending', 'approved', 'spam'));
          END IF;

          -- Add is_spam column
          IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'reviews' AND column_name = 'is_spam'
          ) THEN
            ALTER TABLE reviews ADD COLUMN is_spam BOOLEAN DEFAULT FALSE;
          END IF;
        END $$;
      `);
        } else {
            // Create reviews table from scratch
            await pool.query(`
        CREATE TABLE reviews (
          id SERIAL PRIMARY KEY,
          app_id INTEGER REFERENCES apps(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          user_name VARCHAR(255),
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          message TEXT,
          ip_address VARCHAR(50),
          fingerprint VARCHAR(255),
          trust_score INTEGER DEFAULT 0,
          moderation_status VARCHAR(20) DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'spam')),
          is_spam BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
        }
        console.log('✅ Reviews table modified\n');

        // ============================================
        // 5. CREATE REVIEW_REPLIES TABLE
        // ============================================
        console.log('📋 Creating review_replies table...');
        await pool.query(`
      CREATE TABLE IF NOT EXISTS review_replies (
        id SERIAL PRIMARY KEY,
        review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
        developer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Review_replies table created\n');

        // ============================================
        // 6. CREATE RATE_LIMITS TABLE
        // ============================================
        console.log('📋 Creating rate_limits table...');
        await pool.query(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        id SERIAL PRIMARY KEY,
        identifier VARCHAR(255) NOT NULL,
        endpoint VARCHAR(255) NOT NULL,
        count INTEGER DEFAULT 1,
        window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(identifier, endpoint)
      );
    `);
        console.log('✅ Rate_limits table created\n');

        // ============================================
        // 7. CREATE IP_FINGERPRINTS TABLE
        // ============================================
        console.log('📋 Creating ip_fingerprints table...');
        await pool.query(`
      CREATE TABLE IF NOT EXISTS ip_fingerprints (
        id SERIAL PRIMARY KEY,
        ip_address VARCHAR(50) NOT NULL,
        fingerprint VARCHAR(255) NOT NULL,
        suspicious_score INTEGER DEFAULT 0,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(ip_address, fingerprint)
      );
    `);
        console.log('✅ IP_fingerprints table created\n');

        // ============================================
        // 8. CREATE SUPPORT_TICKETS TABLE
        // ============================================
        console.log('📋 Creating support_tickets table...');
        await pool.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Support_tickets table created\n');

        // ============================================
        // 9. CREATE APP_REPORTS TABLE
        // ============================================
        console.log('📋 Creating app_reports table...');
        await pool.query(`
      CREATE TABLE IF NOT EXISTS app_reports (
        id SERIAL PRIMARY KEY,
        app_id INTEGER REFERENCES apps(id) ON DELETE CASCADE,
        reported_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        reason TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ App_reports table created\n');

        // ============================================
        // 10. CREATE ADMIN_ACTIONS TABLE
        // ============================================
        console.log('📋 Creating admin_actions table...');
        await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_actions (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action_type VARCHAR(100) NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Admin_actions table created\n');

        // ============================================
        // 11. CREATE INDEXES FOR PERFORMANCE
        // ============================================
        console.log('📋 Creating indexes...');
        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON sessions(refresh_token);
      CREATE INDEX IF NOT EXISTS idx_apps_developer_id ON apps(developer_id);
      CREATE INDEX IF NOT EXISTS idx_apps_approval_status ON apps(approval_status);
      CREATE INDEX IF NOT EXISTS idx_reviews_app_id ON reviews(app_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_moderation_status ON reviews(moderation_status);
      CREATE INDEX IF NOT EXISTS idx_review_replies_review_id ON review_replies(review_id);
      CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier, endpoint);
      CREATE INDEX IF NOT EXISTS idx_ip_fingerprints_ip ON ip_fingerprints(ip_address);
      CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
      CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
      CREATE INDEX IF NOT EXISTS idx_app_reports_app_id ON app_reports(app_id);
      CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
    `);
        console.log('✅ Indexes created\n');

        // ============================================
        // 12. VERIFY TABLES
        // ============================================
        console.log('📋 Verifying all tables...');
        const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

        console.log('\n✅ Migration completed successfully!\n');
        console.log('📊 Tables in database:');
        tables.rows.forEach(row => {
            console.log(`   - ${row.table_name}`);
        });

        console.log('\n🎉 Database is ready for secure app store platform!\n');

    } catch (err) {
        console.error('❌ Error during migration:', err);
        throw err;
    } finally {
        await pool.end();
    }
};

migrateSchema();
