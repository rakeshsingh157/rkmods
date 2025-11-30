import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        // Check if column exists
        const checkRes = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='apps' AND column_name='size';
        `);

        if (checkRes.rows.length === 0) {
            // Add column
            await pool.query(`ALTER TABLE apps ADD COLUMN size VARCHAR(50);`);
            return NextResponse.json({ message: 'Column size added' });
        }

        return NextResponse.json({ message: 'Column size already exists' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: (error as any).toString() }, { status: 500 });
    }
}
