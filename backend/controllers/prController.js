const PullRequest = require("../models/prModel");
const Repository = require("../models/repoModel");

const createPullRequest = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { repoId } = req.params;
    const userId = req.user._id;

    if (!title) {
      return res.status(400).json({ success: false, message: "Pull Request title is required" });
    }

    const repository = await Repository.findById(repoId);
    if (!repository) return res.status(404).json({ success: false, message: "Repository not found" });

    const pr = await PullRequest.create({
      title,
      description,
      author: userId,
      repository: repoId,
    });

    res.status(201).json({ success: true, message: "Pull Request created successfully", data: pr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPullRequestsByRepo = async (req, res) => {
  try {
    const { repoId } = req.params;
    const prs = await PullRequest.find({ repository: repoId })
      .populate("author", "username avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: prs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const mergePullRequest = async (req, res) => {
  try {
    const { prId } = req.params;
    const userId = req.user._id;

    const pr = await PullRequest.findById(prId).populate("repository");
    if (!pr) return res.status(404).json({ success: false, message: "Pull Request not found" });

    // AUTHORIZATION: Only the owner of the target repository can merge the PR
    if (pr.repository.owner.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: Only the repository owner can merge PRs" });
    }

    if (pr.status !== "open") {
      return res.status(400).json({ success: false, message: `PR is already ${pr.status}` });
    }

    pr.status = "merged";
    await pr.save();

    res.status(200).json({ success: true, message: "Pull Request successfully merged", data: pr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createPullRequest, getPullRequestsByRepo, mergePullRequest };
