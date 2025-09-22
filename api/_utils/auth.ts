import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends VercelRequest {
  user?: {
    id: string;
    email: string;
    username?: string;
  };
}

export async function verifyToken(req: AuthenticatedRequest): Promise<boolean> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret');
    
    if (typeof decoded === 'object' && decoded !== null) {
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        username: decoded.username
      };
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}