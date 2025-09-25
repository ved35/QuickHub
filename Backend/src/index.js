import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './utils/db.js';
import userRouter from './router/user.route.js';
import authRouter from './router/auth.route.js';

dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    status: 'error',
    message: message,
  });
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Sever is listing to port ${PORT}`);
});
