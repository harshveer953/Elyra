import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({

    couponCode : {
        type : String,
        required : true
    },
    couponDiscount : {
        type : Number,
        required : true
    },
    isActive : {
        type : Boolean,
        default : true,
        required : true
    }


},{
    timestamps : true
})


const Coupon = mongoose.model("Coupon" , couponSchema)

export default Coupon