import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        // Get app file URL
        const appRes = await pool.query('SELECT file_url FROM apps WHERE id = $1', [id]);
        if (appRes.rows.length === 0) {
            return NextResponse.json({ error: 'App not found' }, { status: 404 });
        }
        const fileUrl = appRes.rows[0].file_url;

        // Record download
        // We can try to get IP from headers if needed, but for now just record the event
        await pool.query('INSERT INTO downloads (app_id, downloaded_at) VALUES ($1, NOW())', [id]);

        // Redirect to file
        return NextResponse.redirect(fileUrl);
    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
