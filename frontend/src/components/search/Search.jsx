import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config";
import "./search.css";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const navigate = useNavigate();
  
  const [results, setResults] = useState({ users: [], repositories: [], issues: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("repositories");

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/api/search?q=${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(response.data.data);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  if (!query) return <div className="search-page-container">Please enter a search query.</div>;
  if (loading) return <div className="search-page-container">Searching...</div>;

  return (
    <div className="search-page-container">
      <div className="search-sidebar">
        <div 
          className={`search-nav-item ${activeTab === "repositories" ? "active" : ""}`}
          onClick={() => setActiveTab("repositories")}
        >
          <span>Repositories</span>
          <span style={{background: '#e1e4e8', padding: '2px 8px', borderRadius: '10px'}}>{results.repositories.length}</span>
        </div>
        <div 
          className={`search-nav-item ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <span>Users</span>
          <span style={{background: '#e1e4e8', padding: '2px 8px', borderRadius: '10px'}}>{results.users.length}</span>
        </div>
        <div 
          className={`search-nav-item ${activeTab === "issues" ? "active" : ""}`}
          onClick={() => setActiveTab("issues")}
        >
          <span>Issues</span>
          <span style={{background: '#e1e4e8', padding: '2px 8px', borderRadius: '10px'}}>{results.issues.length}</span>
        </div>
      </div>

      <div className="search-results">
        <h2>{results[activeTab].length} results for "{query}"</h2>
        
        {activeTab === "repositories" && results.repositories.map(repo => (
          <div key={repo._id} className="search-result-item">
            <h3 className="search-result-title" onClick={() => navigate(`/repo/${repo._id}`)}>
              {repo.owner?.username} / {repo.name}
            </h3>
            <p className="search-result-meta">{repo.description || "No description provided."}</p>
          </div>
        ))}

        {activeTab === "users" && results.users.map(user => (
          <div key={user._id} className="search-result-item">
            <h3 className="search-result-title">{user.username}</h3>
            <p className="search-result-meta">{user.bio || "No bio available."}</p>
          </div>
        ))}

        {activeTab === "issues" && results.issues.map(issue => (
          <div key={issue._id} className="search-result-item">
            <h3 className="search-result-title" onClick={() => navigate(`/repo/${issue.repository?._id}`)}>
              {issue.title}
            </h3>
            <p className="search-result-meta">
              in {issue.repository?.name} • opened by {issue.author?.username}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;
