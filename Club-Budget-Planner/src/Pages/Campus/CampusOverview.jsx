import React, { useEffect, useState } from "react";
import { Building2, RefreshCw, Users } from "lucide-react";
import { useClub } from "../../ClubContext";
import { api } from "../../api";
import "../Features/FeaturePages.css";

const CampusOverview = () => {
  const { club } = useClub();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    if (!club?.campusId) return;
    setLoading(true);
    setError("");
    try {
      setData(await api.get(`/api/campuses/${club.campusId}/overview`));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [club?.campusId]);

  return (
    <main className="feature-page">
      <header className="feature-page-header">
        <div>
          <p className="feature-page-eyebrow"><Building2 size={14} /> Institution overview</p>
          <h1>{data?.campus?.name || "Campus overview"}</h1>
          <p>See the clubs operating under this institution and the people they serve.</p>
        </div>
        <button className="feature-action" onClick={load} disabled={loading}><RefreshCw size={15} /> Refresh</button>
      </header>
      {error && <p className="feature-muted">{error}</p>}
      {loading && !data ? <div className="feature-panel"><div className="feature-empty">Loading campus overview...</div></div> : data && <>
        <section className="feature-stat-grid">
          <div className="feature-stat"><span>Registered clubs</span><strong>{data.summary.clubCount}</strong></div>
          <div className="feature-stat"><span>Approved members</span><strong>{data.summary.memberCount}</strong></div>
          <div className="feature-stat"><span>Verification</span><strong>{data.campus.status}</strong></div>
        </section>
        <section className="feature-panel">
          <h2>Clubs at this campus</h2>
          <p>Each club maintains its own budget, members, and transactions.</p>
          <div className="feature-card-grid">{data.clubs.map((item) => <article className="integration-tile" key={item._id}><Building2 size={22} /><h2>{item.name}</h2><p>{item.description || "No description provided."}</p><span className="feature-badge"><Users size={13} /> {item.memberCount} members</span><p className="feature-muted">Club ID: {item.clubId}</p></article>)}</div>
        </section>
      </>}
    </main>
  );
};

export default CampusOverview;