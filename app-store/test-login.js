const https = require('http');

const data = JSON.stringify({
    email: 'kumarpatelrakesh222@gmail.com',
    password: 'Test@123456'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/developer/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    let responseBody = '';

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        try {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log('✅ Login Successful');
                console.log('Response:', JSON.parse(responseBody));
            } else {
                console.log('❌ Login Failed');
                console.log('Response:', JSON.parse(responseBody));
            }
        } catch (e) {
            console.log('Response:', responseBody);
        }
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
