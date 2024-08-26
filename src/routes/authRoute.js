import express, { Router } from "express";
const router = express.Router()

import { signUp, signIn, logout } from "../controllers/authController.js";
import upload from "../config/cloudinary.js";

router.post('/signup', upload.fields([{ name: 'profilePic', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }]), signUp);
router.post("/login", signIn)
router.post('/logout', logout);

export default router