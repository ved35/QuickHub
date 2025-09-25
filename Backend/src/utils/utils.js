import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateToken = (userId, admin, res) => {
  const token = jwt.sign(
    { id: userId, isAdmin: admin },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );

  res.cookie('jwt', token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
  });

  return token;
};
