import "./theme.css";
import "./App.css"; // <-- Ensure App.css is imported here!
import ClubVaultLanding from "./Components/ClubVaultLanding";

import Topbar from "./Components/Topbar/Topbar";
import Sidebar from "./Components/Sidebar/Sidebar";

import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import Login from "./Pages/Auth/Login";
import Signup from "./Pages/Auth/Signup";

import Dashboard from "./Pages/Dashboard/Dashboard";
import ReportsAnalytics from "./Pages/Reports/ReportsAnalytics";
import Budgets from "./Pages/Budget/Budgets";
import Transactions from "./Pages/Transactions/Transactions";
import EventsPlanning from "./Pages/Events/EventsPlanning";
import Members from "./Pages/Members/Members";
import Settings from "./Pages/Settings/Settings";
import { ThemeProvider } from "./ThemeContext";

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

  // Protected Dashboard Routes
  {
    element: <DashboardLayout />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/analytics",
        element: <ReportsAnalytics />,
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
        path:"/events",
        element:<EventsPlanning/>
      },
      {
        path:"/members",
        element:<Members/>
      },
      {
        path:"/settings",
        element:<Settings/>
      },
    ],
  },
]);

const App = () => {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;