const mongoose = require("mongoose");

const prSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["open", "merged", "closed"], default: "open" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    repository: { type: mongoose.Schema.Types.ObjectId, ref: "Repository", required: true },
    sourceBranch: { type: String, default: "main" },
    targetBranch: { type: String, default: "main" },
  },
  { timestamps: true }
);

const PullRequest = mongoose.model("PullRequest", prSchema);
module.exports = PullRequest;
