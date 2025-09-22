import mongoose from 'mongoose';

// Track the connection state globally
let isConnected = false;

export const connectDB = async () => {
    // If already connected, reuse the connection
    if (isConnected) {
        return;
    }

    // Get the MongoDB URI from environment variables
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
    }

    try {
        if (mongoose.connections[0].readyState) {
            isConnected = true;
            console.log('Using existing MongoDB connection');
            return;
        }

        // Set up mongoose options for serverless environment
        const options = {
            // Set a shorter timeout for serverless functions
            serverSelectionTimeoutMS: 5000,
            // Auto create indexes in production is usually not recommended
            autoIndex: process.env.NODE_ENV !== 'production'
        };

        // Connect to MongoDB
        await mongoose.connect(mongoURI, options);
        isConnected = true;
        console.log('New MongoDB connection established');

    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

export default connectDB;