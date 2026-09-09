import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    name : {
        type : String,
        required : [true , "Please Enter Your Name"]
    },
    email : {
        type : String,
        unique : true,
        required : [true , "Please Enter Your Email"]
    },
    phone : {
        type : String,
        unique : true,
        required : [true , "Please Enter Your Phone"]},
    password : { 
        type : String,
        required : [true , "Please Enter Your Password"]},
    isActive :{
        type : Boolean,
        default : true,
        required : true
    },
    isAdmin : {
        type : Boolean,
        default : false,
        required : true
    },
    credits : {
        type : Number,
        default : 0,
        required : true
    }


}, {
    timestamps : true
})

const user = mongoose.model('User' , userSchema)

export default user