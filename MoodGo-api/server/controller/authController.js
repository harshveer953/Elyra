import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/userModel.js"

const registerUser = async (req, res, next) => {
    try {
        const { name, email, phone, password } = req.body

        // Check if all fields are provided
        if (!name || !email || !phone || !password) {
            res.status(400)
            throw new Error("Please Enter All Fields (Name, Email, Phone, Password)")
        }

        const normalizedEmail = email.toLowerCase().trim()
        const normalizedPhone = phone.toString().trim()

        // Check if user exists
        let emailExist = await User.findOne({ email: normalizedEmail })
        let phoneExist = await User.findOne({ phone: normalizedPhone })

        if (emailExist) {
            res.status(400)
            throw new Error("User with this email already exists")
        }

        if (phoneExist) {
            res.status(400)
            throw new Error("User with this phone number already exists")
        }

        // Hash password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            phone: normalizedPhone,
            password: hashedPassword,
            credits: 5000 // Welcome credits so user can start booking immediately
        })

        if (!user) {
            res.status(400)
            throw new Error("User registration failed")
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isAdmin: user.isAdmin,
            isActive: user.isActive,
            credits: user.credits,
            token: generateToken(user._id)
        })
    } catch (error) {
        next(error)
    }
}


const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body

        // Check if all fields are coming 
        if (!email || !password) {
            res.status(400)
            throw new Error("Please Enter Both Email and Password")
        }

        const normalizedEmail = email.toLowerCase().trim()

        // Check if user exist
        let user = await User.findOne({ email: normalizedEmail })

        if (user && await bcrypt.compare(password, user.password)) {
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isAdmin: user.isAdmin,
                isActive: user.isActive,
                credits: user.credits,
                token: generateToken(user._id)
            })
        } else {
            res.status(401)
            throw new Error("Invalid email or password")
        }
    } catch (error) {
        next(error)
    }
}

// Private Controller

const privateController = (req , res) =>{ 
   
    res.send("Private Controller" + req.user.name)
}


// generate Token
export const generateToken = (id) => {
    return jwt.sign({id} , process.env.JWT_SECRET , { expiresIn: "5d"})
}

const authController = {registerUser , loginUser , privateController}

export default authController