import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./dashboard.css";
import Navbar from "../Navbar";

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    // Safely extract userId from the JWT token in localStorage
    const token = localStorage.getItem("token");
    let userId = "";
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id || payload.userId;
      } catch (e) {
        console.error("Error parsing token", e);
      }
    }

    const fetchRepositories = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`${API_URL}/repo/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setRepositories(data.repositories || []);
      } catch (err) {
        console.error("Error while fetching repositories: ", err);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch(`${API_URL}/repo/all`);
        const data = await response.json();
        setSuggestedRepositories(Array.isArray(data) ? data : data.repositories || []);
      } catch (err) {
        console.error("Error while fetching suggested repositories: ", err);
      }
    };

    fetchRepositories();
    fetchSuggestedRepositories();
  }, []);

  useEffect(() => {
    if (!Array.isArray(repositories)) return;
    if (searchQuery.trim() === "") {
      setSearchResults(repositories);
    } else {
      const filteredRepo = repositories.filter((repo) =>
        repo.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredRepo);
    }
  }, [searchQuery, repositories]);

  return (
    <>
      <Navbar />
      <div className="dashboard-layout">
        <div className="dashboard-grid">
          
          {/* Left Column: Suggested Repositories */}
          <div className="grid-column">
            <h3 className="geometric-header">Suggested Repos</h3>
            {suggestedRepositories.length === 0 ? (
              <div className="card-minimal">
                <p className="empty-text">No suggestions available.</p>
              </div>
            ) : (
              suggestedRepositories.map((repo) => (
                <div key={repo._id || repo.name} className="card-minimal">
                  <h4 style={{ margin: "0 0 5px 0", fontSize: "15px", color: "#0969da" }}>{repo.name}</h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#57606a" }}>{repo.description || "No description"}</p>
                </div>
              ))
            )}
          </div>

          {/* Main Column: Your Repositories & Search */}
          <div className="grid-column">
            <h3 className="geometric-header">Your Repositories</h3>
            <input
              type="text"
              className="search-input-sharp"
              value={searchQuery}
              placeholder="Find a repository..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            {searchResults.length === 0 ? (
              <div className="card-minimal" style={{ marginTop: "10px" }}>
                <p className="empty-text">You don't have any repositories yet.</p>
                <Link to="/create" className="action-link-sharp">Create one now</Link>
              </div>
            ) : (
              searchResults.map((repo) => (
                <div key={repo._id || repo.name} className="card-minimal" style={{ marginTop: "10px" }}>
                  <h4 style={{ margin: "0 0 5px 0", fontSize: "15px", color: "#0969da" }}>{repo.name}</h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#57606a" }}>{repo.description || "No description"}</p>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Upcoming Events */}
          <div className="grid-column">
            <h3 className="geometric-header">Upcoming Events</h3>
            <ul className="event-list-minimal">
              <li>
                <span className="event-date">Dec 15</span> Tech Conference
              </li>
              <li>
                <span className="event-date">Dec 25</span> Developer Meetup
              </li>
              <li>
                <span className="event-date">Jan 5</span> React Summit
              </li>
            </ul>
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;
