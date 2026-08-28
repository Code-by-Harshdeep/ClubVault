import React, { useEffect, useRef, useState } from "react";
import {
  Users,
  Search,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  MoreVertical,
  UserCheck,
  UserX,
  Shield,
  Trash2,
  Building2,
  X,
} from "lucide-react";

import { useClub } from "../../ClubContext";
import { api } from "../../api";
import "./Members.css";

function initialsOf(name) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function MemberRow({ member, isAdmin, onRoleChange, onRemove }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className={`cv-member-row ${menuOpen ? "menu-active" : ""}`}>
      <div className="cv-member-info">
        <div className="cv-member-avatar">{initialsOf(member.fullName)}</div>
        <div>
          <h3>{member.fullName}</h3>
          <p>{member.email}</p>
        </div>
      </div>

      <div className="cv-member-role-cell">
        <span className={`cv-member-role-badge ${member.role}`}>
          {member.role === "admin" ? <Shield size={12} /> : <Users size={12} />}
          {member.role === "admin" ? "Admin" : "Member"}
        </span>
      </div>

      <div className="cv-member-perm-cell">
        <span className="cv-perm-tag">
          {member.permissions || (member.role === "admin" ? "Full Access" : "View & Submit")}
        </span>
      </div>

      <div className="cv-member-actions-cell" ref={menuRef}>
        {isAdmin ? (
          <div className="cv-action-dropdown-wrapper">
            <button
              type="button"
              className={`cv-member-more-btn ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Member actions"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="cv-member-menu">
                <button
                  type="button"
                  onClick={() => {
                    onRoleChange(member.userId, member.role === "admin" ? "member" : "admin");
                    setMenuOpen(false);
                  }}
                >
                  <Shield size={14} />
                  <span>Make {member.role === "admin" ? "Member" : "Admin"}</span>
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => {
                    onRemove(member.userId);
                    setMenuOpen(false);
                  }}
                >
                  <Trash2 size={14} />
                  <span>Remove from club</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <span className="cv-muted-dash">—</span>
        )}
      </div>
    </div>
  );
}

export default function Members() {
  const { club, role } = useClub();
  const isAdmin = role === "admin";

  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const load = async () => {
    if (!club?._id) return;
    setLoading(true);
    setError("");
    try {
      const memberData = await api.get(`/api/clubs/${club._id}/members`);
      setMembers(memberData.members || []);

      if (isAdmin) {
        const reqData = await api.get(`/api/clubs/${club._id}/requests`);
        setRequests(reqData.requests || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [club?._id, isAdmin]);

  const handleApprove = async (userId) => {
    await api.post(`/api/clubs/${club._id}/requests/${userId}/approve`);
    await load();
  };

  const handleReject = async (userId) => {
    await api.post(`/api/clubs/${club._id}/requests/${userId}/reject`);
    await load();
  };

  const handleRoleChange = async (userId, newRole) => {
    await api.patch(`/api/clubs/${club._id}/members/${userId}/role`, { role: newRole });
    await load();
  };

  const handleRemove = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member from the club?")) return;
    await api.delete(`/api/clubs/${club._id}/members/${userId}`);
    await load();
  };

  const copyClubId = () => {
    navigator.clipboard.writeText(club?.clubId || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredMembers = members.filter((m) => {
    const haystack = `${m.fullName} ${m.email} ${m.role}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="cv-members-page">
      <main className="cv-members-container">
        <header className="cv-members-header">
          <div>
            <div className="cv-dash-club-badge">
              <Building2 size={13} /> {club?.name || "Club Roster"}
            </div>
            <h1 className="cv-members-title">Members &amp; Officers</h1>
            <p className="cv-members-subtitle">
              Manage committee roles, permissions, and incoming join requests.
            </p>
          </div>

          <button
            type="button"
            className={`cv-btn-copy-clubid ${copied ? "copied" : ""}`}
            onClick={copyClubId}
            title="Share this Club ID with students to let them join"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            <span>{copied ? "Club ID Copied!" : `Club ID: ${club?.clubId || "—"}`}</span>
          </button>
        </header>

        {error && <p className="cv-members-error">{error}</p>}

        <section className="cv-members-kpi-grid">
          <div className="cv-member-kpi-card">
            <div className="cv-kpi-head">
              <span className="cv-kpi-label">ACTIVE MEMBERS</span>
              <div className="cv-icon-bubble primary">
                <Users size={16} />
              </div>
            </div>
            <p className="cv-kpi-value">{loading ? "…" : members.length}</p>
            <span className="cv-kpi-sub">Approved officers &amp; members</span>
          </div>

          <div className="cv-member-kpi-card">
            <div className="cv-kpi-head">
              <span className="cv-kpi-label">PENDING JOIN REQUESTS</span>
              <div className="cv-icon-bubble warning">
                <ShieldAlert size={16} />
              </div>
            </div>
            <p className="cv-kpi-value">{loading ? "…" : requests.length}</p>
            <span className="cv-kpi-sub">
              {requests.length > 0 ? "Awaiting admin confirmation" : "No pending requests"}
            </span>
          </div>
        </section>

        {isAdmin && requests.length > 0 && (
          <section className="cv-requests-card">
            <div className="cv-requests-header">
              <ShieldCheck size={16} color="#2563eb" />
              <h3>Join Requests Awaiting Review ({requests.length})</h3>
            </div>

            <div className="cv-requests-list">
              {requests.map((r) => (
                <div className="cv-request-item" key={r.userId}>
                  <div className="cv-member-info">
                    <div className="cv-member-avatar">{initialsOf(r.fullName)}</div>
                    <div>
                      <h3>{r.fullName}</h3>
                      <p>{r.email}</p>
                    </div>
                  </div>
                  <div className="cv-request-actions">
                    <button
                      type="button"
                      className="cv-btn-approve"
                      onClick={() => handleApprove(r.userId)}
                    >
                      <UserCheck size={14} /> Approve
                    </button>
                    <button
                      type="button"
                      className="cv-btn-reject"
                      onClick={() => handleReject(r.userId)}
                    >
                      <UserX size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="cv-members-card">
          <div className="cv-members-toolbar">
            <div className="cv-members-search">
              <Search size={14} className="cv-search-icon" />
              <input
                placeholder="Search name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button type="button" className="cv-clear-btn" onClick={() => setSearchTerm("")}>
                  <X size={12} />
                </button>
              )}
            </div>
            <span className="cv-members-count-badge">{filteredMembers.length} Members</span>
          </div>

          <div className="cv-members-table-head">
            <span>MEMBER</span>
            <span>ROLE</span>
            <span>PERMISSIONS</span>
            <span style={{ textAlign: "right" }}>ACTIONS</span>
          </div>

          <div className="cv-members-list">
            {loading ? (
              <div className="cv-members-empty">Loading roster…</div>
            ) : filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <MemberRow
                  key={member.userId}
                  member={member}
                  isAdmin={isAdmin}
                  onRoleChange={handleRoleChange}
                  onRemove={handleRemove}
                />
              ))
            ) : (
              <div className="cv-members-empty">
                <Users size={28} />
                <p>No members found matching your search.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
