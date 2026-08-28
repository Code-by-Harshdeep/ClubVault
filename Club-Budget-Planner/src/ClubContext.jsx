import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "./api";

const ClubContext = createContext(null);

// status: "loading" | "none" | "pending" | "approved" | "rejected"
export function ClubProvider({ children }) {
  const [status, setStatus] = useState("loading");
  const [club, setClub] = useState(null);
  const [role, setRole] = useState(null);
  const [clubs, setClubs] = useState([]);

  const refreshClub = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("none");
      setClub(null);
      setRole(null);
      setClubs([]);
      return;
    }

    setStatus("loading");
    try {
      const data = await api.get("/api/clubs/mine");
      const nextClubs = data.clubs || [];
      const activeId = localStorage.getItem("activeClubId");
      const selected = nextClubs.find((item) => item._id === activeId && item.status === "approved") ||
        nextClubs.find((item) => item.status === "approved") ||
        nextClubs.find((item) => item._id === activeId) ||
        nextClubs[0] || null;

      const nextStatus = selected?.status || "none";
      setClubs(nextClubs);
      setStatus(nextStatus);
      setClub(selected);
      setRole(selected?.role || null);

      if (selected) {
        localStorage.setItem("activeClubId", String(selected._id));
        localStorage.setItem("club", JSON.stringify(selected));
      } else {
        localStorage.removeItem("activeClubId");
        localStorage.removeItem("club");
      }
      return nextStatus;
    } catch (err) {
      // If token is bad/expired, treat as no club so routing can bounce to login
      setStatus("none");
      setClub(null);
      setRole(null);
      setClubs([]);
      return "none";
    }
  }, []);


  const selectClub = useCallback((clubId) => {
    const selected = clubs.find((item) => item._id === clubId);
    if (!selected) return;
    localStorage.setItem("activeClubId", String(selected._id));
    localStorage.setItem("club", JSON.stringify(selected));
    setClub(selected);
    setRole(selected.role || null);
    setStatus(selected.status || "none");
  }, [clubs]);

  useEffect(() => {
    refreshClub();
  }, [refreshClub]);

  return (
    <ClubContext.Provider value={{ status, club, clubs, role, refreshClub, selectClub, setStatus }}>
      {children}
    </ClubContext.Provider>
  );
}

export function useClub() {
  const ctx = useContext(ClubContext);
  if (!ctx) throw new Error("useClub must be used within a ClubProvider");
  return ctx;
}
