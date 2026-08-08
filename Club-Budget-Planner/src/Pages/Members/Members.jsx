import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  Copy,
  Check,
  X,
  ShieldCheck,
  MoreVertical,
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

  return (
    <div className="member-row">
      <div className="member-info">
        <div className="avatar">{initialsOf(member.fullName)}</div>
        <div>
          <h3>{member.fullName}</h3>
          <p>{member.email}</p>
        </div>
      </div>

      <div className="role">
        <span className={member.role === "member" ? "secondary-badge" : "badge"}>
          {member.role === "admin" ? "Admin" : "Member"}
        </span>
      </div>

      <div className="permissions">{member.permissions}</div>

      {isAdmin ? (
        <div style={{ position: "relative" }}>
          <button className="more" onClick={() => setMenuOpen((v) => !v)}>
            <MoreVertical size={18} />
          </button>
          {menuOpen && (
            <div className="member-menu">
              <button
                onClick={() => {
                  onRoleChange(member.userId, member.role === "admin" ? "member" : "admin");
                  setMenuOpen(false);
                }}
              >
                Make {member.role === "admin" ? "Member" : "Admin"}
              </button>
              <button
                className="danger"
                onClick={() => {
                  onRemove(member.userId);
                  setMenuOpen(false);
                }}
              >
                Remove from club
              </button>
            </div>
          )}
        </div>
      ) : (
        <button className="more" disabled style={{ opacity: 0.3 }}>
          <MoreVertical size={18} />
        </button>
      )}
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
    await api.delete(`/api/clubs/${club._id}/members/${userId}`);
    await load();
  };

  const copyClubId = () => {
    navigator.clipboard.writeText(club?.clubId || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const filteredMembers = members.filter((m) => {
    const haystack = `${m.fullName} ${m.email} ${m.role}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  return (
    <main className="members-page">
      <header className="members-header">
        <div>
          <h1>Members</h1>
          <p>Manage committee access and roles.</p>
        </div>

        <button className="invite-btn" onClick={copyClubId}>
          {copied ? <Check size={17} /> : <Copy size={17} />}
          {copied ? "Copied!" : `Club ID: ${club?.clubId || "—"}`}
        </button>
      </header>

      {error && <p style={{ color: "var(--color-error)" }}>{error}</p>}

      <section className="stats">
        <div className="stat-card large">
          <div className="stat-title">
            <span>Active Members</span>
            <Users size={18} />
          </div>
          <div className="stat-number">{members.length}</div>
        </div>

        <div className="stat-card">
          <span>Pending Requests</span>
          <strong>{requests.length}</strong>
        </div>
      </section>

      {isAdmin && requests.length > 0 && (
        <section className="members-box">
          <div className="toolbar">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldCheck size={18} />
              <strong>Join requests awaiting your approval</strong>
            </div>
          </div>

          <div className="member-list">
            {requests.map((r) => (
              <div className="member-row" key={r.userId}>
                <div className="member-info">
                  <div className="avatar">{initialsOf(r.fullName)}</div>
                  <div>
                    <h3>{r.fullName}</h3>
                    <p>{r.email}</p>
                  </div>
                </div>
                <div className="role">
                  <span className="secondary-badge">Pending</span>
                </div>
                <div className="permissions" />
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="approve-btn" onClick={() => handleApprove(r.userId)}>
                    <Check size={16} /> Approve
                  </button>
                  <button className="reject-btn" onClick={() => handleReject(r.userId)}>
                    <X size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="members-box">
        <div className="toolbar">
          <div className="search">
            <Search size={18} />
            <input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-header">
          <span>Name</span>
          <span>Role</span>
          <span>Permissions</span>
          <span>Actions</span>
        </div>

        <div className="member-list">
          {loading ? (
            <p style={{ padding: 16 }}>Loading members…</p>
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
            <p style={{ padding: 16 }}>No members found.</p>
          )}
        </div>
      </section>
    </main>
  );
}
