import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const res = await pool.query('SELECT * FROM apps ORDER BY created_at DESC');
        return NextResponse.json(res.rows);
    } catch (error) {
        console.error('Error fetching apps:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
