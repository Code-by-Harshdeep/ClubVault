import React from "react";
import {
  Plus,
  Users,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  UserPlus,
} from "lucide-react";

import "./Members.css";

const members = [
  {
    name: "Sarah Jenkins",
    email: "sarah.j@university.edu",
    role: "President",
    permissions: "Full Access",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAJWjLLrcSEZGH9uA0wWvoYx21Xz-cFb_yFdWk9av-APMk-8uqnNblKd96xDTI_AlHcHmkpJh3o5XG3X_3wnnwR58NE0MjAM4pIbVamVcjlFQXZXGBI2UQGSDfRXPiWcmHvd0exSh5Bt7NY4WgfiVydY-C3N56jPqtl9FQ98LYICxWopbIeefiGvxX1ifPE5UIiEljnOBsvTwiqFVGuDflKEa5rdWG9W1iocss_cls9UZcNtrkgY7aa5u3xSiE8jbZA2HBuUSqxiKCT",
  },
  {
    name: "Michael Chang",
    email: "m.chang@university.edu",
    role: "Treasurer",
    permissions: "Financial, Reporting",
    initials: "MJ",
  },
  {
    name: "David Rodriguez",
    email: "d.rodriguez@university.edu",
    role: "Member",
    permissions: "View Only",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCBh67U1zk71hTG-XqYsuhlxqoEeq9TTwVwbJesLGuqeIrnqxuSVoBDgh2wUy9XrlXpi5J4BG4R46eMVQsyT4DW1GbG_HVHhCtLCWaK9g4eiCO9O3VC9AqVdnXgdI6qvkoY8oAqRr7JWoiUou-_hGiS47LppSVopurEJaA-RJ4KHd6p2vEW2MdLUFyg5xtG9nEZw0_6f4xITYHdhgp3dcFwCun_ENg0NUlWM4m17F5QOyr_Cm782WoM_7-hnuwa1R-LjcQJNLaZtgiQ",
  },
];

function MemberAvatar({ member }) {
  return (
    <div className="avatar">
      {member.avatar ? (
        <img src={member.avatar} alt={member.name} />
      ) : (
        member.initials
      )}
    </div>
  );
}

function MemberRow({ member }) {
  return (
    <div className="member-row">
      <div className="member-info">
        <MemberAvatar member={member} />

        <div>
          <h3>{member.name}</h3>

          <p>{member.email}</p>
        </div>
      </div>

      <div className="role">
        <span
          className={member.role === "Member" ? "secondary-badge" : "badge"}
        >
          {member.role}
        </span>
      </div>

      <div className="permissions">{member.permissions}</div>

      <button className="more">
        <MoreVertical size={18} />
      </button>
    </div>
  );
}

export default function Members() {
  return (
    <main className="members-page">
      <header className="members-header">
        <div>
          <h1>Members</h1>

          <p>Manage committee access and roles.</p>
        </div>

        <button className="invite-btn">
          <UserPlus size={17} />
          Invite Member
        </button>
      </header>

      <section className="stats">
        <div className="stat-card large">
          <div className="stat-title">
            <span>Active Members</span>

            <Users size={18} />
          </div>

          <div className="stat-number">
            24
            <small>/ 30 Seats</small>
          </div>
        </div>

        <div className="stat-card">
          <span>Pending Invites</span>

          <strong>3</strong>
        </div>
      </section>

      <section className="members-box">
        <div className="toolbar">
          <div className="search">
            <Search size={18} />

            <input placeholder="Search members..." />
          </div>

          <div className="filters">
            <button>
              <Filter size={15} />
              Role
            </button>

            <button>
              <ArrowUpDown size={15} />
              Sort
            </button>
          </div>
        </div>

        <div className="table-header">
          <span>Name</span>

          <span>Role</span>

          <span>Permissions</span>

          <span>Actions</span>
        </div>

        <div className="member-list">
          {members.map((member) => (
            <MemberRow key={member.email} member={member} />
          ))}
        </div>
      </section>
    </main>
  );
}
