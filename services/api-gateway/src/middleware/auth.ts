import type{ Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "No ID card (Token) found!" });

  try {
    const decoded = jwt.verify(token, "super-secret-key-123");
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired ID card!" });
  }
};