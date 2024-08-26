import express  from "express";
import { getAllUsers, getSingleUser, getSuggestedUsers, updateProfilePic, reportUser, followAndUnfollow, freezeAccount, unfreezeAccount } from "../controllers/userController.js";
import upload from "../config/cloudinary.js";
import auth from "../middleware/auth.js";
import { checkAdminRole } from "../middleware/checkRole.js";

const router = express.Router()

router.get("/", getAllUsers)
router.get("/:id", auth, getSingleUser)
router.post("/suggestions", auth, getSuggestedUsers)
router.post("/follow/:id", auth, followAndUnfollow);
router.put('/profile-pic', upload.single('profilePic'), updateProfilePic);
router.post('/report', auth, reportUser);

router.put("/freeze/:id", checkAdminRole('admin'), freezeAccount);

router.put("/unfreeze/:id", checkAdminRole('admin'), unfreezeAccount);

export default router