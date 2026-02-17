import { NextResponse } from 'next/server';
import { getUploadServer } from '@/lib/devuploads';

export async function GET() {
    try {
        const data = await getUploadServer();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error getting upload server:', error);
        return NextResponse.json({ error: 'Failed to get upload server' }, { status: 500 });
    }
}
