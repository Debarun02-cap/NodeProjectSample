const http = require('http');

// Test 1: Hit the root / (should respond with something)
const req1 = http.request({ hostname: 'localhost', port: 3000, path: '/', method: 'GET' }, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(`Test 1 - GET / => ${res.statusCode}: ${body.substring(0, 200)}`));
});
req1.on('error', e => console.error('Test 1 error:', e.message));
req1.end();

// Test 2: Hit /user/home with auth header
const req2 = http.request({ hostname: 'localhost', port: 3000, path: '/user/home', method: 'GET', headers: { 'Authorization': '668fa6b0a1d4b6c3746d843d:citizen' } }, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(`Test 2 - GET /user/home => ${res.statusCode}: ${body.substring(0, 300)}`));
});
req2.on('error', e => console.error('Test 2 error:', e.message));
req2.end();

// Test 3: Hit /user/profile with auth header
const req3 = http.request({ hostname: 'localhost', port: 3000, path: '/user/profile', method: 'GET', headers: { 'Authorization': '668fa6b0a1d4b6c3746d843d:citizen' } }, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(`Test 3 - GET /user/profile => ${res.statusCode}: ${body.substring(0, 300)}`));
});
req3.on('error', e => console.error('Test 3 error:', e.message));
req3.end();
