import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI
        if (!uri) {
            throw new Error("MONGO_URI or MONGODB_URI is not defined in .env file")
        }
        const conn = await mongoose.connect(uri)
        console.log(`DB CONNECTION SUCCESS : ${conn.connection.name}`.green)
    } catch (error) {
        console.log(`DB CONNECTION FAILED : ${error.message}`.bgRed.white)
    }
}



export default connectDB