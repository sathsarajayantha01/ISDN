import React, { useState, useEffect } from "react";
import { MainLayout } from "./components/layout/MainLayout";
import { Login } from "./pages/Login/Login";
import { ToastProvider, useToast } from "./context/ToastContext";
import { branches } from "./data/mockData";
import { apiAdapter } from "./services/apiAdapter";
import { getRouteComponent } from "./routes";

// Mock User
const currentUser = {
  id: "u1",
  name: "Alex Morgan",
  email: "alex.m@islandlink.sys",
  role: "admin",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};

// Helper functions to get data from localStorage
const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

const getCurrentBranchId = () => {
  return localStorage.getItem("branchId");
};

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [currentBranchId, setCurrentBranchId] = useState("1");
  const { addToast } = useToast();

  // Initialize authentication state from localStorage and fetch current user
  useEffect(() => {
    const token = apiAdapter.getToken();
    const storedBranchId = getCurrentBranchId();

    if (token) {
      setIsAuthenticated(true);

      // Fetch fresh user data from API (optional - comment out if endpoint doesn't exist yet)
      // apiAdapter
      //   .post("/auth/refresh")
      //   .then((response) => {
      //     if (response.success && response.data) {
      //       // Update localStorage with fresh data
      //       localStorage.setItem("user", JSON.stringify(response.data));
      //       localStorage.setItem("branchId", response.data.branchId);
      //       localStorage.setItem("username", response.data.username);
      //       localStorage.setItem("userRole", response.data.role.roleName);
      //       setCurrentBranchId(response.data.branchId);
      //     }
      //   })
      //   .catch((error) => {
      //     console.error("Failed to refresh user data", error);
      //     // If token is invalid, logout
      //     apiAdapter.removeToken();
      //     setIsAuthenticated(false);
      //   });
    }

    if (storedBranchId) {
      setCurrentBranchId(storedBranchId);
    }
  }, []);

  const currentBranch =
    branches.find((b) => b.id === currentBranchId) || branches[0];

  // Auth Handlers
  const handleLogin = () => {
    setIsAuthenticated(true);
    const user = getCurrentUser();
    const userBranchId = getCurrentBranchId();

    if (userBranchId) {
      setCurrentBranchId(userBranchId);
    }

    addToast(
      "success",
      `Welcome back, ${user?.name || user?.username || "User"}! You have successfully signed in.`,
    );
  };

  const handleLogout = () => {
    // Clear all auth data from localStorage
    apiAdapter.removeToken();
    localStorage.removeItem("user");
    localStorage.removeItem("branchId");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");

    // Update state to navigate to login
    setIsAuthenticated(false);
    setActivePage("dashboard");

    addToast("info", "You have been signed out.");

    // Optionally call logout API (don't wait for response)
    apiAdapter.post("/auth/logout").catch((error) => {
      console.error("Logout API call failed:", error);
    });
  };

  // Handlers
  const handleSwitchBranch = (branchId) => {
    setCurrentBranchId(branchId);
    localStorage.setItem("branchId", branchId);
    addToast(
      "info",
      `Switched to ${branches.find((b) => b.id === branchId)?.name}`,
    );
  };

  // Page Routing
  const renderPage = () => {
    const PageComponent = getRouteComponent(activePage);

    if (PageComponent) {
      return <PageComponent />;
    }

    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-500">
        <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
        <p>The {activePage} module is currently under development.</p>
      </div>
    );
  };

  // Show Login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <MainLayout
      activePage={activePage}
      onNavigate={setActivePage}
      currentBranch={currentBranch}
      branches={branches}
      onSwitchBranch={handleSwitchBranch}
      onLogout={handleLogout}
      user={currentUser}
    >
      {renderPage()}
    </MainLayout>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
