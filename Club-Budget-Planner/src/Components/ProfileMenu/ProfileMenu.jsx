import React, { useEffect, useState } from "react";
import "./ProfileMenu.css";

const ProfileMenu = () => {
  const [user, setUser] = useState({
    fullName: "",
    clubOrOrganization: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/profile`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        setUser({
          fullName: data.fullName,
          clubOrOrganization: data.clubOrOrganization,
        });
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, []);

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="gp-wrapper">
      <button className="gp-btn">
        <div className="gp-avatar">{initials}</div>

        <div className="gp-info">
          <span className="gp-name">
            {user.fullName || "Loading..."}
          </span>

          <span className="gp-role">
            {user.clubOrOrganization || "Organization"}
          </span>
        </div>

        <span className="material-symbols-outlined">
          expand_more
        </span>
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