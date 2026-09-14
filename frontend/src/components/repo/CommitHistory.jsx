import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../config";
import "./commit.css";

const CommitHistory = ({ repoId }) => {
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/api/repo/${repoId}/commits`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCommits(response.data.data);
      } catch (error) {
        console.error("Failed to fetch commit history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCommits();
  }, [repoId]);

  if (loading) return <div>Loading commit history...</div>;

  return (
    <div className="commit-history-container">
      <div className="commit-history-header">
        <svg height="16" viewBox="0 0 16 16" width="16" fill="#57606a">
          <path d="M10.5 7.75a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm1.43.75a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 1 1 0-1.5h3.32a4.001 4.001 0 0 1 7.86 0h3.32a.75.75 0 1 1 0 1.5h-3.32Z"></path>
        </svg>
        Commit History
      </div>
      
      {commits.length === 0 ? (
        <div className="commit-row">No commits found in this repository.</div>
      ) : (
        commits.map((commit, index) => (
          <div key={index} className="commit-row">
            <div>
              <p className="commit-message">{commit.message}</p>
              <p className="commit-meta">
                Committed on {new Date(commit.date).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="commit-hash">
                {commit.hash || Math.random().toString(16).substring(2, 9)}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CommitHistory;
