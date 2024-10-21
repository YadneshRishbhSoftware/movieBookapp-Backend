// src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { IUser } from '../models/User'; // Import IUser interface
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken } from '../helper/generateAccessToken';
import crypto from 'crypto'; // To generate random token
import { sendPasswordResetEmail } from '../helper/sendPasswordResetEmail';
interface ResetPasswordRequest extends Request {
  params: {
    token: string;
  };
}
export const register = async (req: Request, res: Response) => {
  const {email , username, password, role } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create a new user
    const newUser = new User({email, username, password: hashedPassword, role });
    await newUser.save();

    // Respond with success message
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    // Log the error and respond with server error message
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const {  email, password } = req.body;

  try {
    const user = await User.findOne({ email }) as IUser; // Type assertion here
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

   // Generate tokens
   const token = generateAccessToken(user);
   const refreshToken = generateRefreshToken(user);

   user.refreshToken = refreshToken;
   await user.save();

   const userWithoutPassword = {
     _id: user._id,
     email: user.email,
     role: user.role,
   };

   res.json({ token, refreshToken, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Refresh Token Controller
export const refreshToken = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN!);

    const user = await User.findById((decoded as any).id);
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Generate a new access token
    const newAccessToken = generateAccessToken(user);
    res.json({ token: newAccessToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};
// Forgot Password Controller
export const forgotPassword = async (req: Request, res: Response) => {
  const { email }: { email: string } = req.body;

  try {
    
    const user: IUser | null = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token and expiration time
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const resetPasswordExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes

    
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();
    // http://localhost:4000/api/auth/resetPassword/ef169316b4a8e1a215696616012d237b1eec9646e2de0e76b2c68014932126f2
   
    const resetURL = `http://localhost:3000/resetPassword/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetURL);

    res.status(200).json({
      message: `Password reset link sent to ${user.email}. It will expire in 10 minutes.`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
export const resetPassword = async (req: ResetPasswordRequest , res: Response) => {
  const { token }: { token: string } = req.params;
  const { password }: { password: string } = req.body;

  try {
    // Hash the token and search the user by token and check if it's not expired
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user: IUser | null = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Check if the token is not expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired.' });
    }

    // Hash the new password and update the user
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};