import { Request, Response, NextFunction } from 'express';

export const validateRegisterFields = (req: Request, res: Response, next: NextFunction) => {
  const { email ,username, password, role } = req.body;

  if (!email || !username || !password || !role) {
    return res.status(400).json({ error: 'All fields are required: username, password, role' });
  }

  next();
};
export const validateLoginFields = (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
  
    // Additional validation logic can be added here
  
    next();
  };


export const validateMovieFields = (req: Request, res: Response, next: NextFunction) => {
  const { name, landmark, city, state, country } = req.body;

  // Check if all required fields are provided
  if (!name  || !landmark || !city || !state || !country) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  next();
};
export const validateforgotpassoword = (req: Request, res: Response, next: NextFunction) => {
  const { email} = req.body;

  // Check if all required fields are provided
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  next();
};