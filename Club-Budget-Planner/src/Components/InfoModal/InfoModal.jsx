import React, { useEffect } from "react";
import {
  X,
  ShieldCheck,
  FileText,
  Sparkles,
  Briefcase,
  Mail,
  BookOpen,
  Scale,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import "./InfoModal.css";

export const INFO_MODAL_CONTENTS = {
  privacy: {
    badge: "Security & Compliance",
    icon: ShieldCheck,
    title: "Privacy Policy",
    subtitle: "How ClubVault protects student and organization financial records.",
    content: (
      <div className="info-modal-body">
        <section>
          <h4>1. Information We Collect</h4>
          <p>
            ClubVault collects university email addresses, club names, ledger entries, and transaction receipts necessary to maintain an accurate treasury record. We do not sell or monetize student data.
          </p>
        </section>
        <section>
          <h4>2. FERPA & University Data Protection</h4>
          <p>
            All financial logs and member rosters are encrypted in transit (TLS 1.3) and at rest (AES-256). We comply with standard higher-education privacy frameworks to ensure committee data remains confidential to authorized campus members.
          </p>
        </section>
        <section>
          <h4>3. Account Security & Verification</h4>
          <p>
            Your email is used to uniquely identify student leaders and maintain verified organizational authority across budget management and club proposals.
          </p>
        </section>
        <section>
          <h4>4. Data Retention & Deletion</h4>
          <p>
            Campus administrators and club treasurers can export full audit trails (CSV/PDF) at any time. Upon club decommissioning, historical logs are archived in accordance with university audit bylaws.
          </p>
        </section>
      </div>
    ),
  },
  terms: {
    badge: "Legal Agreement",
    icon: Scale,
    title: "Terms of Service",
    subtitle: "Operational rules and governance standards for student organizations.",
    content: (
      <div className="info-modal-body">
        <section>
          <h4>1. Account Responsibilities</h4>
          <p>
            Club officers, treasurers, and presidents are responsible for maintaining the confidentiality of their credentials and ensuring all logged expenses represent genuine student organization activities.
          </p>
        </section>
        <section>
          <h4>2. Budget Caps & Financial Integrity</h4>
          <p>
            ClubVault provides strict budget locking. Attempting to bypass university-mandated annual budget caps or submit fraudulent expense claims violates both platform terms and campus student codes of conduct.
          </p>
        </section>
        <section>
          <h4>3. Audit Trails & Accountability</h4>
          <p>
            All ledger entries, approvals, and reimbursements are permanently timestamped. The Student Union and faculty advisors have viewing privileges for compliance auditing.
          </p>
        </section>
        <section>
          <h4>4. Availability & Warranties</h4>
          <p>
            ClubVault is provided for university organizations with a 99.9% uptime target. Scheduled maintenance is announced in advance during non-critical fiscal audit windows.
          </p>
        </section>
      </div>
    ),
  },
  changelog: {
    badge: "Product Updates",
    icon: Sparkles,
    title: "Platform Changelog",
    subtitle: "Recent improvements and features deployed to ClubVault.",
    content: (
      <div className="info-modal-body">
        <div className="changelog-entry">
          <div className="changelog-version">v2.4.0 &bull; Latest Release</div>
          <h4>🔒 Gmail + Nodemailer 2FA & Password Recovery</h4>
          <ul>
            <li>Integrated seamless Gmail SMTP service for all verification codes and alerts.</li>
            <li>Added 6-digit interactive OTP screen with auto-focus and clipboard paste.</li>
            <li>Deployed instant 15-minute Password Reset with one-click direct recovery links.</li>
            <li>Clean-slate club initialization starting with 0 active budgets for complete customization.</li>
          </ul>
        </div>
        <div className="changelog-entry">
          <div className="changelog-version">v2.3.0</div>
          <h4>📊 Real-time Audit Exports & Dark Mode</h4>
          <ul>
            <li>Instant CSV Audit Sheet export for campus finance committees.</li>
            <li>Full high-contrast Dark Mode design system with smooth theme switching.</li>
            <li>Dynamic budget utilization alerts (80% warning and critical threshold detection).</li>
          </ul>
        </div>
      </div>
    ),
  },
  careers: {
    badge: "Join the Team",
    icon: Briefcase,
    title: "Student Ambassador & Developer Fellowship",
    subtitle: "Help bring financial clarity to student leaders at your campus.",
    content: (
      <div className="info-modal-body">
        <section>
          <h4>Campus Ambassador Program</h4>
          <p>
            Lead the adoption of modern treasury tools at your college! Ambassadors work directly with Student Unions, council leaders, and campus clubs to modernize financial operations.
          </p>
        </section>
        <section>
          <h4>Open Positions (Fall 2026)</h4>
          <ul>
            <li><strong>Campus Lead Ambassador:</strong> Onboard university clubs and lead workshops.</li>
            <li><strong>Full-Stack Engineering Intern:</strong> Work on React, Node.js, and security features.</li>
            <li><strong>UI/UX Design Fellow:</strong> Design next-gen financial interfaces for student organizations.</li>
          </ul>
        </section>
        <section>
          <h4>How to Apply</h4>
          <p>
            Send your resume and a brief intro about your campus leadership experience to <a href="mailto:careers@clubvault.edu" style={{ color: "#2563eb" }}>careers@clubvault.edu</a>.
          </p>
        </section>
      </div>
    ),
  },
  contact: {
    badge: "Get in Touch",
    icon: Mail,
    title: "Contact ClubVault",
    subtitle: "We're here to assist treasurers, presidents, and faculty advisors.",
    content: (
      <div className="info-modal-body">
        <div className="contact-grid">
          <div className="contact-card">
            <h4>📧 General Support</h4>
            <p>For account assistance, feature questions, or setup help:</p>
            <a href="mailto:support@clubvault.edu" className="contact-link">support@clubvault.edu</a>
          </div>
          <div className="contact-card">
            <h4>🏛️ Campus Council Partnerships</h4>
            <p>For university-wide deployments and ERP integrations:</p>
            <a href="mailto:partnerships@clubvault.edu" className="contact-link">partnerships@clubvault.edu</a>
          </div>
        </div>
        <div className="contact-note">
          <CheckCircle2 size={16} color="#16a34a" />
          <span>Average response time: <strong>under 4 hours</strong> during school terms.</span>
        </div>
      </div>
    ),
  },
  guidelines: {
    badge: "University Standard",
    icon: BookOpen,
    title: "University Financial Guidelines",
    subtitle: "5 Golden Rules for Student Organization Treasurers.",
    content: (
      <div className="info-modal-body">
        <section>
          <h4>1. Real-time Receipt Retention</h4>
          <p>
            Every purchase exceeding ₹100 requires an attached itemized receipt or tax invoice uploaded to the ledger within 48 hours.
          </p>
        </section>
        <section>
          <h4>2. Dual Officer Sign-off</h4>
          <p>
            Reimbursement claims exceeding ₹2,500 must be reviewed by the Club Treasurer and confirmed by the Executive President before disbursement.
          </p>
        </section>
        <section>
          <h4>3. Strict Annual Budget Cap</h4>
          <p>
            Total cumulative allocations across all categories cannot exceed the university's approved fiscal grant.
          </p>
        </section>
        <section>
          <h4>4. Transparent Semester Auditing</h4>
          <p>
            All clubs must export their final CSV ledger log at the end of each academic semester for submission to the Student Activities Council.
          </p>
        </section>
      </div>
    ),
  },
};

export default function InfoModal({ openType, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    if (openType) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openType, onClose]);

  if (!openType || !INFO_MODAL_CONTENTS[openType]) return null;

  const data = INFO_MODAL_CONTENTS[openType];
  const IconComponent = data.icon || FileText;

  return (
    <div
      className="info-modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="info-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="info-modal-header">
          <div className="info-modal-header-left">
            <span className="info-modal-badge">
              <IconComponent size={14} />
              {data.badge}
            </span>
            <h2>{data.title}</h2>
            <p>{data.subtitle}</p>
          </div>
          <button
            className="info-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="info-modal-scrollable">
          {data.content}
        </div>

        {/* Footer */}
        <div className="info-modal-footer">
          <span>ClubVault Financial Operating System</span>
          <button className="info-modal-done-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
