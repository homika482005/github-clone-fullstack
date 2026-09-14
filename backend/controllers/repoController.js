const Repository = require("../models/repoModel");
const fs = require("fs");
const path = require("path");

const createRepository = async (req, res) => {
  try {
    const { name, description, visibility, topics } = req.body;
    const owner = req.user._id;

    if (!name) {
      return res.status(400).json({ success: false, message: "Repository name is required" });
    }

    const existingRepo = await Repository.findOne({ name, owner });
    if (existingRepo) {
      return res.status(409).json({ success: false, message: "You already have a repository with this name" });
    }

    const repository = await Repository.create({
      name,
      description,
      owner,
      visibility: visibility || "public",
      topics: topics || [],
    });

    res.status(201).json({ success: true, message: "Repository created successfully", data: repository });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllRepositories = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const repositories = await Repository.find({
      $or: [{ visibility: "public" }, { owner: currentUserId }],
    })
      .populate("owner", "username avatar")
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, message: "Repositories fetched successfully", data: repositories || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRepositoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const repository = await Repository.findById(id)
      .populate("owner", "username avatar")
      .populate("issues");

    if (!repository) {
      return res.status(404).json({ success: false, message: "Repository not found" });
    }

    res.status(200).json({ success: true, message: "Repository fetched successfully", data: repository });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteRepository = async (req, res) => {
  try {
    const { id } = req.params;
    const repository = await Repository.findById(id);

    if (!repository) return res.status(404).json({ success: false, message: "Repository not found" });

    if (repository.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: You are not authorized to delete this repository" });
    }

    await repository.deleteOne();
    res.status(200).json({ success: true, message: "Repository deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleStar = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const repository = await Repository.findById(id);
    if (!repository) return res.status(404).json({ success: false, message: "Repository not found" });

    const isStarred = repository.stars.includes(userId);
    
    if (isStarred) {
      repository.stars.pull(userId);
    } else {
      repository.stars.push(userId);
    }
    
    await repository.save();

    res.status(200).json({
      success: true,
      message: isStarred ? "Repository unstarred" : "Repository starred",
      data: { stars: repository.stars.length, isStarred: !isStarred }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const forkRepository = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const originalRepo = await Repository.findById(id);
    if (!originalRepo) return res.status(404).json({ success: false, message: "Repository not found" });

    if (originalRepo.owner.toString() === userId.toString()) {
      return res.status(400).json({ success: false, message: "You cannot fork your own repository" });
    }

    const existingFork = await Repository.findOne({ owner: userId, forkedFrom: id });
    if (existingFork) return res.status(409).json({ success: false, message: "You have already forked this repository" });

    const forkedRepo = await Repository.create({
      name: originalRepo.name,
      description: originalRepo.description,
      owner: userId,
      visibility: originalRepo.visibility,
      forkedFrom: originalRepo._id,
      topics: originalRepo.topics
    });

    originalRepo.forks.push(forkedRepo._id);
    await originalRepo.save();

    res.status(201).json({ success: true, message: "Repository forked successfully", data: forkedRepo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// NEW: Reads from your custom commit.json architecture
const getRepoCommits = async (req, res) => {
  try {
    const commitPath = path.join(__dirname, '../commit.json');
    let commits = [];

    if (fs.existsSync(commitPath)) {
      const fileContent = fs.readFileSync(commitPath, 'utf8');
      if (fileContent.trim()) {
        const parsed = JSON.parse(fileContent);
        // Normalize single objects into an array for the frontend
        commits = Array.isArray(parsed) ? parsed : [parsed];
      }
    }

    // Defensive fallback if file is empty or missing
    if (commits.length === 0) {
      commits = [
        { message: "Initial commit", date: new Date().toISOString(), hash: "a1b2c3d" }
      ];
    }

    res.status(200).json({ success: true, data: commits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createRepository,
  getAllRepositories,
  getRepositoryById,
  deleteRepository,
  toggleStar,
  forkRepository,
  getRepoCommits
};





// const mongoose = require("mongoose");
// const Repository = require("../models/repoModel");
// const User = require("../models/userModel");
// const Issue = require("../models/issueModel");

// async function createRepository(req, res) {
//   const { owner, name, issues, content, description, visibility } = req.body;

//   try {
//     if (!name) {
//       return res.status(400).json({ error: "Repository name is required!" });
//     }

//     if (!mongoose.Types.ObjectId.isValid(owner)) {
//       return res.status(400).json({ error: "Invalid User ID!" });
//     }

//     const newRepository = new Repository({
//       name,
//       description,
//       visibility,
//       owner,
//       content,
//       issues,
//     });

//     const result = await newRepository.save();

//     res.status(201).json({
//       message: "Repository created!",
//       repositoryID: result._id,
//     });
//   } catch (err) {
//     console.error("Error during repository creation : ", err.message);
//     res.status(500).send("Server error");
//   }
// }

// async function getAllRepositories(req, res) {
//   try {
//     const repositories = await Repository.find({})
//       .populate("owner")
//       .populate("issues");

//     res.json(repositories);
//   } catch (err) {
//     console.error("Error during fetching repositories : ", err.message);
//     res.status(500).send("Server error");
//   }
// }

// async function fetchRepositoryById(req, res) {
//   const { id } = req.params;
//   try {
//     const repository = await Repository.find({ _id: id })
//       .populate("owner")
//       .populate("issues");

//     res.json(repository);
//   } catch (err) {
//     console.error("Error during fetching repository : ", err.message);
//     res.status(500).send("Server error");
//   }
// }

// async function fetchRepositoryByName(req, res) {
//   const { name } = req.params;
//   try {
//     const repository = await Repository.find({ name })
//       .populate("owner")
//       .populate("issues");

//     res.json(repository);
//   } catch (err) {
//     console.error("Error during fetching repository : ", err.message);
//     res.status(500).send("Server error");
//   }
// }

// async function fetchRepositoriesForCurrentUser(req, res) {
//   console.log(req.params);
//   const { userID } = req.params;

//   try {
//     const repositories = await Repository.find({ owner: userID });

//     if (!repositories || repositories.length == 0) {
//       return res.status(404).json({ error: "User Repositories not found!" });
//     }
//     console.log(repositories);
//     res.json({ message: "Repositories found!", repositories });
//   } catch (err) {
//     console.error("Error during fetching user repositories : ", err.message);
//     res.status(500).send("Server error");
//   }
// }

// async function updateRepositoryById(req, res) {
//   const { id } = req.params;
//   const { content, description } = req.body;

//   try {
//     const repository = await Repository.findById(id);
//     if (!repository) {
//       return res.status(404).json({ error: "Repository not found!" });
//     }

//     repository.content.push(content);
//     repository.description = description;

//     const updatedRepository = await repository.save();

//     res.json({
//       message: "Repository updated successfully!",
//       repository: updatedRepository,
//     });
//   } catch (err) {
//     console.error("Error during updating repository : ", err.message);
//     res.status(500).send("Server error");
//   }
// }

// async function toggleVisibilityById(req, res) {
//   const { id } = req.params;

//   try {
//     const repository = await Repository.findById(id);
//     if (!repository) {
//       return res.status(404).json({ error: "Repository not found!" });
//     }

//     repository.visibility = !repository.visibility;

//     const updatedRepository = await repository.save();

//     res.json({
//       message: "Repository visibility toggled successfully!",
//       repository: updatedRepository,
//     });
//   } catch (err) {
//     console.error("Error during toggling visibility : ", err.message);
//     res.status(500).send("Server error");
//   }
// }

// async function deleteRepositoryById(req, res) {
//   const { id } = req.params;
//   try {
//     const repository = await Repository.findByIdAndDelete(id);
//     if (!repository) {
//       return res.status(404).json({ error: "Repository not found!" });
//     }

//     res.json({ message: "Repository deleted successfully!" });
//   } catch (err) {
//     console.error("Error during deleting repository : ", err.message);
//     res.status(500).send("Server error");
//   }
// }

// module.exports = {
//   createRepository,
//   getAllRepositories,
//   fetchRepositoryById,
//   fetchRepositoryByName,
//   fetchRepositoriesForCurrentUser,
//   updateRepositoryById,
//   toggleVisibilityById,
//   deleteRepositoryById,
// };
