import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  type: 'NEED' | 'HAVE';
  content: string;
  userId: mongoose.Types.ObjectId;
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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