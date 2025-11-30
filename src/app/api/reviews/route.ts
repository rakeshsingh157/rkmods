import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { appId, rating, message, user } = await request.json();

        if (!appId || !rating) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const query = `
      INSERT INTO reviews (app_id, rating, message, user_name, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;
        const result = await pool.query(query, [appId, rating, message, user || 'Anonymous']);

        return NextResponse.json({ success: true, review: result.rows[0] });
    } catch (error) {
        console.error('Review error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
