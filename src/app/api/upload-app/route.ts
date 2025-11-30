import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const category = formData.get('category') as string;
        const version = formData.get('version') as string;
        const fileUrl = formData.get('fileUrl') as string;
        const iconUrl = formData.get('iconUrl') as string;
        const size = formData.get('size') as string;
        const screenshotsStr = formData.get('screenshots') as string;
        const screenshots = screenshotsStr ? JSON.parse(screenshotsStr) : [];

        console.log('Screenshots received:', screenshotsStr);
        console.log('Screenshots parsed:', screenshots);

        if (!fileUrl || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Save to DB
        const query = `
      INSERT INTO apps (name, description, category, version, file_url, icon_url, size, screenshots)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
        const values = [name, description, category, version, fileUrl, iconUrl, size, screenshots];
        
        console.log('Inserting with screenshots:', screenshots);
        const result = await pool.query(query, values);
        console.log('Inserted app:', result.rows[0]);

        return NextResponse.json({ success: true, app: result.rows[0] });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
