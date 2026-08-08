import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useClub } from "../ClubContext";

// Guards the dashboard routes: only approved club members get in.
// Anyone else (no token, no club, pending, rejected) is bounced
// to login or the club-setup flow, which is the single place that
// decides where a logged-in user should land.
export default function RequireApprovedClub() {
  const { status } = useClub();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading your workspace…</p>
      </div>
    );
  }

  if (status !== "approved") {
    return <Navigate to="/club-setup" replace />;
  }

  return <Outlet />;
}
