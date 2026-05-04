const jwt = require('jsonwebtoken');
const secret = 'fallback_secret_key_change_in_production';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZjgyN2I5YWY0ODg0YTQyOTg3NTQzMiIsImVtYWlsIjoiYWRtaW5Ac21hcnRjYW50ZWVuLmNvbSIsInJvbGUiOiJBZG1pbiIsInN0YXR1cyI6IlZlcmlmaWVkIiwiaWF0IjoxNzc3ODcyMjAzLCJleHAiOjE3Nzg0NzcwMDN9.ZsSXbs7lW9ugr-nvKyKrUsffB98l_yQhYfUAavUWVuQ';

console.log('Testing JWT verification...');
console.log('Token:', token.substring(0, 50) + '...');
console.log('Secret:', secret);

try {
  const decoded = jwt.verify(token, secret);
  console.log('✅ Success! Decoded:', decoded);
} catch (err) {
  console.log('❌ Failed:', err.message);
}
