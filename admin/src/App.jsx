import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import VendorsPage from "./pages/VendorsPage.jsx";
import FacilitiesPage from "./pages/FacilitiesPage.jsx";
import BookingsPage from "./pages/BookingsPage.jsx";
import RevenuePage from "./pages/RevenuePage.jsx";
import ReviewsPage from "./pages/ReviewsPage.jsx";
import SupportPage from "./pages/SupportPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import AuditLogPage from "./pages/AuditLogPage.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-semibold text-sm">Verifying Admin Session...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Auth Gated Entry */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      {/* Administrative Subpages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendors"
        element={
          <ProtectedRoute>
            <VendorsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/facilities"
        element={
          <ProtectedRoute>
            <FacilitiesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <BookingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/revenue"
        element={
          <ProtectedRoute>
            <RevenuePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviews"
        element={
          <ProtectedRoute>
            <ReviewsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/support"
        element={
          <ProtectedRoute>
            <SupportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-log"
        element={
          <ProtectedRoute>
            <AuditLogPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" reverseOrder={false} />
      </AuthProvider>
    </BrowserRouter>
  );
}
