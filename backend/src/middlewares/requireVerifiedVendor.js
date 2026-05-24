import User from "../models/User.js";
import VendorProfile from "../models/VendorProfile.js";

export const requireVerifiedVendor = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Admin bypasses vendor verification check
    if (user.role === "admin") {
      return next();
    }

    const vendorProfile = await VendorProfile.findOne({ userId: req.userId });
    if (!vendorProfile || vendorProfile.verificationStatus !== "verified") {
      return res.status(403).json({
        message:
          "Your vendor account must be verified by an admin to perform this action. Please upload your verification documents.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
