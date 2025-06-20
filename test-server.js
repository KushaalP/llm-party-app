import express from 'express';

const app = express();
const PORT = 5174;

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Test Server</title></head>
      <body>
        <h1>Test Server Running!</h1>
        <p>If you see this, the server is working.</p>
      </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`Network access: http://0.0.0.0:${PORT}`);
});