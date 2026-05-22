const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const request = async (endpoint, payload) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Authentication failed");
  return data;
};

export const apiLogin = (email, password) => request("/auth/login", { email, password });

export const apiRegister = (userData) => request("/auth/register", { ...userData, role: "vendor" });
