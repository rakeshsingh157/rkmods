import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        // Test connection
        const testQuery = await pool.query('SELECT NOW()');
        
        // Check if tables exist
        const tablesQuery = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        // Get apps count
        let appsCount = 0;
        let apps = [];
        let columns = [];
        try {
            // Get column info
            const columnsQuery = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'apps'
            `);
            columns = columnsQuery.rows;
            
            const appsQuery = await pool.query('SELECT COUNT(*) as count FROM apps');
            appsCount = parseInt(appsQuery.rows[0].count);
            
            const appsData = await pool.query('SELECT * FROM apps ORDER BY created_at DESC LIMIT 5');
            apps = appsData.rows;
        } catch (e) {
            console.error('Error fetching apps:', e);
        }
        
        return NextResponse.json({
            status: 'connected',
            timestamp: testQuery.rows[0].now,
            tables: tablesQuery.rows.map(r => r.table_name),
            appsTableColumns: columns,
            appsCount,
            recentApps: apps
        });
    } catch (error) {
        console.error('Database test error:', error);
        return NextResponse.json({ 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error',
            details: error
        }, { status: 500 });
    }
}
