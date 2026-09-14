const express = require("express");
const router = express.Router();
const { createPullRequest, getPullRequestsByRepo, mergePullRequest } = require("../controllers/prController");
const { authenticate } = require("../middleware/authMiddleware");

router.use(authenticate);

router.post("/repo/:repoId", createPullRequest);
router.get("/repo/:repoId", getPullRequestsByRepo);
router.put("/:prId/merge", mergePullRequest);

module.exports = router;
