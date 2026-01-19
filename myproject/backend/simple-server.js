import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = 3001;
const HOST = '127.0.0.1';

console.log('Script loaded');
console.log(`Attempting to bind to ${HOST}:${PORT}...`);

server.listen(PORT, HOST, () => {
  console.log(`✓ Simple server listening on http://${HOST}:${PORT}`);
  const addr = server.address();
  console.log(`  Full address info: ${JSON.stringify(addr)}`);
});

server.on('error', (err) => {
  console.error('❌ Server bind error:', err.message);
  console.error('  Code:', err.code);
  process.exit(1);
});

// Keep process alive
setInterval(() => {}, 1000);
