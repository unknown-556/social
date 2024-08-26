import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import dotenv from 'dotenv'
import {v2 as cloudinary} from "cloudinary"

dotenv.config()



export const createPost = async (req, res) => {
    try {
      const { text, img, vid } = req.body;
      const postedBy = req.user.userName;
  
      let imgUrl = '';
      let vidUrl = '';

      if (img) {
        const uploadResponse = await cloudinary.uploader.upload(img, {
            resource_type: 'auto',
        });
        imgUrl = uploadResponse.secure_url;
        console.log('Image 1 uploaded successfully:', imgUrl);
      }

      if (vid) {
        const uploadResponse = await cloudinary.uploader.upload(vid, {
            resource_type: 'auto',
        });
        vidUrl = uploadResponse.secure_url;
        console.log('Image 1 uploaded successfully:', vidUrl);
     }
  
      const maxlength = 1000;
      if (text.length > maxlength) {
        return res.status(400).json({ error: `Text should not exceed ${maxlength} characters` });
      }
  
  
      const newPost = new Post({
        postedBy,
        img: imgUrl,
        vid: vidUrl,
        text
      });
  
      await newPost.save();
      res.status(201).json({ message: 'Post created successfully', newPost });
      console.log('Post created successfully', newPost);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
      console.error('Internal server error:', error);
    }
  };


export const getAllPosts = async (req, res) => {
    try {
    const posts = await Post.find();
    if (!posts || posts.length === 0) {
        return res.status(404).json({ message: 'No posts in database' });
    }
    res.status(200).json({ message: 'Posts found successfully', posts });
    } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.error(error);
    }
};

export const getSinglePost = async (req, res) => {
    try {
      const singlePost = await Post.findById(req.params.id);
      if (!singlePost) {
        return res.status(404).json({ message: 'No post in database' });
      }
      res.status(200).json({ message: 'Post found successfully', singlePost });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
      console.error(error);
    }
};

export const deletePost = async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'No post with such ID exists' });
      }
      if (post.postedBy.toString() !== req.user.userName) {
        return res.status(401).json({ message: 'You cannot delete a post you did not create: you fool!!!' });
      }
      if (post.img) {
        const imgId = post.img.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(imgId);
      }
      if (post.vid) {
        const vidId = post.vid.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(vidId);
      }
      await Post.findByIdAndDelete(post);
      res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
      console.error(error);
    }
};

export const likeUnlikePost = async (req, res) => {
    try {
      const { id: postId } = req.params;
      const userId = req.user._id;

      const user = await User.findById(userId)

      const By = user.userName
  
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
  
      const userLikedPost = post.likes.includes(By);
      if (userLikedPost) {
        await Post.updateOne({ _id: postId }, { $pull: { likes: By } });
        res.status(200).json({ message: "Post unliked successfully" });
      } else {
        post.likes.push(By);
        await post.save();
        res.status(200).json({ message: "Post liked successfully" });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
      console.error(error);
    }
};


export const replyToPost = async (req, res) => {
	try {
		const { text } = req.body;
		const postId = req.params.id;
		const userId = req.user._id;
		const userProfilePic = req.user.profilePic;
		const userName = req.user.userName;

		if (!text) {
			return res.status(400).json({ error: "Text field is required" });
		}

		const post = await Post.findById(postId);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const reply = { userId, text, userProfilePic, userName };

		post.replies.push(reply);
		await post.save();

		res.status(200).json(reply);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
