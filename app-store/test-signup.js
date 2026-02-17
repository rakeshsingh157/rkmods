const testSignup = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/auth/developer/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'kumarpatelrakesh222@gmail.com',
                password: 'Test@123456'
            })
        });

        const data = await response.json();

        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (!response.ok) {
            console.error('Error:', data.error);
        } else {
            console.log('Success!', data.message);
        }
    } catch (error) {
        console.error('Network error:', error.message);
    }
};

testSignup();
