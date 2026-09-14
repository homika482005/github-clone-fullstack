import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import "./pr.css";

const PullRequestList = ({ repoId, isRepoOwner }) => {
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const fetchPRs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/pr/repo/${repoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrs(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch PRs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPRs();
  }, [repoId]);

  const handleCreatePR = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/pr/repo/${repoId}`,
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      setDescription("");
      setShowForm(false);
      fetchPRs();
    } catch (error) {
      alert("Failed to create Pull Request");
    }
  };

  const handleMerge = async (prId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/api/pr/${prId}/merge`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPRs(); // Refresh list to show 'merged' status
    } catch (error) {
      alert(error.response?.data?.message || "Failed to merge PR");
    }
  };

  if (loading) return <div>Loading Pull Requests...</div>;

  return (
    <div className="pr-container">
      <div className="pr-header">
        <h2>Pull Requests</h2>
        <button className="new-issue-btn" onClick={() => setShowForm(!showForm)}>
          New Pull Request
        </button>
      </div>

      {showForm && (
        <form className="issue-form-container" onSubmit={handleCreatePR}>
          <input
            type="text"
            className="issue-input"
            placeholder="Pull Request Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="issue-input issue-textarea"
            placeholder="Describe the changes proposed..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="form-actions">
            <button type="submit" className="new-issue-btn">Create Pull Request</button>
            <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="issue-list">
        <div className="issue-list-header">
          {prs.filter(pr => pr.status === "open").length} Open Pull Requests
        </div>
        {prs.length === 0 ? (
          <div className="issue-row">No pull requests found.</div>
        ) : (
          prs.map((pr) => (
            <div key={pr._id} className="issue-row">
              <div>
                <h3 className="issue-title">{pr.title}</h3>
                <p className="issue-meta">
                  Opened by {pr.author?.username} • {new Date(pr.createdAt).toLocaleDateString()}
                </p>
                {pr.description && <p style={{ fontSize: '13px', color: '#24292f', marginTop: '8px' }}>{pr.description}</p>}
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexDirection: 'column' }}>
                <span className={`pr-status status-${pr.status}`}>
                  {pr.status}
                </span>
                {pr.status === "open" && isRepoOwner && (
                  <button className="merge-btn" onClick={() => handleMerge(pr._id)}>
                    Merge PR
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PullRequestList;
