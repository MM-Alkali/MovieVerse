import mongoose from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://db/My-Movie-App';

const db = async () => {
  try {
    await mongoose.connect(MONGODB_URL, {
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(`MongoDB connection error: ${err}`);
    process.exit(1);
  }
};

export default db;
