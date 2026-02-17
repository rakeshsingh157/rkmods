const B2 = require('backblaze-b2');

const b2 = new B2({
    applicationKeyId: '0055f33f6e39fc00000000001',
    applicationKey: 'K005bCRPiWtFJ+O0IoZUFy7pIzFX0n0'
});

async function setup() {
    try {
        console.log('Authorizing...');
        const auth = await b2.authorize();
        const s3ApiUrl = auth.data.s3ApiUrl;
        console.log('S3 API URL:', s3ApiUrl);

        console.log('Listing buckets...');
        const response = await b2.listBuckets();
        const buckets = response.data.buckets;

        console.log('Found buckets:', buckets.map(b => b.bucketName));

        let bucket = buckets.find(b => b.bucketName.startsWith('app-store-assets'));

        if (!bucket && buckets.length > 0) {
            bucket = buckets[0];
        }

        if (!bucket) {
            console.log('No suitable bucket found. Creating a PRIVATE bucket...');
            const bucketName = `app-store-assets-${Date.now()}`;
            const created = await b2.createBucket({
                bucketName: bucketName,
                bucketType: 'allPrivate' // Private bucket since public requires payment history
            });
            bucket = created.data;
        }

        console.log('BUCKET_NAME:', bucket.bucketName);
        console.log('ENDPOINT:', s3ApiUrl);
        console.log('REGION:', s3ApiUrl.split('.')[1]); // e.g. s3.us-west-004.backblazeb2.com -> us-west-004

    } catch (err) {
        console.error('Error:', err);
    }
}

setup();
