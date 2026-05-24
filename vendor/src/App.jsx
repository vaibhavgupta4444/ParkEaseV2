import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import VendorPage from "./pages/VendorPage";
import VendorHomePage from "./pages/VendorHomePage";
import DashboardPage from "./features/dashboard/DashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("vendor-token") || "");

  useEffect(() => {
    const handleStorageChange = () => setToken(localStorage.getItem("vendor-token") || "");
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={token ? <Navigate to="/vendor/home" replace /> : <VendorPage setToken={setToken} />} />
        <Route path="/vendor/home" element={token ? <VendorHomePage token={token} setToken={setToken} /> : <Navigate to="/" replace />} />
        <Route path="/vendor/manage" element={token ? <DashboardPage token={token} onBack={() => setToken("")} /> : <Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
