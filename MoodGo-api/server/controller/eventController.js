import fs from "node:fs"
import uploadToCloudinary from "../middleware/cloudinaryMiddleware.js"
import Event from "../models/eventModel.js"

const createEvent = async (req , res) => {
   

    const { title ,
         description ,
         eventDate ,
         eventLocation ,
         eventArtistName ,
         totalSeats , 
         duration , 
         ticketPrice } = req.body

    if ( !title || !description || !eventDate || !eventLocation || !eventArtistName || !totalSeats || !duration || !ticketPrice) {
        res.status(409)
        throw new Error("Please Enter All Fields")
    }

    // upload to cloudinary
   const uploadResult = await uploadToCloudinary(req.file.path)
   

   
   // Remove image from server
    fs.unlinkSync(req.file.path)

    // creat event
    const newEvent = await Event.create({ user: req.user._id , title , description , eventDate , eventLocation , eventArtistName , totalSeats , duration , ticketPrice , eventImage : uploadResult.secure_url})
   
    // console.log(newEvent)

    if (!newEvent) {
        res.status(400)
        throw new Error("Event Not Created")
    }
       
    res.status(201).json(newEvent)
}

// Get Events
const getEvents = async (req,res) => {

    //find Events
    const events = await Event.find()

    if (!events) {
        
        res.status(404)
        throw new Error("Events Not Found")
    }

    const activeEvents = events.filter(event => event.isActive)

    res.status(200).json(activeEvents)

}


// Get Single Event
const getEvent = async (req,res) => {

    //find Event
    const event = await Event.findById(req.params.eid)

    if (!event) {
        
        res.status(404)
        throw new Error("Event Not Found")
    }

    if (!event.isActive) {
        res.status(404)
        throw new Error("Event is Not active Yet!")
    }


    res.status(200).json(event)

}


const eventController = {createEvent, getEvents , getEvent}

export default eventController