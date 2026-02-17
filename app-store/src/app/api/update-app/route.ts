import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import pool from '@/lib/db';

export async function PUT(request: Request) {
    try {
        const formData = await request.formData();
        const id = formData.get('id') as string;
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const category = formData.get('category') as string;
        const version = formData.get('version') as string;
        const fileUrl = formData.get('fileUrl') as string;
        const iconUrl = formData.get('iconUrl') as string;
        const size = formData.get('size') as string;
        const screenshotsStr = formData.get('screenshots') as string;
        const screenshots = screenshotsStr ? JSON.parse(screenshotsStr) : [];

        console.log('PUT /api/update-app - Raw screenshots string:', screenshotsStr);
        console.log('PUT /api/update-app - Parsed screenshots:', screenshots);

        if (!id || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Update DB
        const query = `
      UPDATE apps 
      SET name = $1, description = $2, category = $3, version = $4, file_url = $5, icon_url = $6, size = $7, screenshots = $8
      WHERE id = $9
      RETURNING *
    `;
        const values = [name, description, category, version, fileUrl, iconUrl, size, screenshots, id];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'App not found' }, { status: 404 });
        }

        // Revalidate pages to show updated app immediately
        revalidatePath('/');
        revalidatePath('/trending');
        revalidatePath(`/app/${id}`);

        return NextResponse.json({ success: true, app: result.rows[0] });
    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
