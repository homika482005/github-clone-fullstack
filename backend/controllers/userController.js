const User = require("../models/userModel");
const Repository = require("../models/repoModel");
const Issue = require("../models/issueModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY || "development_fallback_secret", {
    expiresIn: "30d",
  });
};

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User with this email or username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: "User created successfully",
        token: generateToken(user._id),
        userId: user._id,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.status(200).json({
        success: true,
        message: "Logged in successfully",
        token: generateToken(user._id),
        userId: user._id,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const targetId = req.params.id || req.user._id;
    
    const user = await User.findById(targetId)
      .select("-password")
      .populate("followers", "username avatar")
      .populate("following", "username avatar");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { email, password, bio, location, website } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (email) user.email = email;
    if (bio) user.bio = bio;
    if (location) user.location = location;
    if (website) user.website = website;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await Repository.deleteMany({ owner: req.user._id });
    await Issue.deleteMany({ author: req.user._id });
    await user.deleteOne();

    res.status(200).json({ success: true, message: "User Profile and associated data deleted!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ success: false, message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!currentUser.following.includes(targetUserId)) {
      await currentUser.updateOne({ $push: { following: targetUserId } });
      await targetUser.updateOne({ $push: { followers: currentUserId } });
      res.status(200).json({ success: true, message: "User followed successfully" });
    } else {
      await currentUser.updateOne({ $pull: { following: targetUserId } });
      await targetUser.updateOne({ $pull: { followers: currentUserId } });
      res.status(200).json({ success: true, message: "User unfollowed successfully" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserActivityMap = async (req, res) => {
  try {
    const userId = req.user._id;
    const repos = await Repository.find({ owner: userId }).select("createdAt");
    const issues = await Issue.find({ author: userId }).select("createdAt");
    const activityCounts = {};

    const processDate = (doc) => {
      const date = doc.createdAt.toISOString().split("T")[0];
      activityCounts[date] = (activityCounts[date] || 0) + 1;
    };

    repos.forEach(processDate);
    issues.forEach(processDate);

    const heatmapData = Object.keys(activityCounts).map((date) => {
      const count = activityCounts[date];
      let level = 0;
      if (count > 0 && count <= 2) level = 1;
      if (count > 2 && count <= 4) level = 2;
      if (count > 4 && count <= 6) level = 3;
      if (count > 6) level = 4;
      return { date, count, level };
    });

    res.status(200).json({ success: true, data: heatmapData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  signup,
  login,
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  followUser,
  getUserActivityMap,
};
