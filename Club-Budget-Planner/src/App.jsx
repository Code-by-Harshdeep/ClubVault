import "./theme.css";
import "./App.css"; // <-- Ensure App.css is imported here!
import ClubVaultLanding from "./Components/ClubVaultLanding";

import Topbar from "./Components/Topbar/Topbar";
import Sidebar from "./Components/Sidebar/Sidebar";

import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import Login from "./Pages/Auth/Login";
import Signup from "./Pages/Auth/Signup";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import VerifyEmail from "./Pages/Auth/VerifyEmail";

import Dashboard from "./Pages/Dashboard/Dashboard";
import ReportsAnalytics from "./Pages/Reports/ReportsAnalytics";
import Budgets from "./Pages/Budget/Budgets";
import Transactions from "./Pages/Transactions/Transactions";
import EventsPlanning from "./Pages/Events/EventsPlanning";
import Members from "./Pages/Members/Members";
import Settings from "./Pages/Settings/Settings";
import Support from "./Components/Support/Support";
import { ThemeProvider } from "./ThemeContext";
import { ClubProvider } from "./ClubContext";
import ClubSetup from "./Pages/Club/ClubSetup";
import RequireApprovedClub from "./Components/RequireApprovedClub";
import RequireFeature from "./Components/RequireFeature";
import Reimbursements from "./Pages/Features/Reimbursements";
import NotFound from "./Pages/NotFound/NotFound";

// Global Layout wrapper
const DashboardLayout = () => {
  return (
    <div className="dashboard-layout-container">
      <Sidebar />

      {/* Everything to the right of the sidebar */}
      <div className="dashboard-layout-main">
        <Topbar />

        <main className="dashboard-layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const router = createBrowserRouter([
  // Public Routes
  {
    path: "/",
    element: <ClubVaultLanding />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ForgotPassword />,
  },
  {
    path: "/club-setup",
    element: <ClubSetup />,
  },

  // Protected Dashboard Routes — must be an approved club member
  {
    element: <RequireApprovedClub />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
          },
          {
            path: "/analytics",
            element: (
              <RequireFeature feature="analytics">
                <ReportsAnalytics />
              </RequireFeature>
            ),
          },
          {
            path: "/budgets",
            element: <Budgets />,
          },
          {
            path: "/transactions",
            element: <Transactions />,
          },
          {
            path: "/events",
            element: (
              <RequireFeature feature="events">
                <EventsPlanning />
              </RequireFeature>
            ),
          },
          {
            path: "/reimbursements",
            element: <Reimbursements />,
          },
          {
            path: "/members",
            element: <Members />,
          },
          {
            path: "/settings",
            element: <Settings />,
          },
          {
            path: "/support",
            element: <Support />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

const App = () => {
  return (
    <ThemeProvider>
      <ClubProvider>
        <RouterProvider router={router} />
      </ClubProvider>
    </ThemeProvider>
  );
};

export default App;