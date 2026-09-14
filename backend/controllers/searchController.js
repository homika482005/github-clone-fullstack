const User = require("../models/userModel");
const Repository = require("../models/repoModel");
const Issue = require("../models/issueModel");

const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    // Case-insensitive regex search
    const searchRegex = new RegExp(q, "i");

    // Run searches concurrently for performance
    const [users, repositories, issues] = await Promise.all([
      User.find({ username: searchRegex }).select("username avatar bio").limit(10),
      Repository.find({ 
        name: searchRegex,
        visibility: "public" // Only search public repos globally
      }).populate("owner", "username avatar").limit(10),
      Issue.find({ title: searchRegex })
        .populate("author", "username")
        .populate("repository", "name")
        .limit(10)
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        repositories,
        issues
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { globalSearch };
