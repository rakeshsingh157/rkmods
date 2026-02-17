const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/developer/signup',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    }
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Headers:', res.headers);
        console.log('\n--- Response Body ---');
        console.log(data.substring(0, 1000)); // First 1000 chars
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(JSON.stringify({
    email: 'test@example.com',
    password: 'Test@123456'
}));

req.end();
