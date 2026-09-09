import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import colors from "colors"

// Local Imports
import connectDB from "./config/dbConfig.js"
import errorHandler from "./middleware/errorHandler.js"
import authRoutes from "./routes/authRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import eventRoutes from "./routes/eventRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import commentRoutes from "./routes/commentRoutes.js"
import giveAnswer from "./controller/chatController.js"
import protect from "./middleware/authMiddleware.js"


dotenv.config()

//DB connection
connectDB()

const PORT = process.env.PORT || 8080
const app = express()

// CORS
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

//body-parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Default Route
app.get("/" , (req , res) => {
    res.json({
        message : "WELCOME TO MOODGO API"
    })
})



// Auth Routes
app.use("/api/auth" , authRoutes)


// Admin Routes
app.use('/api/admin' , adminRoutes)

// Event routes
app.use('/api/events' , eventRoutes)

// Ticket Booking routes
app.use('/api/order' , orderRoutes)


// Comments Routes
app.use('/api/comment' , commentRoutes)


// Chat Route
app.post('/api/chat' , protect.forUser , giveAnswer)


// error handler
app.use(errorHandler)

app.listen(PORT , () => console.log(`SERVER IS RUNNING AT PORT : ${PORT}`.bgBlue.white ))