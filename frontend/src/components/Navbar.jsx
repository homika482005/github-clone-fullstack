import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { API_URL } from "../../config";
import "./navbar.css";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    let socket;
    
    if (isAuthenticated) {
      // 1. Fetch initial notifications from DB
      const fetchNotifications = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(`${API_URL}/api/notification`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setNotifications(response.data.data);
        } catch (error) {
          console.error("Failed to fetch notifications");
        }
      };
      fetchNotifications();

      // 2. Initialize Socket.IO connection
      socket = io(API_URL);
      
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.id;
        
        // Join personal room
        socket.emit("joinRoom", userId);

        // Listen for real-time notifications
        socket.on("newNotification", (notification) => {
          setNotifications((prev) => [notification, ...prev]);
        });
      }
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const markNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/api/notification/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark read");
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          <img src="https://www.github.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub Logo" />
          <h3>GitHub</h3>
        </Link>
        
        {isAuthenticated && (
          <form onSubmit={handleSearch} className="navbar-search-form">
            <input
              type="text"
              placeholder="Search or jump to..."
              className="navbar-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        )}
      </div>

      <div className="navbar-right">
        {isAuthenticated ? (
          <>
            <Link to="/create" className="nav-link"><p>Create a Repository</p></Link>
            <Link to="/profile" className="nav-link"><p>Profile</p></Link>
            
            {/* Real-Time Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button 
                className="notification-bell" 
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  if (unreadCount > 0 && !showDropdown) markNotificationsAsRead();
                }}
              >
                <svg height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
                  <path d="M8 16a2 2 0 001.985-1.75c.017-.137-.097-.25-.235-.25h-3.5c-.138 0-.252.113-.235.25A2 2 0 008 16zM3 5a5 5 0 0110 0v2.947c0 .05.015.098.042.139l1.703 2.555A1.518 1.518 0 0113.482 13H2.518a1.518 1.518 0 01-1.263-2.36l1.703-2.554A.255.255 0 003 7.947V5z"></path>
                </svg>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>

              {showDropdown && (
                <div className="notification-dropdown">
                  <div className="notification-dropdown-header">
                    <span>Notifications</span>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '15px', color: '#57606a', fontSize: '13px', textAlign: 'center' }}>
                        No new notifications
                      </div>
                    ) : (
                      notifications.map(n => (
                        <Link to={n.link} key={n._id} className="notification-item" onClick={() => setShowDropdown(false)}>
                          <img src={n.sender?.avatar || "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"} alt="avatar" style={{ width: '20px', borderRadius: '50%' }} />
                          <div>
                            <strong>{n.sender?.username}</strong> {n.message}
                            <div style={{ fontSize: '11px', color: '#57606a', marginTop: '3px' }}>
                              {new Date(n.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleLogout} className="nav-logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link"><p>Login</p></Link>
            <Link to="/signup" className="nav-link"><p>Sign Up</p></Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
