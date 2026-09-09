import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({

    event : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Event",
        required : true
    },
    user : {
         type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    text : {
         type : String,
         required : true
    },
    rating : {
         type : Number,
         default: 5,
         required : true
    }


},{
    timestamps : true
})


const Comment = mongoose.model("Comment" , commentSchema)

export default Comment