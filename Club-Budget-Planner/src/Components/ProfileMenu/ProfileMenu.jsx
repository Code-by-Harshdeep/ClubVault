import React from "react";
import "./ProfileMenu.css";

const ProfileMenu = () => {
  return (
    <div className="global-profile-wrapper">
      <button className="profile-btn">
        <div className="avatar">AC</div>

        <div className="profile-info">
          <span className="name">Alex Chen</span>
          <span className="role">Treasurer</span>
        </div>

        <span className="material-symbols-outlined">expand_more</span>
      </button>

      <div className="profile-dropdown">
        <a href="#profile">
          <span className="material-symbols-outlined">person</span>
          <span>View Profile</span>
        </a>

        <a href="#settings">
          <span className="material-symbols-outlined">settings</span>
          <span>Account Settings</span>
        </a>

        <hr />

        <a href="#logout" className="logout">
          <span className="material-symbols-outlined">logout</span>
          <span>Sign Out</span>
        </a>
      </div>
    </div>
  );
};

export default ProfileMenu;