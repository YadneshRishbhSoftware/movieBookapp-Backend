import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define your JWT payload interface
interface UserPayload {
  id: string;
  username: string;
  // Add more fields as per your JWT payload structure
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET!, (err, decodedToken) => {
      if (err) {
        return res.sendStatus(403);
      }
      
      // Type assertion to UserPayload
      req.user = decodedToken as UserPayload;
      next();
    });
  } else {
    res.sendStatus(401);
  } 
};
export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Implement your admin check logic here (e.g., role-based authentication)
  const isAdminUser = true; // Example: Replace with your admin check logic

  if (!isAdminUser) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  next();
};

