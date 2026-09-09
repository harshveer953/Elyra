import express from 'express'
import protect from '../middleware/authMiddleware.js'
import oredrController from '../controller/orderController.js'



const router = express.Router()

router.post("/:eid" , protect.forUser, oredrController.bookTicket)
router.put("/:tid" , protect.forUser, oredrController.cancelTicket)
router.get("/" , protect.forUser, oredrController.getTickets)
router.get("/:tid" , protect.forUser, oredrController.getTicket)

export default router