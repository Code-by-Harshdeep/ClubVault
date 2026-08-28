import React from "react";
import { Navigate } from "react-router-dom";
import { useClub } from "../ClubContext";
import { hasFeature } from "../features";

export default function RequireFeature({ feature, children }) {
  const { club } = useClub();

  if (!hasFeature(club, feature)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
