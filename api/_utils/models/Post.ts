import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  type: 'NEED' | 'HAVE';
  content: string;
  userId: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema({
  type: {
    type: String,
    enum: ['NEED', 'HAVE'],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  }
}, {
  timestamps: true
});

export const Post = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;