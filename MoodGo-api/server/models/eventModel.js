import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    // fields...
    user: {
        type : mongoose.Schema.Types.ObjectId,
         ref : "User",
        required : true,
    },
    title : {
        type : String,
        required : [true , "Please Enter Event Title"],
    },
    description : {
         type : String,
        required : [true , "Please Enter Event Description"],
    },
    eventImage : {
         type : String,
        required : [true , "Please Enter Event Image URL"],
    },
    eventDate : {
         type : String,
        required : [true , "Please Enter Event Date"],
    },
    eventLocation : {
         type : String,
        required : [true , "Please Enter Event Location"],
    },
    eventArtistName : {
         type : String,
        required : [true , "Please Enter Event Artist Name"],
    },
    totalSeats : {
         type : Number,
        required : [true , "Please Enter Event Seats"],
    },
    duration : {
         type : String,
        required : [true , "Please Enter Event Duration"],
    },
    ticketPrice : {
         type : Number ,
        required : [true , "Please Enter Event Title"],
    },
     status : {
        type : String,
        enum : ['upcoming', 'ongoing', 'cancelled', 'expired'],
        required : true,
        default : 'upcoming'
    },
    isActive : {
        type : Boolean,
        required : true,
        default : false,
    },

  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;




 