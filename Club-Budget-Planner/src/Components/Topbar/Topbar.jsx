import React from "react";
import ProfileMenu from "../ProfileMenu/ProfileMenu";
import "./Topbar.css";

const Topbar = () => {
  return (
    <div className="global-topbar">
      <ProfileMenu />
    </div>
  );
};

export default Topbar;