import { VercelRequest, VercelResponse } from '@vercel/node';
import { v2 as cloudinary } from 'cloudinary';
import connectDB from '../_utils/db';
import Post from '../_utils/models/Post';
import User from '../_utils/models/User';
import { verifyToken } from '../_utils/auth';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await connectDB();

  try {
    switch (req.method) {
      case 'GET':
        await handleGet(req, res);
        break;
      case 'POST':
        await handlePost(req, res);
        break;
      default:
        res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in posts handler:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleGet(req: VercelRequest, res: VercelResponse) {
  const { userId, q, type } = req.query;
  let query: any = {};

  if (userId && typeof userId === 'string') {
    query.userId = userId;
  }

  if (type && typeof type === 'string' && ['NEED', 'HAVE'].includes(type.toUpperCase())) {
    query.type = type.toUpperCase();
  }

  if (q && typeof q === 'string' && q.trim()) {
    const searchQuery = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.content = { $regex: searchQuery, $options: 'i' };
  }

  const posts = await Post.find(query).sort({ createdAt: -1 });

  if (!userId) {
    const validUserIds = posts
      .map(post => post.userId)
      .filter(id => /^[0-9a-fA-F]{24}$/.test(id));

    const uniqueUserIds = [...new Set(validUserIds)];
      const users = await User.find({ _id: { $in: uniqueUserIds } }).select('username');
    const userMap = new Map(users.map(user => [user._id.toString(), user.username]));    const formattedPosts = posts.map(post => ({
      id: post._id.toString(),
      type: post.type,
      content: post.content,
      userId: post.userId,
      userName: userMap.get(post.userId) || 'Unknown User',
      createdAt: post.createdAt.toISOString(),
      imageUrl: post.imageUrl
    }));

    res.status(200).json(formattedPosts);
  } else {
    const user = await User.findById(userId).select('username');
    const userName = user ? user.username : 'Unknown User';

    const formattedPosts = posts.map(post => ({
      id: post._id.toString(),
      type: post.type,
      content: post.content,
      userId: post.userId,
      userName,
      createdAt: post.createdAt.toISOString(),
      imageUrl: post.imageUrl
    }));

    res.status(200).json(formattedPosts);
  }
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  // Extract user from token
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const { type, content, image } = req.body;

  // Validate input
  if (!type || !['NEED', 'HAVE'].includes(type)) {
    return res.status(400).json({ message: 'Invalid post type' });
  }

  if (!content?.trim()) {
    return res.status(400).json({ message: 'Content is required' });
  }

  let imageUrl;
  if (type === 'HAVE' && image) {
    try {
      // Upload base64 image to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: 'ace-mvp',
        resource_type: 'image'
      });
      imageUrl = uploadResponse.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return res.status(500).json({ message: 'Error uploading image' });
    }
  }

  // Create new post
  const newPost = new Post({
    type,
    content: content.trim(),
    userId: decoded.userId,
    imageUrl
  });

  const savedPost = await newPost.save();
  const user = await User.findById(decoded.userId).select('username');

  res.status(201).json({
    success: true,
    data: {
      id: savedPost._id.toString(),
      type: savedPost.type,
      content: savedPost.content,
      userId: savedPost.userId,
      userName: user ? user.username : 'Unknown User',
      createdAt: savedPost.createdAt.toISOString(),
      imageUrl: savedPost.imageUrl
    }
  });
}