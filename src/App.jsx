import React, { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import MyTasks from "./pages/MyTasks";
import DashboardMember from "./pages/DashboardMember";
import DashboardAdmin from "./pages/DashboardAdmin";
import ManageUsers from "./pages/ManageUsers";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Profile from "./pages/Profile";

// =========================
// Protected Route Wrapper
// =========================
const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  const session = localStorage.getItem("pms:session");

  if (!token && !session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// =========================
// Role Based Redirect Component
// =========================
const DashboardRedirect = () => {
  try {
    const sessionData =
      localStorage.getItem("pms:session") ||
      localStorage.getItem("user");

    if (sessionData) {
      const parsedData = JSON.parse(sessionData);
      const loggedUser =
        parsedData?.user || parsedData?.data || parsedData;
      const role = String(loggedUser?.role || "").trim().toLowerCase();

      if (role === "admin") {
        return <Navigate to="/admin-dashboard" replace />;
      }
      if (role === "member") {
        return <Navigate to="/dashboard-member" replace />;
      }
    }
  } catch (error) {
    console.error("Dashboard redirect error:", error);
  }

  // Default Manager Dashboard
  return <Dashboard />;
};

// =========================
// Main Layout Component
// =========================
const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc]">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navigation */}
        <Navbar
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Page Content dynamically injected here */}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// =========================
// Main App Component
// =========================
const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registration />} />

      {/* Protected Routes Group */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* Smart Redirect to Role Specific Dashboard */}
          <Route path="/dashboard" element={<DashboardRedirect />} />

          {/* Admin Routes */}
          <Route path="/admin-dashboard" element={<DashboardAdmin />} />
          <Route path="/manage-users" element={<ManageUsers />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/manage-projects" element={<Projects />} />
          <Route path="/manage-tasks" element={<Tasks />} />

          {/* Manager Routes */}
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/profile" element={<Profile/>}/>

          {/* Member Routes */}
          <Route path="/dashboard-member" element={<DashboardMember />} />
          <Route path="/my-tasks" element={<MyTasks />} />
        </Route>
      </Route>

      {/* Catch-all Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};  

export default App;