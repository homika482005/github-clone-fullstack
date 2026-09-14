import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery(""); // clear input after search
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          <img
            src="https://www.github.com/images/modules/logos_page/GitHub-Mark.png"
            alt="GitHub Logo"
          />
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
            <Link to="/create" className="nav-link">
              <p>Create a Repository</p>
            </Link>
            <Link to="/profile" className="nav-link">
              <p>Profile</p>
            </Link>
            <button onClick={handleLogout} className="nav-logout-btn">
              Logout
            </button>
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


// import React from "react";
// import { Link } from "react-router-dom";
// import "./navbar.css";

// const Navbar = () => {
//   return (
//     <nav>
//       <Link to="/">
//         <div>
//           <img
//             src="https://www.github.com/images/modules/logos_page/GitHub-Mark.png"
//             alt="GitHub Logo"
//           />
//           <h3>GitHub</h3>
//         </div>
//       </Link>
//       <div>
//         <Link to="/create">
//           <p>Create a Repository</p>
//         </Link>
//         <Link to="/profile">
//           <p>Profile</p>
//         </Link>
//       </div>
//     </nav>
//   );
// };

//export default Navbar;
