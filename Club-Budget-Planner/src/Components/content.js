import { Users, Calendar, LineChart } from "lucide-react";

export const NAV_LINKS = [
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "Pricing",
    href: "#pricing",
  },
  {
    label: "About",
    href: "#about",
  },
];

export const FEATURES = [
  {
    icon: LineChart,
    title: "Budget Tracking",
    desc: "Visualize allocations and track spending against university grants in real-time.",
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    desc: "Work seamlessly with your executive board to manage funds and approvals.",
  },
  {
    icon: Calendar,
    title: "Event Planning",
    desc: "Forecast costs and manage vendor invoices for your biggest campus events.",
  },
];

/**
 * priceMonthly  -> price shown when billing = "monthly"
 * priceYearly   -> effective PER-MONTH price when billing = "yearly" (billed annually)
 * Yearly is modeled as roughly a 20% discount off the monthly rate.
 */
export const PLANS = [
  {
    name: "Starter",
    desc: "For small clubs starting out.",
    priceMonthly: 0,
    priceYearly: 0,
    features: ["1 Treasury Account", "Basic Expense Tracking", "2 Admin Users"],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Executive",
    desc: "For established student unions.",
    priceMonthly: 299,
    priceYearly: 239,
    features: [
      "Unlimited Accounts",
      "Advanced Receipt OCR",
      "Unlimited Users & Roles",
      "University Export Formats",
    ],
    cta: "Start Free Trial",
    featured: true,
  },
  {
    name: "Council",
    desc: "For overarching governing bodies.",
    priceMonthly: 999,
    priceYearly: 799,
    features: ["Multi-Club Management", "Consolidated Auditing", "Dedicated Support Lead"],
    cta: "Contact Sales",
    featured: false,
  },
];

/**
 * Hero + stats-banner numbers.
 * `decimals` is optional (used by the 99.9% uptime stat).
 */
export const STATS = [
  { target: 50, prefix: "₹", suffix: "L+", label: "Managed Annually" },
  { target: 250, suffix: "+", label: "Clubs Onboarded" },
  { target: 20, suffix: "K+", label: "Transactions Logged" },
  { target: 99.9, suffix: "%", label: "Platform Uptime", decimals: 1 },
];

export const TESTIMONIALS = [
  {
    name: "Aditi Rao",
    role: "Treasurer, Debate Society",
    initials: "AR",
    rating: 5,
    quote:
      "Our audit went from a two-week scramble to a two-hour export. The whole exec board finally sees the same numbers.",
  },
  {
    name: "Marcus Chen",
    role: "President, Robotics Club",
    initials: "MC",
    rating: 5,
    quote:
      "We stopped losing receipts in a group chat. Every purchase is tagged, approved, and traceable now.",
  },
  {
    name: "Priya Nair",
    role: "Finance Secretary, Cultural Council",
    initials: "PN",
    rating: 4,
    quote:
      "Event budgeting used to be a spreadsheet nightmare across three people. ClubVault made it one shared view.",
  },
];

export const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", modalType: "changelog" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Careers", modalType: "careers" },
      { label: "Contact", modalType: "contact" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Documentation", modalType: "guidelines" },
      { label: "University Guidelines", modalType: "guidelines" },
      {
        label: "GitHub",
        href: "https://github.com/Code-by-Harshdeep/ClubVault",
        external: true,
      },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", modalType: "privacy" },
      { label: "Terms of Service", modalType: "terms" },
    ],
  },
];