import express from 'express';
import type { Request, Response } from "express";
const app = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('The Gateway is open! 🚀');
});

app.listen(port, () => {
  console.log(`Gateway is running at http://localhost:${port}`);
});