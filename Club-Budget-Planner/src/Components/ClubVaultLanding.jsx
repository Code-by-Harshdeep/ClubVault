import React, { useState } from "react";
import "./ClubVaultLanding.css";
import budgetImage from "../assets/budget.png";
import collabImage from "../assets/collab.png";
import mainImage from "../assets/main.jpg";

import {
  Users,
  Wallet,
  ChartLine,
  CirclePlay,
  CircleCheck,
  ReceiptText,
  Menu,
} from "lucide-react";

import { NAV_LINKS, FEATURES, PLANS } from "./content";
import DemoModal from "./WatchDemo/DemoModal";

/**
 * ClubVault — Editorial Landing Page
 */

export default function ClubVaultLanding() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="cv-root">
      {/* Navigation */}
      <nav className="cv-nav">
        <div className="cv-nav-inner">
          <div className="cv-nav-left">
            <a className="cv-logo" href="/">
              ClubVault
            </a>

            <div className="cv-nav-links">
              {NAV_LINKS.map((link, i) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`cv-nav-link${i === 0 ? " active" : ""}`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="cv-nav-right">
            <a href="/login" className="cv-link-login">
              Log In
            </a>

            <a href="/signup" className="cv-btn-nav-cta">
              Get Started
            </a>

            <button className="cv-menu-btn" aria-label="Open menu">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="cv-hero">
        <div className="cv-container cv-hero-grid">
          <div className="cv-hero-copy">
            <h1 className="cv-h1">
              Know where every club dollar stands, right now.
            </h1>

            <p className="cv-hero-sub">
              Track spending, plan budgets, and keep your executive board
              aligned — a treasury built for the way student organizations
              actually run.
            </p>

            <div className="cv-hero-actions">
              <a href="/signup" className="cv-btn-primary">
                Start Your Vault
              </a>

              <button
                className="cv-btn-secondary"
                onClick={() => setDemoOpen(true)}
              >
                <CirclePlay size={16} />
                Watch Demo
              </button>
            </div>
          </div>

          <div className="cv-hero-visual">
            <div className="cv-hero-backcard" />

            <div className="cv-hero-imgwrap">
              <img
                className="cv-hero-img"
                src={mainImage}
                alt="Dashboard"
              />
            </div>

            <div className="cv-glass-card">
              <div className="cv-glass-top">
                <div className="cv-glass-icon">
                  <ChartLine size={18} />
                </div>

                <div>
                  <p className="cv-glass-label">Fall Budget</p>
                  <p className="cv-glass-amount">$12,450</p>
                </div>
              </div>

              <div className="cv-progress-track">
                <div className="cv-progress-fill" />
              </div>

              <p className="cv-progress-caption">
                75% Allocated
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURES */}
      <section id="features" className="cv-section">
        <div className="cv-container">
          <div className="cv-section-head">
            <h2 className="cv-h2">Everything you need.</h2>

            <p className="cv-section-sub">
              Tools built specifically for the unique needs of student
              organizations.
            </p>
          </div>

          <div className="cv-features-grid">
            {FEATURES.map((f) => {
              const FeatureIcon = f.icon;

              return (
                <div className="cv-feature" key={f.title}>
                  <div className="cv-feature-icon">
                    <FeatureIcon size={28} />
                  </div>

                  <h3 className="cv-h3">
                    {f.title}
                  </h3>

                  <p className="cv-feature-desc">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="cv-editorial">
        <div className="cv-container">
          <div className="cv-editorial-row">
            <div className="cv-editorial-media first">
              <img
                src={budgetImage}
                alt="Budgeting"
              />
            </div>

            <div className="cv-editorial-copy">
              <h2 className="cv-h2-lg">
                Precision Budgeting.
              </h2>

              <p className="cv-editorial-desc">
                Take control of your finances with tools that offer unparalleled
                detail and clarity. See exactly where every dollar goes and
                ensure your organization's financial health.
              </p>

              <ul className="cv-checklist">
                <li>
                  <CircleCheck
                    className="cv-icon"
                    size={20}
                  />
                  Automated categorization
                </li>

                <li>
                  <CircleCheck
                    className="cv-icon"
                    size={20}
                  />
                  Custom spending limits
                </li>
              </ul>
            </div>
          </div>
                    <div className="cv-editorial-row">
            <div className="cv-editorial-copy second">
              <h2 className="cv-h2-lg">
                Seamless Collaboration.
              </h2>

              <p className="cv-editorial-desc">
                Empower your entire team to participate in financial management
                without compromising security or accountability. Shared views
                and role-based access make it easy.
              </p>

              <ul className="cv-checklist">
                <li>
                  <CircleCheck
                    className="cv-icon"
                    size={20}
                  />
                  Multi-user access control
                </li>

                <li>
                  <CircleCheck
                    className="cv-icon"
                    size={20}
                  />
                  Transparent audit logs
                </li>
              </ul>
            </div>

            <div className="cv-editorial-media">
              <img
                src={collabImage}
                alt="Collaboration"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Asymmetrical Feature Section */}
      <section className="cv-asym">
        <div className="cv-container">
          <div className="cv-asym-head">
            <h2 className="cv-asym-title">
              Designed for precision. Built for accountability.
            </h2>

            <p className="cv-asym-sub">
              Move beyond messy spreadsheets. Experience a structured
              environment that honors your organization's funds.
            </p>
          </div>

          <div className="cv-asym-grid">
            <div className="cv-card-large">
              <div className="cv-card-large-content">
                <Wallet
                  size={30}
                  className="cv-card-large-icon"
                />

                <h3 className="cv-h3">
                  Centralized Treasury
                </h3>

                <p>
                  Unify all your accounts, cash boxes, and university
                  allocations into one clear dashboard. Total visibility,
                  zero guesswork.
                </p>
              </div>

              <div className="cv-blur-decoration" />

              <div className="cv-bar-decoration">
                <div className="cv-bars">
                  <div className="cv-bar h1" />
                  <div className="cv-bar h2" />
                  <div className="cv-bar h3" />
                  <div className="cv-bar h4" />
                </div>
              </div>
            </div>

            <div className="cv-cards-stack">
              <div className="cv-card-small">
                <ReceiptText
                  size={22}
                  className="cv-card-small-icon"
                />

                <h3>Audit-Ready Trails</h3>

                <p>
                  Every transaction tagged, categorized, and receipt-matched
                  for flawless university reporting.
                </p>
              </div>

              <div className="cv-card-small dark">
                <Users
                  size={22}
                  className="cv-card-small-icon"
                />

                <h3>Committee Access</h3>

                <p>
                  Role-based permissions ensure the Treasurer holds the keys,
                  while the board stays informed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="cv-pricing">
        <div className="cv-container">
          <div className="cv-section-head">
            <h2 className="cv-h2">
              Transparent Tiers
            </h2>

            <p className="cv-section-sub">
              Invest in your club's financial infrastructure with plans
              designed for student organizations of every size.
            </p>
          </div>

          <div className="cv-pricing-grid">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`cv-plan${
                  plan.featured ? " featured" : ""
                }`}
              >
                {plan.featured && (
                  <div className="cv-plan-badge">
                    Most Popular
                  </div>
                )}

                <h3 className="cv-plan-name">
                  {plan.name}
                </h3>

                <p className="cv-plan-desc">
                  {plan.desc}
                </p>

                <div className="cv-plan-price">
                  <span className="amount">
                    {plan.price}
                  </span>

                  <span className="period">
                    /mo
                  </span>
                </div>

                <ul className="cv-plan-features">
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <CircleCheck size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.name === "Council" ? (
                  <button
                    className="cv-btn-secondary"
                    style={{ width: "100%" }}
                  >
                    {plan.cta}
                  </button>
                ) : (
                  <a
                    href="#"
                    className={
                      plan.featured
                        ? "cv-btn-primary"
                        : "cv-btn-secondary"
                    }
                    style={{
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    {plan.cta}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
            {/* Footer */}
      <footer className="cv-footer">
        <div className="cv-footer-inner">
          <div className="cv-footer-brand">
            <span className="cv-footer-logo">
              ClubVault
            </span>

            <span className="cv-footer-copy">
              © 2026 ClubVault Finance. Built for Student Leaders.
            </span>
          </div>

          <div className="cv-footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">University Guidelines</a>
          </div>
        </div>
      </footer>

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}