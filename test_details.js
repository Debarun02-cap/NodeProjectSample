const axios = require('axios');

async function test() {
    try {
        const response = await axios.get('http://localhost:3000/user/complaintDetails/0.269603912934932', {
            headers: {
                'Authorization': 'test-user-id:citizen',
                'Accept': 'application/json'
            }
        });
        console.log('Status code:', response.status);
        console.log('Response Headers:', response.headers);
        console.log('Response Data:', JSON.stringify(response.data, null, 2).slice(0, 1000));
    } catch (err) {
        console.error('Error querying backend:', err.message);
        if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response data:', err.response.data);
        }
    }
}

test();
