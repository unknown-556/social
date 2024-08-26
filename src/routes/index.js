import express from "express";
import authRoute from '../routes/authRoute.js'
import userRoute from '../routes/userRoute.js'
import postRoute from '../routes/postRoute.js'
import messageRoute from '../routes/messageRoute.js'
import reportRoute from '../routes/reportRoute.js';

const router = express.Router()

router.use('/auth', authRoute)
router.use('/user', userRoute)
router.use('/post', postRoute)
router.use('/messages', messageRoute)
router.use('/report', reportRoute);

export default router;