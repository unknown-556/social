import express from "express";
const router = express.Router()

import { createPost, getAllPosts, getSinglePost, replyToPost, likeUnlikePost, deletePost  } from "../controllers/postController.js";
import auth from "../middleware/auth.js";
import upload from "../config/cloudinary.js";


router.post('/add', upload.fields([
    { name: 'img', maxCount: 10 },
    { name: 'vid', maxCount: 2 },
]), createPost)

router.get("/", auth, getAllPosts)
router.get("/:id", auth, getSinglePost)
router.delete("/:id", auth, deletePost)
router.put("/like/:id", auth, likeUnlikePost);
router.put("/reply/:id", auth, replyToPost);

export default router