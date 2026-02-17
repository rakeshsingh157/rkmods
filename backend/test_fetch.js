import jwt from 'jsonwebtoken';

const JWT_SECRET = '9fK7vP3xL2qR8tY6mN4zH1wB5cD7eS0uXkT9aJ6pQ2rV8yM4'; // From .env
const userId = '6991b41df16ed868ccb53f10';
const email = 'kumarpatelrakesh222@gmail.com';
const role = 'DEVELOPER';

const token = jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '15m' });

console.log('Generated Token:', token);

async function run() {
    try {
        console.log('Fetching apps...');
        const res = await fetch('http://localhost:5001/api/developer/my-apps', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

run();
