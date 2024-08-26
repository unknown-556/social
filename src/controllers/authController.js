import cryptoHash from 'crypto'
import User from '../models/userModel.js'
import { signInValidator, signUpValidator } from '../validators/authValidator.js'
import { formatZodError } from '../utils/errorMessage.js'
import generateTokenAndSetCookie from '../utils/jwt.js'
import {v2 as cloudinary} from 'cloudinary'
import transporter from '../config/email.js'


function hashValue(value) {
    const hash = cryptoHash.createHash('sha256');
    hash.update(value);
    return hash.digest('hex');
}
 
 function comparePasswords(inputPassword, hashedPassword) {
    return hashValue(inputPassword) === hashedPassword;
}



export const signUp = async (req, res) => {
    const registerResults = signUpValidator.safeParse(req.body);
    if (!registerResults.success) {
      return res.status(400).json(formatZodError(registerResults.error.issues));
    }
  
    try {
      const { userName, phoneNumber, email } = req.body;
      let { name, bio, gender, password } = req.body;
  
      const existingUser = await User.findOne({ $or: [{ userName }, { email }, { phoneNumber }] });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists', user: existingUser });
      }
  
  
      let profilePic = '';
  
      if (profilePic) {
        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
            resource_type: 'auto',
        });
        imageUrl = uploadResponse.secure_url;
        console.log('Image 1 uploaded successfully:', imageUrl);
     }

  
      const newUser = new User({
        name,
        userName,
        password: encryption,
        email,
        phoneNumber,
        profilePic: imageUrl,
        bio,
        gender
      });
  
      await newUser.save();

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: newUser.email, 
        subject: 'New Portfolio Created',
        text: `A new portfolio has been created with this email. If you did not request thisa loginId , please contact us at example@gmail.com`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent successfully:', info.response);
        }
    });
  
      res.status(200).json({ message: 'User registered successfully', newUser });
      console.log('User registered successfully', newUser);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
      console.error('INTERNAL SERVER ERROR', error.message);
    }
  };


  export const signIn = async (req, res, next) => {
    const loginResults = signInValidator.safeParse(req.body);
    if (!loginResults.success) {
        return res.status(400).json(formatZodError(loginResults.error.issues));
    }

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User with email not found' });
        }

        if (user.isFrozen) {
            return res.status(403).json({ message: 'Your account is frozen. Please contact support.' });
        }

        const comparePass = comparePasswords(password, user.password);
        if (!comparePass) {
            return res.status(400).json({ message: 'Password is incorrect' });
        }

        const accessToken = generateTokenAndSetCookie(user._id, res);

        res.status(200).json({ message: 'User Login successful', accessToken });
        console.log('User Login successful', accessToken);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.error('INTERNAL SERVER ERROR', error.message);
    }
};

export const logout = async (req, res, next) => {
    try {
      res.clearCookie('jwt');
  
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
      console.error('INTERNAL SERVER ERROR', error.message);
    }
  };


