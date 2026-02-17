import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.appName || !body.category || !body.version || !body.iconUrl) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = await connectDB();
        const appsCollection = db.collection('apps');

        const newApp = {
            ...body,
            status: 'pending', // Default status for new uploads
            downloads: 0,
            rating: 0,
            reviews: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            developerId: new ObjectId() // In a real app, this would come from the authenticated user
        };

        const result = await appsCollection.insertOne(newApp);

        return NextResponse.json({
            success: true,
            appId: result.insertedId,
            message: 'App submitted successfully'
        });

    } catch (error) {
        console.error('App submission error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
