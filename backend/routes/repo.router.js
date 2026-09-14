const express = require("express");
const router = express.Router();
const {
  createRepository,
  getAllRepositories,
  getRepositoryById,
  deleteRepository,
  toggleStar,
  forkRepository,
  getRepoCommits
} = require("../controllers/repoController");
const { authenticate } = require("../middleware/authMiddleware");

router.use(authenticate);

router.post("/create", createRepository);
router.get("/all", getAllRepositories);
router.get("/:id", getRepositoryById);
router.delete("/:id", deleteRepository);
router.put("/:id/star", toggleStar);
router.post("/:id/fork", forkRepository);
router.get("/:id/commits", getRepoCommits);

module.exports = router;
