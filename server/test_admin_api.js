

async function testAdminApi() {
    try {
        // 1. Login
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@learnsphere.com',
                password: 'password123'
            })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.message);

        const token = loginData.token;
        console.log('Login successful. Token obtained.');

        // 2. Fetch Enrollments
        const enrollRes = await fetch('http://localhost:5001/api/admin/enrollments', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!enrollRes.ok) {
            console.log('Status:', enrollRes.status);
            throw new Error(await enrollRes.text());
        }

        const enrollments = await enrollRes.json();
        console.log('Enrollments fetched:', enrollments.length);
        if (enrollments.length > 0) {
            console.log('First enrollment sample:', enrollments[0]);
        } else {
            console.log('No enrollments found.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAdminApi();
