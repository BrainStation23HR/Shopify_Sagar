// web/db/connection.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root (two levels up from /web/db)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const uri = process.env.MONGO_URI;

export const connectDB = async () => {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
    }
};
