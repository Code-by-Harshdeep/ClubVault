import { Users, Calendar, ChartLine } from "lucide-react";

export const NAV_LINKS = ["Product", "Features", "Pricing", "About"];

export const FEATURES = [
  {
    icon: ChartLine,
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

export const PLANS = [
  {
    name: "Starter",
    desc: "For small clubs starting out.",
    price: "₹0",
    features: ["1 Treasury Account", "Basic Expense Tracking", "2 Admin Users"],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Executive",
    desc: "For established student unions.",
    price: "₹299",
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
    price: "₹999",
    features: ["Multi-Club Management", "Consolidated Auditing", "Dedicated Support Lead"],
    cta: "Contact Sales",
    featured: false,
  },
];