import React, { useEffect, useRef, useState } from "react";
import {
  Rocket,
  CreditCard,
  BookOpen,
  KeyRound,
  BarChart3,
  Search,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Mail,
  ExternalLink,
  FileText,
  ShieldCheck,
  Megaphone,
  RefreshCw,
} from "lucide-react";

import "./Support.css";

const categories = [
  {
    icon: Rocket,
    title: "Getting Started",
    description: "Setting up your club profile and first fund.",
  },
  {
    icon: CreditCard,
    title: "Managing Budgets",
    description: "Allocations, re-balancing, and tracking.",
  },
  {
    icon: BookOpen,
    title: "Transactions",
    description: "Reviewing ledgers and verifying receipts.",
  },
  {
    icon: KeyRound,
    title: "Member Access",
    description: "Inviting officers and permissions.",
  },
  {
    icon: BarChart3,
    title: "Reporting",
    description: "Exporting data and university compliance.",
  },
];

const faqs = [
  {
    question: "How do I submit an expense for reimbursement?",
    answer:
      'To submit an expense, navigate to the Dashboard and click "New Expense". Upload a clear image of your receipt, select the appropriate budget category, and provide a brief justification. Once submitted, your club treasurer and Student Union will receive it for approval.',
  },

  {
    question: "How to invite new members to the finance committee?",
    answer:
      'Head to the Members tab. Click "Invite Officer", enter their university email, and assign a role. They will receive setup instructions.',
  },

  {
    question: "Can I export reports for my university audit?",
    answer:
      "Yes, the Reporting section allows you to generate PDF and CSV summaries for any fiscal period.",
  },

  {
    question: "What happens if my budget is overspent?",
    answer:
      "The system will flag the overspent category. You can request a budget transfer or additional funding.",
  },
];

const trendingGuides = [
  {
    icon: FileText,
    title: "FY24 Tax Filing",
    description: "Everything for end-of-year tax season.",
  },
  {
    icon: ShieldCheck,
    title: "Account Security",
    description: "Best practices for multi-officer access.",
  },
  {
    icon: Megaphone,
    title: "Fundraising",
    description: "Log bake sales and donations.",
  },
  {
    icon: RefreshCw,
    title: "System Sync",
    description: "Connecting ClubVault to your school's ERP.",
  },
];

export default function Support() {
  const [activeFAQ, setActiveFAQ] = useState(0);
  const [searchValue, setSearchValue] = useState("");

  const searchRef = useRef(null);

  useEffect(() => {
    const shortcutHandler = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();

        searchRef.current?.focus();
      }
    };

    window.addEventListener("keydown", shortcutHandler);

    return () => window.removeEventListener("keydown", shortcutHandler);
  }, []);

  return (
    <main className="support-page">
      {/* PAGE HEADER */}

      <header className="support-header">
        <span className="support-eyebrow">Resources</span>

        <h1>Support & Help Center</h1>

        <p>Find guides, tutorials and answers to frequently asked questions.</p>
      </header>

      {/* SEARCH SECTION */}

      <section className="support-search">
        <h2>How can we help you today?</h2>

        <p>Search articles, tutorials and documentation for ClubVault.</p>

        <div className="support-search-box">
          <Search size={20} />

          <input
            ref={searchRef}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search for 'How to submit an expense'..."
          />

          <kbd>Ctrl + K</kbd>
        </div>
      </section>

      {/* CATEGORY CARDS */}

      <section className="support-categories">
        {categories.map((item, index) => {
          const Icon = item.icon;

          return (
            <article className="category-card" key={index}>
              <Icon size={34} strokeWidth={1.5} />

              <h3>{item.title}</h3>

              <p>{item.description}</p>
            </article>
          );
        })}
      </section>

      {/* MAIN CONTENT START */}

      <section className="support-main-grid">
        <div className="faq-card">
          <div className="faq-header">
            <h2>Common Questions</h2>

            <button>View All FAQ</button>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => {
              const open = activeFAQ === index;

              return (
                <div className="faq-item" key={index}>
                  <button
                    className="faq-question"
                    onClick={() => setActiveFAQ(open ? -1 : index)}
                  >
                    <span>{faq.question}</span>

                    {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>

                  {open && <div className="faq-answer">{faq.answer}</div>}
                </div>
              );
            })}
          </div>
        </div>
        {/* SUPPORT SIDEBAR */}

        <aside className="support-sidebar">
          {/* LIVE CHAT */}

          <div className="support-box live-chat-box">
            <div className="support-box-content">
              <h3>Live Chat</h3>

              <p>Currently Unavailable due to no Agent is Present , Will be Available Soon</p>

              <button className="chat-button">
                <MessageCircle size={16} />
                Start Conversation
              </button>
            </div>
          </div>

          {/* EMAIL SUPPORT */}

          <div className="support-box">
            <div className="support-box-title">
              <Mail size={18} />

              <div>
                <h4>Email Support</h4>

                <span>Response within 24 to 48 hours</span>
              </div>
            </div>

            <p>Best for complex billing questions or platform bugs.</p>

            <a href="mailto:support@clubvault.edu">support@clubvault.edu</a>
          </div>

          {/* UNIVERSITY GUIDELINES */}

          <div className="support-box guideline-box">
            <div className="support-box-title">
              <ExternalLink size={18} />

              <div>
                <h4>University Guidelines</h4>

                <span>External Resource</span>
              </div>
            </div>

            <p>Review official student organization financial bylaws.</p>

            <button className="handbook-button">
              Open Handbook
              <ExternalLink size={14} />
            </button>
          </div>
        </aside>
      </section>

      {/* TRENDING GUIDES */}

      <section className="trending-section">
        <h3>Trending Guides</h3>

        <div className="trending-grid">
          {trendingGuides.map((guide, index) => {
            const Icon = guide.icon;

            return (
              <article className="guide-card" key={index}>
                <Icon size={20} strokeWidth={1.5} />

                <div>
                  <h4>{guide.title}</h4>

                  <p>{guide.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
