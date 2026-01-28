import express from 'express';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
const app = express();
app.use(express.json());
const JWT_SECRET = "super-secret-key-123";
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = { id: "user_99", email: email };
  const token = jwt.sign(
    { userId: user.id, email: user.email }, 
    JWT_SECRET, 
    { expiresIn: '1h' }
  );
  res.json({ accessToken: token });
});

app.listen(4000, () => console.log("Auth Service running on port 4000"));