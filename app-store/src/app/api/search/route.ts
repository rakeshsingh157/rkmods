import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q) {
        return NextResponse.json([]);
    }

    try {
        const query = `
      SELECT * FROM apps 
      WHERE name ILIKE $1 OR description ILIKE $1 OR category ILIKE $1
    `;
        const result = await pool.query(query, [`%${q}%`]);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
