import express from 'express'
import auth from '../middleware/auth.js'
import { getConversations, getMessage, sendMessage } from '../controllers/messageController.js'

const router = express.Router()

router.post('/:recepient', auth, sendMessage)
router.get('/conversations', auth, getConversations)
router.get('/:conversationId/messages', auth, getMessage);

export default router