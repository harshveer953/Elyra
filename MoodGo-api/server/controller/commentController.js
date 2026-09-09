import Comment from "../models/commentModel.js"
import Event from "../models/eventModel.js"



const getAllComments = async (req,res) => {

    const eventId = req.params.eid
    

    const comments = await Comment.find({event : eventId}).populate('user').populate('event')

    if (!comments) {
        res.status(404)
        throw new Error("Comments Not Found!!")
    }

    res.status(200).json(comments)

}


const addComment = async (req,res) => {

    const {text , rating} = req.body

    if (!text || !rating) {
        res.status(409)
        throw new Error("Please Enter Comment And Rating!!")
    }

   const eventId = req.params.eid
   const userId = req.user._id 

   const event = await Event.findById(eventId)

   if (!event) {
        res.status(404)
        throw new Error("Event Not Found!!");
        
   }

   const newComment = new Comment({

        user : userId,
        event: eventId,
        text: text,
        rating: rating

   })

   await newComment.save()
   await newComment.populate('user')
   await newComment.populate('event')

   if (!newComment) {
        res.status(409)
        throw new Error("Comment Not Found!!")
   }

   res.status(201).json(newComment)


}


const commentController = {getAllComments , addComment}

export default commentController