import mongoose, { Schema, Document } from 'mongoose';
import { IPost, PostType } from '../types/post';

export interface IPostDocument extends IPost, Document {
  _id: string;
}

const PostSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ['NEED', 'HAVE'],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  userId: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: false
  }
}, {
  timestamps: true,
  collection: 'posts'
});

// Indexes for efficient queries
PostSchema.index({ userId: 1, createdAt: -1 });
PostSchema.index({ type: 1, createdAt: -1 });
PostSchema.index({ content: 'text' }); // Text index for search functionality

export const Post = mongoose.model<IPostDocument>('Post', PostSchema);