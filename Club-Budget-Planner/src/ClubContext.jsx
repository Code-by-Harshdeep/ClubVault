import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "./api";

const ClubContext = createContext(null);

// status: "loading" | "none" | "pending" | "approved" | "rejected"
export function ClubProvider({ children }) {
  const [status, setStatus] = useState("loading");
  const [club, setClub] = useState(null);
  const [role, setRole] = useState(null);

  const refreshClub = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("none");
      setClub(null);
      setRole(null);
      return;
    }

    setStatus("loading");
    try {
      const data = await api.get("/api/clubs/me");
      setStatus(data.status);
      setClub(data.club || null);
      setRole(data.role || null);

      if (data.club) {
        localStorage.setItem("club", JSON.stringify(data.club));
      } else {
        localStorage.removeItem("club");
      }
    } catch (err) {
      // If token is bad/expired, treat as no club so routing can bounce to login
      setStatus("none");
      setClub(null);
      setRole(null);
    }
  }, []);

  useEffect(() => {
    refreshClub();
  }, [refreshClub]);

  return (
    <ClubContext.Provider value={{ status, club, role, refreshClub, setStatus }}>
      {children}
    </ClubContext.Provider>
  );
}

export function useClub() {
  const ctx = useContext(ClubContext);
  if (!ctx) throw new Error("useClub must be used within a ClubProvider");
  return ctx;
}
