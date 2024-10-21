import { IUser } from '../models/User';
import jwt from 'jsonwebtoken';
export const generateAccessToken = (user: IUser) => {
    return jwt.sign(
      { id: user._id, isAdmin: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24m' }
    );
  };

  export  const generateRefreshToken = (user: IUser) => {
    return jwt.sign(
      { id: user._id, isAdmin: user.role },
      process.env.REFRESH_TOKEN!,
      { expiresIn: '30d' }
    );
  };
  