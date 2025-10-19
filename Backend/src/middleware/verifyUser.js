import jwt from 'jsonwebtoken';
import { errorHandler } from './errorHandler.js';

export const verifyToken = (req, res, next) => {
  let token = req?.cookies?.jwt || req.headers.authorization;
  
  if (req?.headers?.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  console.log('Token :', token);

  if (!token) {
    return next(errorHandler(401, 'Unauthorized'));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(errorHandler(401, 'Unauthorized'));
    }
    req.user = user;
    next();
  });
};
