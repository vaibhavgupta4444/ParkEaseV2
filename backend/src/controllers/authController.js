import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";

const otpStore = new Map(); // Store OTPs in memory for now. In production, use Redis or DB.

const signAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

const signRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const signToken = signAccessToken;

const toClientUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  preferences: user.preferences,
  vehicles: user.vehicles,
  walletBalance: user.walletBalance,
  profilePhoto: user.profilePhoto,
  createdAt: user.createdAt,
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[6-9]\d{9}$/;
const vehicleNumberPattern = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: ["vendor", "operator", "admin"].includes(role) ? role : "user",
    });

    const token = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    return res.status(201).json({
      message: "Registration successful",
      token,
      refreshToken,
      user: toClientUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, preferences, emailNotifications, smsNotifications, vehicles } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!email?.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    if (phone?.trim() && !phonePattern.test(phone.trim())) {
      return res.status(400).json({ message: "Please enter a valid 10-digit Indian mobile number" });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email is already in use" });
    }

    const update = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
    };

    if (phone !== undefined) {
      update.phone = phone?.trim() || "";
    }

    let nextPreferences = req.user.preferences?.toObject?.() || req.user.preferences || {};
    if (preferences && typeof preferences === "object") {
      nextPreferences = {
        ...nextPreferences,
        ...preferences,
      };
    }
    if (emailNotifications !== undefined) {
      nextPreferences.emailNotifications = Boolean(emailNotifications);
    }
    if (smsNotifications !== undefined) {
      nextPreferences.smsNotifications = Boolean(smsNotifications);
    }
    update.preferences = nextPreferences;

    if (Array.isArray(vehicles)) {
      const nextVehicles = vehicles.map((vehicle) => {
        const plateNumber = String(vehicle.plateNumber || "").toUpperCase().replace(/\s+/g, "");
        return {
          nickname: String(vehicle.nickname || plateNumber || "").trim(),
          plateNumber,
          type: vehicle.type,
          make: vehicle.make || "",
          model: vehicle.model || "",
          isDefault: Boolean(vehicle.isDefault),
        };
      });

      const invalidVehicle = nextVehicles.find(
        (vehicle) => !vehicle.nickname || !vehicle.type || !vehicleNumberPattern.test(vehicle.plateNumber)
      );

      if (invalidVehicle) {
        return res.status(400).json({ message: "Each vehicle needs a nickname, type, and valid license plate" });
      }

      update.vehicles = nextVehicles;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: update },
      { new: true, runValidators: true, context: "query" }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated",
      user: toClientUser(updatedUser),
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(req.userId);
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Password changed" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    return res.status(200).json({
      message: "Login successful",
      token,
      refreshToken,
      user: toClientUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }
      user.emailVerified = true;
      await user.save();
      return res.status(200).json({ message: "Email verified successfully" });
    } catch(err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body; // Changed from phone to email
    if (!email) return res.status(400).json({ message: "Email is required" });
    
    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(email.toLowerCase(), { otp, expiresAt, attempts: 0 });

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: process.env.SMTP_PORT || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"ParkEase" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Your ParkEase Verification Code",
        text: `Your OTP for ParkEase registration is ${otp}. It expires in 10 minutes.`,
      });
      console.log(`[SMTP SERVICE] OTP sent to ${email}`);
    } else {
      console.log(`[MOCK EMAIL SERVICE] Sending OTP ${otp} to email ${email} (Configure SMTP to send real emails)`);
    }

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });
    
    const record = otpStore.get(email.toLowerCase());
    
    if (!record) {
      return res.status(400).json({ message: "No OTP found for this email. Please request a new one." });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (record.attempts >= 5) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ message: "Too many failed attempts. Please request a new OTP." });
    }

    if (record.otp === otp) {
      otpStore.delete(email.toLowerCase());
      
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        user.emailVerified = true;
        await user.save();
      }
      return res.status(200).json({ message: "OTP verified successfully" });
    } else {
      record.attempts += 1;
      return res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Mock sending reset link
    const resetToken = signToken(user._id); // Simplified for mock
    console.log(`[MOCK EMAIL SERVICE] Password reset link: http://localhost:5173/reset-password/${resetToken}`);
    return res.status(200).json({ message: "Password reset link sent (mock)" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) return res.status(404).json({ message: "User not found" });
    if (newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    return res.status(400).json({ message: "Invalid or expired token", error: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { email, name, googleId, profilePhoto } = req.body;
    if (!email || !googleId) return res.status(400).json({ message: "Email and Google ID are required" });

    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.profilePhoto = user.profilePhoto || profilePhoto;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        fullName: name,
        email: email.toLowerCase(),
        googleId,
        profilePhoto,
        emailVerified: true
      });
    }

    const token = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    return res.status(200).json({
      message: "Google login successful",
      token,
      refreshToken,
      user: toClientUser(user)
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newAccessToken = signAccessToken(user._id);
    const newRefreshToken = signRefreshToken(user._id);

    return res.status(200).json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired refresh token", error: error.message });
  }
};
