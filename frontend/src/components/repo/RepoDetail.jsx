import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config";
import IssueList from "../issue/IssueList";
import CommitHistory from "./CommitHistory"; 
import PullRequestList from "../pr/PullRequestList"; // NEW IMPORT
import "./repoDetail.css";

const RepoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("code");
  const [starCount, setStarCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null); // NEW STATE

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // NEW: Decode token to get current user ID for ownership checks
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setCurrentUserId(payload.id);
        }

        const response = await axios.get(`${API_URL}/api/repo/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRepo(response.data.data);
        setStarCount(response.data.data.stars?.length || 0);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load repository");
      } finally {
        setLoading(false);
      }
    };
    fetchRepo();
  }, [id]);

  const handleStar = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${API_URL}/api/repo/${id}/star`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStarCount(response.data.data.stars);
    } catch (err) {
      alert("Failed to star repository");
    }
  };

  const handleFork = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/api/repo/${id}/fork`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Repository forked successfully!");
      navigate(`/repo/${response.data.data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fork repository");
    }
  };

  if (loading) return <div className="repo-detail-container">Loading repository...</div>;
  if (error) return <div className="repo-detail-container">Error: {error}</div>;
  if (!repo) return <div className="repo-detail-container">Repository not found.</div>;

  // NEW: Boolean to check if the logged-in user owns this repository
  const isRepoOwner = currentUserId === repo.owner?._id;

  return (
    <div className="repo-detail-container">
      <div className="repo-header">
        <div className="repo-title-row" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h1 className="repo-name">{repo.owner?.username} / {repo.name}</h1>
            <span className="repo-badge">{repo.visibility}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="repo-badge" onClick={handleStar} style={{ cursor: 'pointer', background: '#f6f8fa' }}>
              ⭐ Star ({starCount})
            </button>
            <button className="repo-badge" onClick={handleFork} style={{ cursor: 'pointer', background: '#f6f8fa' }}>
              🔱 Fork ({repo.forks?.length || 0})
            </button>
          </div>
        </div>
        {repo.forkedFrom && (
          <p style={{ fontSize: '12px', color: '#57606a', margin: '5px 0' }}>
            forked from another repository
          </p>
        )}
        <p style={{ marginTop: '10px', color: '#57606a' }}>{repo.description || "No description provided."}</p>
        
        <div className="repo-nav">
          <div 
            className={`repo-nav-item ${activeTab === "code" ? "active" : ""}`}
            onClick={() => setActiveTab("code")}
          >
            Code
          </div>
          <div 
            className={`repo-nav-item ${activeTab === "commits" ? "active" : ""}`}
            onClick={() => setActiveTab("commits")}
          >
            Commits
          </div>
          <div 
            className={`repo-nav-item ${activeTab === "issues" ? "active" : ""}`}
            onClick={() => setActiveTab("issues")}
          >
            Issues ({repo.issues?.length || 0})
          </div>
          {/* NEW: Pull Requests Tab */}
          <div 
            className={`repo-nav-item ${activeTab === "prs" ? "active" : ""}`}
            onClick={() => setActiveTab("prs")}
          >
            Pull Requests
          </div>
        </div>
      </div>

      {activeTab === "code" && (
        <div className="file-browser">
          <div className="file-browser-header">
            <span>Latest commit from {repo.owner?.username}</span>
            <span style={{ cursor: 'pointer', color: '#0969da' }} onClick={() => setActiveTab("commits")}>
              View history
            </span>
          </div>
          <div className="file-row"><span>📁 src</span></div>
          <div className="file-row"><span>📁 backend</span></div>
          <div className="file-row"><span>📄 README.md</span></div>
          <div className="file-row"><span>📄 package.json</span></div>
        </div>
      )}

      {activeTab === "commits" && <CommitHistory repoId={repo._id} />}
      {activeTab === "issues" && <IssueList repoId={repo._id} />}
      {/* NEW: Pull Requests Component */}
      {activeTab === "prs" && <PullRequestList repoId={repo._id} isRepoOwner={isRepoOwner} />}
    </div>
  );
};

export default RepoDetail;
