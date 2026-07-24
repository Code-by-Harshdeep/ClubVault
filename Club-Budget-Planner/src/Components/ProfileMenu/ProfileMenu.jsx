import React from "react";
import "./ProfileMenu.css";

const ProfileMenu = () => {
  return (
    <div className="gp-wrapper">
      <button className="gp-btn">
        <div className="gp-avatar">AC</div>

        <div className="gp-info">
          <span className="gp-name">Alex Chen</span>
          <span className="gp-role">Treasurer</span>
        </div>

        <span className="material-symbols-outlined">expand_more</span>
      </button>

      <div className="gp-dropdown">
        <a href="#profile">
          <span className="material-symbols-outlined">person</span>
          <span>View Profile</span>
        </a>

        <a href="#settings">
          <span className="material-symbols-outlined">settings</span>
          <span>Account Settings</span>
        </a>

        <hr />

        <a href="#logout" className="gp-logout">
          <span className="material-symbols-outlined">logout</span>
          <span>Sign Out</span>
        </a>
      </div>
    </div>
  );
};

export default ProfileMenu;