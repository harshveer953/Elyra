import express from 'express'
import commentController from '../controller/commentController.js'
import Protect from '../middleware/authMiddleware.js'


const router = express.Router()

router.get('/:eid' , commentController.getAllComments)
router.post('/:eid' , Protect.forUser , commentController.addComment)




export default router