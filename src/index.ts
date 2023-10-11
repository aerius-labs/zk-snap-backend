import express from 'express';
import dotenv from 'dotenv';

import { connectDB } from './config/database';

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT;

app.get('/', (req, res) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
