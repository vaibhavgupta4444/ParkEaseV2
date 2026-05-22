import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import MapHomePage from "./pages/MapHomePage";
import FacilityDetail from "./pages/FacilityDetail";
import BookingSummary from "./pages/BookingSummary";
import BookingSuccess from "./pages/BookingSuccess";
import ProfilePage from "./features/profile/ProfilePage";
import BookingHistory from "./features/dashboard/BookingHistory";
import AuthModal from "./features/auth/AuthModal";

const getStoredAuth = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return { token, user: user ? JSON.parse(user) : null };
};

export default function App() {
  const [auth, setAuth] = useState(getStoredAuth);
  const [authModalConfig, setAuthModalConfig] = useState({ isOpen: false, mode: "login" });

  const isAuthenticated = Boolean(auth.token && auth.user);

  const handleAuthSuccess = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setAuth({ token, user });
    setAuthModalConfig({ isOpen: false, mode: "login" });
    toast.success("You are signed in successfully");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: null, user: null });
    toast.success("Logged out successfully");
  };

  const openLogin = () => setAuthModalConfig({ isOpen: true, mode: "login" });
  const openSignup = () => setAuthModalConfig({ isOpen: true, mode: "register" });
  const closeAuthModal = () => setAuthModalConfig({ ...authModalConfig, isOpen: false });

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          success: { style: { background: "#16A34A", color: "#fff" } },
          error: { style: { background: "#DC2626", color: "#fff" } },
        }}
      />
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/map" replace />
            ) : (
              <HomePage onLogin={openLogin} onSignup={openSignup} />
            )
          }
        />
        <Route
          path="/map"
          element={
            isAuthenticated ? (
              <MapHomePage user={auth.user} token={auth.token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/facility/:id"
          element={
            isAuthenticated ? (
              <FacilityDetail user={auth.user} token={auth.token} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/booking/confirm"
          element={
            isAuthenticated ? (
              <BookingSummary user={auth.user} token={auth.token} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/booking/success"
          element={
            isAuthenticated ? (
              <BookingSuccess />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              <ProfilePage user={auth.user} token={auth.token} onUpdateUser={(user) => setAuth(prev => ({ ...prev, user }))} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/bookings"
          element={
            isAuthenticated ? (
              <BookingHistory token={auth.token} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {authModalConfig.isOpen && (
        <AuthModal
          mode={authModalConfig.mode}
          onClose={closeAuthModal}
          onSuccess={handleAuthSuccess}
          onSwitchMode={() =>
            setAuthModalConfig((prev) => ({
              ...prev,
              mode: prev.mode === "login" ? "register" : "login",
            }))
          }
        />
      )}
    </BrowserRouter>
  );
}
