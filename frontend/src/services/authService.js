import { request } from "./vendorService.js";

export const registerUser = (payload) =>
  request("/auth/register", { method: "POST", payload });

export const loginUser = (payload) =>
  request("/auth/login", { method: "POST", payload });

export const apiSendOTP = (email) =>
  request("/auth/send-otp", { method: "POST", payload: { email } });

export const apiVerifyOTP = (email, otp) =>
  request("/auth/verify-otp", { method: "POST", payload: { email, otp } });

export const updateProfile = (payload, token) =>
  request("/auth/profile", { method: "PUT", payload, token });

export const changePassword = (payload, token) =>
  request("/auth/password", { method: "PUT", payload, token });
