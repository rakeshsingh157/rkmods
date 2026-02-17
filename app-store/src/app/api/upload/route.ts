import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 Client for Backblaze B2
const s3Client = new S3Client({
    region: process.env.B2_REGION || 'us-east-005',
    endpoint: process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com',
    credentials: {
        accessKeyId: process.env.B2_APPLICATION_KEY_ID || '',
        secretAccessKey: process.env.B2_APPLICATION_KEY || ''
    },
    forcePathStyle: true // Recommended for some S3-compatible services if issues arise
});

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;
        const uploadType = data.get('type') as string; // 'icon', 'screenshot', 'apk'

        // console.log(`[Upload] Starting upload for ${file?.name} (${uploadType})`);

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;

        // STRATEGY: 
        // 1. Images (icon, screenshot) -> Backblaze B2
        // 2. APKs -> DevUploads API

        if (uploadType === 'icon' || uploadType === 'screenshot') {
            // --- BACKBLAZE B2 UPLOAD ---
            const bucketName = process.env.B2_BUCKET_NAME || 'app-store-assets-1764445849573';
            const key = `${uploadType}s/${filename}`;

            // console.log(`[Upload] Attempting B2 upload to bucket: ${bucketName}, key: ${key}`);

            try {
                const command = new PutObjectCommand({
                    Bucket: bucketName,
                    Key: key,
                    Body: buffer,
                    ContentType: file.type,
                });

                await s3Client.send(command);
                // console.log(`[Upload] B2 upload success`);

                // Construct Public URL
                const fileUrl = `${process.env.B2_ENDPOINT}/${bucketName}/${key}`;

                return NextResponse.json({
                    success: true,
                    url: fileUrl,
                    filename: filename
                });

            } catch (s3Error: any) {
                console.error('[Upload] S3 Upload Error Detailed:', {
                    message: s3Error.message,
                    code: s3Error.code,
                    requestId: s3Error.$metadata?.requestId,
                    stack: s3Error.stack
                });
                return NextResponse.json({ error: `Failed to upload image to B2: ${s3Error.message}` }, { status: 500 });
            }

        } else {
            // --- DEVUPLOADS API (APKs) ---
            const apiKey = process.env.DEVUPLOADS_KEY || '397121wy5ozqjf8tuqzgf';

            // 1. Get Upload Server
            const serverRes = await fetch(`https://devuploads.com/api/upload/server?key=${apiKey}`);
            if (!serverRes.ok) throw new Error('Failed to get DevUploads server');
            const serverData = await serverRes.json();

            if (serverData.status !== 200) {
                throw new Error(`DevUploads Error: ${serverData.msg}`);
            }

            const uploadUrl = serverData.result;

            // 2. Upload File
            const fileBlob = new Blob([buffer], { type: file.type });
            const uploadFormData = new FormData();
            uploadFormData.append('file', fileBlob, file.name);
            uploadFormData.append('key', apiKey);

            const uploadRes = await fetch(uploadUrl, {
                method: 'POST',
                body: uploadFormData,
            });

            if (!uploadRes.ok) throw new Error('Failed to upload file to DevUploads');
            const uploadResult = await uploadRes.json();

            if (uploadResult.status !== 200) {
                throw new Error(`Upload Failed: ${uploadResult.msg}`);
            }

            const fileCode = uploadResult.file_code;

            // 3. Get Direct Link
            const linkRes = await fetch(`https://devuploads.com/api/file/direct_link?key=${apiKey}&file_code=${fileCode}`);
            const linkData = await linkRes.json();

            let finalUrl = '';
            if (linkData.status === 200) {
                finalUrl = linkData.result;
            } else {
                console.warn('Could not get direct link, falling back to view link', linkData);
                finalUrl = `https://devuploads.com/${fileCode}`;
            }

            return NextResponse.json({
                success: true,
                url: finalUrl,
                fileCode: fileCode,
                filename: file.name
            });
        }

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal server error processing file upload' }, { status: 500 });
    }
}
