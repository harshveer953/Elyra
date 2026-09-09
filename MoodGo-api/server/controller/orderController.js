import Coupon from "../models/couponModel.js"
import Event from "../models/eventModel.js"
import Order from "../models/orderModel.js"
import User from "../models/userModel.js"



const getTickets = async (req, res) => {
    
    const myTickets = await Order.find({user : req.user._id}).populate('user').populate('event')

    if (!myTickets) {
        res.status(404)
        throw new Error("Tickets Not Found")
    }

    res.status(200).json(myTickets)


}

const getTicket = async (req, res) => {
     
    const myTicket = await Order.findById(req.params.tid).populate('user').populate('event')

    if (!myTicket) {
        res.status(404)
        throw new Error("Ticket Not Found")
    }

    res.status(200).json(myTicket)
}


const bookTicket = async (req, res) => {

        let userId = req.user._id


    const {numberOfSeats , couponCode} = req.body

    if(!numberOfSeats ){
        res.status(409)
        throw new Error("Kindly select Atleast 1 Seats")
    }

    // Check if event exists
   const eventId = req.params.eid

   const event = await Event.findById(eventId)

   if(!event){
    res.status(404)
    throw new Error("Event Not Found")
   }

   // check if seats available
   if(event.totalSeats < numberOfSeats || numberOfSeats > 5){
    res.status(409)
    throw new Error("Seats Not Available");
    
   }

   // Checks if user have already booked 5 seats 
   const allpreviousOrder = await Order.find({event: event._id})

   // filter my order by events 
   const myOrders = allpreviousOrder.filter((Order) => Order.user.toString() === userId.toString())

   // Calculate Total Seats Booked

   let myExistingBookedSeats = myOrders
   .filter((order) => order.status !== "cancelled")
   .reduce((acc , order) => acc + order.seats, 0)
   
   
    

   if (myExistingBookedSeats + parseInt(numberOfSeats) >  5) {
      res.status(409)
      throw new Error(`Only 5 Seats Allowed Per User! ${5 - myExistingBookedSeats} Seats Left`)

   }


   // Checks if request is coming with coupon

   let couponExist
   if (couponCode) {
    // Checks if coupon is valid
    couponExist  = await Coupon.findOne({couponCode})

     if (!couponExist) {
        res.status(404)
        throw new Error("Coupon Not Exists")
     }
   }

   const totalBillAmount = couponCode ? (event.ticketPrice - (event.ticketPrice * couponExist.couponDiscount /100 ) * numberOfSeats): event.ticketPrice * numberOfSeats

   // Find User
   let user = await User.findById(userId)


   if (totalBillAmount > user.credits) {
        res.status(409)
        throw new Error("Not Enough Credits!")
   }

   
   let order = await Order.create({
    user : req.user.id,
    event : eventId,
    seats : numberOfSeats,
    status : "confirmed",
    isDiscounted: couponCode ? true : false,
    billedAmount: totalBillAmount
   })

  // Decrease Available Seats

  let updatedSeats = event.totalSeats - numberOfSeats
  await Event.findByIdAndUpdate(event._id, {totalSeats : updatedSeats} , {new : true})


  // Decrease credits
  await User.findByIdAndUpdate(userId , {credits : user.credits - totalBillAmount} , {new : true})


  if (!order) {
    res.status(409)
    throw new Error("Order Not Accepted")

  }

  res.status(201).json(order)
 
}


const cancelTicket = async (req,res) => {

    let userId = req.user._id
   
   // Find Ticket 
   const ticketId = req.params.tid


   let ticket = await Order.findById(ticketId)

   if (!ticket) {
        res.status(404)
        throw new Error("Ticket Not Found!!")
   }

   if (ticket.status === "cancelled") {
        res.status(400)
        throw new Error("Ticket Already cancelled")
   }


      // Find User
   let user = await User.findById(userId)

    // Find Event
   const event = await Event.findOne(ticket.event)

   

   // Checks Ticket Status
   if (ticket.status === "expired") {
        res.status(409)
        throw new Error("Ticket Already Expired!")
   }

     // Increase Available Seats

  let updatedSeats = event.totalSeats + ticket.seats
  await Event.findByIdAndUpdate(event._id, {totalSeats : updatedSeats} , {new : true})

   
     // Increase credits
  await User.findByIdAndUpdate(userId , {credits : user.credits + ticket.billedAmount  } , {new : true})


   const updatedTicket = await Order.findByIdAndUpdate(ticket._id , {status : "cancelled"} , {new : true})

   if (!updatedTicket) {
        res.status(409)
        throw new Error("Ticket Not Cancelled")
   }

   res.status(200).json(updatedTicket)
}

const oredrController = {
    bookTicket,
    cancelTicket,
    getTickets,
    getTicket
}


export default oredrController