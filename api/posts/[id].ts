import { VercelRequest, VercelResponse } from '@vercel/node';
import connectDB from '../../_utils/db';
import Post from '../../_utils/models/Post';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Get post ID from URL
    const id = req.query.id as string;
    if (!id) {
      return res.status(400).json({ message: 'Post ID is required' });
    }

    // Verify authentication (implement your auth logic here)
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get the post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Verify ownership (implement your auth logic here)
    // if (post.userId !== req.user.id) {
    //   return res.status(403).json({ message: 'Not authorized to delete this post' });
    // }

    // Delete the post
    await Post.findByIdAndDelete(id);

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}