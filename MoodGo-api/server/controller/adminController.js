import Coupon from "../models/couponModel.js"
import Event from "../models/eventModel.js"
import Order from "../models/orderModel.js"
import User from "../models/userModel.js"


const getAllUsers = async (req , res) => {
   
    const users = await User.find()

    if (!users) {
        res.status(404)
        throw new Error("Users Not Found")
    
    }else{
        res.status(200).json(users)
    }
}


const updateUser = async (req,res) => {

    // let {status , credit} = req.body

    const userId = req.params.uid




    const updatedUser = await User.findByIdAndUpdate(userId , req.body , {new : true})

    if (!updatedUser) {
        res.status(409)
        throw new Error("User Not Found!")
    }

    res.status(200).json(updatedUser)


}


const getAllEvents = async (req , res) => {

    const events = await Event.find().populate('user')

    if (!events) {
        res.status(404)
        throw new Error("Events Not Found")
    
    }else{
        res.status(200).json(events)
    }
}


const updateEvent = async(req , res) => {

    const eventId = req.params.eid

    const updatedEvent = await Event.findByIdAndUpdate(eventId , req.body , {new : true}).populate('user')

    if (!updatedEvent) {
        res.status(409)
        throw new Error("Event Not Updated!")
    }

    res.status(200).json(updatedEvent)


}

const getAllRatings = (req , res) => {
    res.send("All Ratings!!")
}

const getAllOrders = async (req , res) => {
    const orders = await Order.find()

    if (!orders) {
        res.status(404)
        throw new Error("Order Not Found")
    }

    res.status(200).json(orders)
}


const createCoupon = async (req,res) => {
    const {couponCode , couponDiscount} = req.body

    if (!couponCode || !couponDiscount) {
        res.status(409)
        throw new Error("Please Enter All details")
    }

    // check if coupon is already exist
    const couponExist = await Coupon.findOne({couponCode : couponCode})

    if (couponExist) {
        res.status(409)
        throw new Error("Coupon Already Exist")
}

    const newCoupon = await Coupon.create({couponCode , couponDiscount})

    if (!newCoupon) {
        res.status(409)
        throw new Error("Coupon Not Created")
    }

    res.status(201).json(newCoupon)
}




const getAllCoupans =async (req , res) => {
    
    const coupons = await Coupon.find()

    if (!coupons) {
        res.status(404)
        throw new Error("Coupons Not Found")
    }

    res.status(200).json(coupons)
}


const updateCoupon = async (req, res) => {

    const updatedcoupon = await Coupon.findByIdAndUpdate(req.params.cid , req.body , {new:true})

    if (!updatedcoupon) {
        res.status(409)
        throw new Error("Coupon Not Updated")

    }

    res.status(200).json(updatedcoupon)


}

const adminController = {getAllUsers , getAllEvents , getAllRatings , getAllOrders , getAllCoupans , updateEvent , createCoupon , updateCoupon , updateUser}

export default adminController