import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  profilePic: {
    type: String,
    default: ''
  },
  isFrozen: {
    type: Boolean,
    default: false
  },
  bio: {
    type: String,
  },
  following: {
    type: [String],
    default: []
  },
  followers: {
    type: [String],
    default: []
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'male', 'female'],
    required: true
  },
  role: {
    type: String,
    default: 'user'
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;