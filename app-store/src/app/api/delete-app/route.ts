import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'App ID is required' }, { status: 400 });
        }

        // Delete related records first to satisfy foreign key constraints
        await pool.query('DELETE FROM downloads WHERE app_id = $1', [id]);
        await pool.query('DELETE FROM reviews WHERE app_id = $1', [id]);

        // Delete the app from the database
        const result = await pool.query('DELETE FROM apps WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'App not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'App deleted successfully' });
    } catch (err) {
        console.error('Error deleting app:', err);
        return NextResponse.json({ error: 'Failed to delete app' }, { status: 500 });
    }
}
