import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserPage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (!loggedInUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(loggedInUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="userpage-container">
      <div className="userpage-box">
        <h2>Welcome, {user.FirstName}!</h2>
        <div className="user-info">
          <p>
            <strong>Name:</strong> {user.FirstName} {user.LastName}
          </p>
          <p>
            <strong>Email:</strong> {user.Email}
          </p>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserPage;
