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

// Global Layout wrapper: Sidebar (left) + Topbar (top, holds ProfileMenu) + page content
const DashboardLayout = () => {
  return (
    <div className="dashboard-layout-container">
      <Sidebar />

      {/* Everything to the right of the sidebar: Topbar sits above whichever page is active */}
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
  // Public Routes (No Profile Menu or Sidebar here)
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
    element: <Signup />
  },

  // Protected Dashboard Routes grouped inside the Layout wrapper
  {
    element: <DashboardLayout />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />
      },
      {
        path: "/reportanalytics",
        element: <ReportsAnalytics />
      },
      {
        path: "/budgets",
        element: <Budgets />
      },
      {
        path:"/transactions",
        element:<Transactions/>
      }
    ]
  }
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;