import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Cloud Run / AI Studio NGINX proxies incoming traffic to port 3000
const PORT = 3000;

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SmartGST AI running on http://0.0.0.0:${PORT}`);
});
