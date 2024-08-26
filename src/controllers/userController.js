import User from "../models/userModel.js";
import { v2 as cloudinary } from 'cloudinary';
import Report from "../models/reportModel.js";
import dotenv from 'dotenv'

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find()
        if (!allUsers) {
        res.status(400).json({message: 'No users found in database'})
    }   else {
        res.status(200).json({message: 'Users found successfully', allUsers})
    }
    }   catch (error) {
        console.error('Error while getting all users:',error);
        res.status(500).json({message: error.messaage})
    }
}

export const getSingleUser = async (req, res) => {
    try {
        const userId = req.params.id
        const singleUser = await User.findById(userId)
        if (!singleUser) {
        res.status(400).json({message: `No user with such id:${userId} found`})
    }   else {
        res.status(200).json({message: 'User found successfully', singleUser})
    }
    }   catch (error) {
        console.error('Error while getting single user',error);
        res.status(500).json({message: error.messaage})
    }
}

export const followAndUnfollow = async (req, res) => {
    try {
        const id = req.params.id
        const userToModify = await User.findById(id)
        const currentUser = await User.findById(req.user._id)

        if (id === req.user._id.toString()) {
            res.status(400).json({message: "You cannot follow/unfollow yourself"})
        }
        if (!userToModify || !currentUser) {
            res.status(404).json({message:'User not found'})
        }
        const isFollowing = currentUser.followers.includes(id)
        if (isFollowing) {
            await User.findByIdAndUpdate(id,{$pull:{followers:req.user._id}})
            await User.findByIdAndUpdate(req.user_id, {$pull: {following:id}})
            res.status(200).json({message: "You have successfully unfollowed this user"})
        } else {
            await User.findByIdAndUpdate(id,{$push:{followers:req.user._id}})
            await User.findByIdAndUpdate(req.user_id,{$push:{following:id}})
            res.status(200).json({message: "You have successfully followed this user"})
        }
    } catch (error) {
        console.log();
        res.status(500).json(error.message)
    }
}


export const getSuggestedUsers = async (req, res) => {
	try {
		const userId = req.user._id;
        

		const usersFollowedByYou = await User.findById(userId).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
				},
			},
			{
				$sample: { size: 10 },
			},
		]);
		const filteredUsers = users.filter((user) => !usersFollowedByYou.following.includes(user.userName));
		const suggestedUsers = filteredUsers.slice(0, 4);

		suggestedUsers.forEach((user) => (user.password = null));

		res.status(200).json(suggestedUsers);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const updateProfilePic = async (req, res) => {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const oldProfilePicId = user.profilePic && user.profilePic.split('/').pop().split('.')[0];
      
      if (profilePic) {
        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
            resource_type: 'auto',
        });
        newProfilePicUrl = uploadResponse.secure_url;
        console.log('Image uploaded successfully:', newProfilePicUrl);
     
  
        if (oldProfilePicId) {
          await cloudinary.uploader.destroy(oldProfilePicId);
        }
  
        user.profilePic = newProfilePicUrl;
        await user.save();
  
        res.status(200).json({ message: 'Profile picture updated successfully', user });
      } else {
        res.status(400).json({ message: 'No file uploaded' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
      console.error('INTERNAL SERVER ERROR', error.message);
    }
};

export const reportUser = async (req, res) => {
    try {
        const reporterId = req.user._id;
        const { reportedUserId, reason } = req.body;

        const reportedUser = await User.findById(reportedUserId);
        if (!reportedUser) {
            return res.status(404).json({ message: "Reported user not found" });
        }

        const newReport = new Report({
            reporter: reporterId,
            reportedUser: reportedUserId,
            reason
        });

        await newReport.save();
        res.status(200).json({ message: 'User reported successfully', report: newReport });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const freezeAccount = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.isFrozen = true;
        await user.save();
        await frozenAccountTemplate(user.email, user.userName);
        res.status(200).json({ message: 'Account frozen successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const unfreezeAccount = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.isFrozen = false;
        await user.save();
        await unfrozenAccountTemplate(user.email, user.userName);
        res.status(200).json({ message: 'Account unfrozen successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  };