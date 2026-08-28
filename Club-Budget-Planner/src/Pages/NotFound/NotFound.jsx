import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Compass, ShieldAlert } from "lucide-react";
import "./NotFound.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="cv-notfound-page">
      <div className="cv-notfound-card">
        <div className="cv-notfound-icon">
          <ShieldAlert size={36} />
        </div>
        <span className="cv-notfound-code">404</span>
        <h1 className="cv-notfound-title">Page Not Found</h1>
        <p className="cv-notfound-desc">
          The page or financial record you are looking for does not exist, has been archived, or you may not have authorization to view this club route.
        </p>
        <div className="cv-notfound-actions">
          <button
            type="button"
            className="cv-notfound-btn cv-notfound-btn-secondary"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          <button
            type="button"
            className="cv-notfound-btn cv-notfound-btn-primary"
            onClick={() => navigate("/dashboard")}
          >
            <Compass size={16} /> Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
