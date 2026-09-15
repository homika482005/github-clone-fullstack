import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./create.css";

const CreateRepo = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/repo/create`,
        { name, description, isPrivate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/"); 
    } catch (error) {
      console.error("Error creating repository:", error);
      alert("Failed to create repository. Please try again.");
    }
  };

  return (
    <div className="create-layout">
      <div className="geometric-container">
        <div className="header-section">
          <h2>Create a new repository</h2>
          <p>A repository contains all project files, including the revision history.</p>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="input-group">
            <label>Repository name <span className="required">*</span></label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., my-awesome-project"
            />
          </div>

          <div className="input-group">
            <label>Description <span className="optional">(optional)</span></label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Keep it brief and descriptive."
            />
          </div>

          <hr className="divider" />

          <button type="submit" className="action-button">
            Create repository
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRepo;
