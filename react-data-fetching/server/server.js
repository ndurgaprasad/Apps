import express from 'express';
import { tickets } from './data/tickets.js';

const app = express();
const port = Number(process.env.PORT || 3001);
const responseDelayMs = 800;

app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (request.method === 'OPTIONS') return response.sendStatus(204);
  next();
});

app.get('/api/tickets', async (request, response) => {
  await new Promise((resolve) => setTimeout(resolve, responseDelayMs));

  if (request.query.fail === 'true') {
    return response.status(500).json({ message: 'Simulated support ticket service failure' });
  }

  response.json({ tickets });
});

app.listen(port, () => {
  console.log(`Support ticket API listening at http://localhost:${port}`);
});
