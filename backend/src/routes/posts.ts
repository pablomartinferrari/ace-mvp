import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { Post } from '../models/Post';
import { User } from '../models/User';
import { CreatePostRequest, Post as PostInterface, PostType } from '../types/post';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Validation middleware
const validatePostData = [
  body('type')
    .isIn(['NEED', 'HAVE'])
    .withMessage('Type must be either NEED or HAVE'),
  body('content')
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Content must be a string between 1 and 1000 characters')
];

// GET /api/posts
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, q, type } = req.query;

    // Build the query based on parameters
    let query: any = {};

    // User ID filter
    if (userId && typeof userId === 'string') {
      query.userId = userId;
    }

    // Type filter (NEED or HAVE)
    if (type && typeof type === 'string' && ['NEED', 'HAVE'].includes(type.toUpperCase())) {
      query.type = type.toUpperCase();
    }

    // Text search
    if (q && typeof q === 'string' && q.trim()) {
      const searchQuery = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex special characters
      query.content = { $regex: searchQuery, $options: 'i' }; // Case-insensitive search
    }

    // Fetch posts with filters
    const posts = await Post.find(query)
      .sort({ createdAt: -1 }); // Always sort by creation date, newest first

    // If fetching all posts, get user information for all users
    if (!userId) {
      // Get all unique user IDs from posts, filtering out invalid ObjectIds
      const validUserIds = posts
        .map(post => post.userId)
        .filter(userId => {
          // Check if userId is a valid ObjectId (24 hex characters)
          return /^[0-9a-fA-F]{24}$/.test(userId);
        });

      const uniqueUserIds = [...new Set(validUserIds)];

      // Fetch user information for valid user IDs
      let users = [];
      try {
        users = await User.find({ _id: { $in: uniqueUserIds } }).select('name');
      } catch (userError) {
        console.error('Error fetching users:', userError);
        // If there's an error fetching users, continue with empty array
        users = [];
      }

      // Create a map of userId to userName
      const userMap = new Map();
      users.forEach(user => {
        userMap.set(user._id.toString(), user.name);
      });

      // Format response to match frontend expectations
      const formattedPosts = posts.map(post => ({
        id: post._id.toString(),
        type: post.type as PostType,
        content: post.content,
        userId: post.userId,
        userName: userMap.get(post.userId) || 'Unknown User',
        createdAt: post.createdAt.toISOString(),
        imageUrl: post.imageUrl
      }));

      res.status(200).json(formattedPosts);
    } else {
      // If filtering by userId, get user name for that specific user
      const user = await User.findById(userId).select('name');
      const userName = user ? user.name : 'Unknown User';

      // Format response for user's posts
      const formattedPosts = posts.map(post => ({
        id: post._id.toString(),
        type: post.type as PostType,
        content: post.content,
        userId: post.userId,
        userName,
        createdAt: post.createdAt.toISOString(),
        imageUrl: post.imageUrl
      }));

      res.status(200).json(formattedPosts);
    }

  } catch (error) {
    console.error('Error fetching posts:', error);

    // Handle MongoDB connection errors
    if (error instanceof Error && error.name === 'MongoError') {
      res.status(500).json({
        success: false,
        message: 'Database connection error'
      });
      return;
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/posts
router.post('/',
  authenticateToken,
  upload.single('image'), // Handle single image file upload
  validatePostData,
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

      const { type, content }: CreatePostRequest = req.body;
      const userId = req.user!.id; // Get user ID from authenticated user

      // Get user name for the response
      const user = await User.findById(userId).select('name');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Handle image upload for "HAVE" posts
      let imageUrl: string | undefined;
      if (type === 'HAVE' && req.file) {
        // Generate URL for the uploaded image
        imageUrl = `/uploads/${req.file.filename}`;
      }

      // Create new post
      const newPost = new Post({
        type,
        content: content.trim(),
        userId,
        imageUrl
      });

      // Save to database
      const savedPost = await newPost.save();

      // Format response
      const response: PostInterface = {
        id: savedPost._id.toString(),
        type: savedPost.type as PostType,
        content: savedPost.content,
        userId: savedPost.userId,
        userName: user.name,
        createdAt: savedPost.createdAt.toISOString(),
        imageUrl: savedPost.imageUrl
      };

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: response
      });

    } catch (error) {
      console.error('Error creating post:', error);

      // Handle multer errors
      if (error instanceof Error && error.name === 'MulterError') {
        if (error.message.includes('File too large')) {
          res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB.'
          });
          return;
        }
        res.status(400).json({
          success: false,
          message: 'File upload error'
        });
        return;
      }

      // Handle file filter errors
      if (error instanceof Error && error.message === 'Only image files are allowed') {
        res.status(400).json({
          success: false,
          message: 'Only image files are allowed'
        });
        return;
      }

      // Handle MongoDB connection errors
      if (error instanceof Error && error.name === 'MongoError') {
        res.status(500).json({
          success: false,
          message: 'Database connection error'
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

      // Generic server error
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// DELETE /api/posts/:id
router.delete('/:id',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Find the post and check if it belongs to the authenticated user
      const post = await Post.findById(id);
      if (!post) {
        res.status(404).json({
          success: false,
          message: 'Post not found'
        });
        return;
      }

      // Check if the post belongs to the authenticated user
      if (post.userId !== userId) {
        res.status(403).json({
          success: false,
          message: 'You can only delete your own posts'
        });
        return;
      }

      // Delete the post
      await Post.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Post deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting post:', error);

      // Handle MongoDB connection errors
      if (error instanceof Error && error.name === 'MongoError') {
        res.status(500).json({
          success: false,
          message: 'Database connection error'
        });
        return;
      }

      // Generic server error
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

export default router;