import mongoose, { Schema, Document, Model } from 'mongoose';
import { compare } from 'bcryptjs';

// Define User interface
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    password: string;
    avatarUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// Create User schema
const UserSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        avatarUrl: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Add password comparison method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    try {
        return await compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Create the User model type
interface UserModel extends Model<IUser> {
    // Add any static methods here if needed
}

// Export User model (handle mongoose.models.User for hot reloading in development)
export const User = (mongoose.models.User as UserModel) || mongoose.model<IUser, UserModel>('User', UserSchema);

export default User;