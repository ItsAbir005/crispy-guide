import express from 'express';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { redisClient } from '../../api-gateway/redis.js';
const app = express();
app.use(express.json());
const JWT_SECRET = "super-secret-key-123";
app.post('/login', async (req, res) => {
  const userId = "user_99";
  const accessToken = jwt.sign({ userId }, "secret", { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, "refresh-secret", { expiresIn: '7d' });
  await redisClient.set(`session:${userId}`, refreshToken, 'EX', 7 * 24 * 60 * 60);
  res.json({ accessToken, refreshToken });
});
app.post('/logout', async (req, res) => {
  const { userId } = req.body;
  await redisClient.del(`session:${userId}`);
  res.json({ message: "Logged out from all devices!" });
});
app.post('/refresh', async (req, res) => {
  const { userId, refreshToken } = req.body;
  const savedToken = await redisClient.get(`session:${userId}`);
  if (savedToken !== refreshToken) {
    return res.status(403).json({ error: "Session expired. Please log in again." });
  }
  const newAccessToken = jwt.sign({ userId }, "secret", { expiresIn: '15m' });
  res.json({ accessToken: newAccessToken });
});
app.listen(4000, () => console.log("Auth Service running on port 4000"));