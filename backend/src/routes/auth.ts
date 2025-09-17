import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { RegisterRequest, LoginRequest, AuthResponse } from '../types/post';

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('name')
    .isString()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Helper function to generate JWT token
const generateToken = (userId: string, email: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwt.sign(
    { userId, email },
    jwtSecret,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

// POST /api/register
router.post('/register',
  validateRegistration,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { name, email, password }: RegisterRequest = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
        return;
      }

      // Create new user
      const newUser = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password
      });

      // Save user (password will be hashed by pre-save middleware)
      const savedUser = await newUser.save();

      // Generate JWT token
      const token = generateToken(savedUser._id.toString(), savedUser.email);

      // Return success response
      const response: AuthResponse = {
        success: true,
        message: 'User registered successfully',
        user: {
          id: savedUser._id.toString(),
          name: savedUser.name,
          email: savedUser.email
        },
        token
      };

      res.status(201).json(response);

    } catch (error) {
      console.error('Registration error:', error);

      // Handle MongoDB duplicate key error
      if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
        res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
        return;
      }

      // Handle validation errors from Mongoose
      if (error instanceof Error && error.name === 'ValidationError') {
        res.status(400).json({
          success: false,
          message: 'Invalid data provided',
          error: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }
  }
);

// POST /api/login
router.post('/login',
  validateLogin,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { email, password }: LoginRequest = req.body;

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
        return;
      }

      // Generate JWT token
      const token = generateToken(user._id.toString(), user.email);

      // Return success response
      const response: AuthResponse = {
        success: true,
        message: 'Login successful',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email
        },
        token
      };

      res.status(200).json(response);

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  }
);

export default router;