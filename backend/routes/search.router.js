const express = require("express");
const router = express.Router();
const { globalSearch } = require("../controllers/searchController");
const { authenticate } = require("../middleware/authMiddleware");

// Enforce authentication so only logged-in users can search
router.use(authenticate);

router.get("/", globalSearch);

module.exports = router;
