const http = require('http');

const opts = {
  hostname: 'localhost',
  port: 3000,
  path: '/user/debug-test',
  method: 'GET',
  headers: { 'Authorization': '668fa6b0a1d4b6c3746d843d:citizen' }
};

const req = http.request(opts, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => console.log('Debug test:', res.statusCode, body));
});
req.on('error', (e) => console.error('Error:', e.message));
req.end();

// Also test /user/profile
const opts2 = {
  hostname: 'localhost',
  port: 3000,
  path: '/user/profile',
  method: 'GET',
  headers: { 'Authorization': '668fa6b0a1d4b6c3746d843d:citizen' }
};

const req2 = http.request(opts2, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => console.log('Profile test:', res.statusCode, body));
});
req2.on('error', (e) => console.error('Error:', e.message));
req2.end();
