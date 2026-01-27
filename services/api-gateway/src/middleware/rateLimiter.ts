import type { Request, Response, NextFunction } from 'express';
import { redisClient } from '../redis.ts';
export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip;
  const key = `rate-limit:${ip}`;
  const limit = 5; 
  const duration = 60; 
  const currentRequests = await redisClient.incr(key);
  if (currentRequests === 1) {
    await redisClient.expire(key, duration);
  }
  if (currentRequests > limit) {
    return res.status(429).json({
      error: "Too many requests. Please try again in a minute.",
    });
  }
  next();
};