import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@zksnapdatabase.vquczha.mongodb.net/?retryWrites=true&w=majority`
    );
    console.log(`[database]: MongoDB host URI - ${conn.connection.host}`);
  } catch (error: any) {
    console.log(`Error : ${error.message}`);
    process.exit(1);
  }
};
