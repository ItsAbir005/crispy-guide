import express from 'express';
import type { OrderStatus } from "../../shared/types/order.js";
import { rateLimiter } from './src/middleware/rateLimiter.js';
import type { Request, Response } from "express";
const app = express();
app.use(express.json());
app.use(rateLimiter);
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - [${req.method}] ${req.url}`);
  next();
});
const port = 3000;
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: "Gateway is active" });
});
app.post('/orders', (req, res) => {
  const status: OrderStatus = "PENDING";
  if (!req.body.price) {
    return res.status(400).json({ error: "Price is required!" });
  }
  res.json({ status, receivedPrice: req.body.price });
});
app.listen(port, () => {
  console.log(` Gateway guarding on http://localhost:${port}`);
});