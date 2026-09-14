const express = require("express");
const router = express.Router();
const { getUserNotifications, markAsRead } = require("../controllers/notificationController");
const { authenticate } = require("../middleware/authMiddleware");

router.use(authenticate);

router.get("/", getUserNotifications);
router.put("/read", markAsRead);

module.exports = router;
