const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  followUser,
  getUserActivityMap,
} = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/all", getAllUsers); // Route to get all users globally

// Protected routes (require valid JWT)
router.get("/profile", authenticate, getUserProfile); // Get current logged-in user profile
router.get("/profile/:id", authenticate, getUserProfile); // Get specific user profile
router.put("/profile", authenticate, updateUserProfile);
router.delete("/profile", authenticate, deleteUserProfile);

router.post("/:id/follow", authenticate, followUser);
router.get("/heatmap", authenticate, getUserActivityMap);

module.exports = router;
