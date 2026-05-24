import { Router } from "express";
import {
  changePassword,
  login,
  register,
  updateProfile,
  verifyEmail,
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
  googleAuth,
  refresh
} from "../controllers/authController.js";
import { authenticate } from "../middlewares/authenticate.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.put("/profile", authenticate, updateProfile);
authRouter.put("/password", authenticate, changePassword);

// New robust endpoints
authRouter.post("/verify-email/:token", verifyEmail);
authRouter.post("/send-otp", sendOTP);
authRouter.post("/verify-otp", verifyOTP);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);
authRouter.post("/google", googleAuth);

export default authRouter;
