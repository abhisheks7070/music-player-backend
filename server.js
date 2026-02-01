const express = require('express');
const cors = require('cors');
const handler = require('./api/convert');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Mock Vercel req/res objects for the handler
app.all('/api/convert', async (req, res) => {
    console.log(`[${new Date().toISOString()}] ${req.method} /api/convert`);

    // Vercel handlers are (req, res) => void
    // We need to match the Vercel API surface area
    await handler(req, res);
});

app.listen(port, () => {
    console.log(`Local backend server running at http://localhost:${port}`);
    console.log(`For Android Emulator, use http://10.0.2.2:${port}`);
});
