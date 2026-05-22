export const patterns = {
  name: /^[a-zA-Z\s]{2,50}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[6-9]\d{9}$/,
  password: /^.{6,}$/,
  vehicleNumber: /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/,
  pincode: /^[1-9][0-9]{5}$/,
  price: /^\d+(\.\d{1,2})?$/,
  positiveInteger: /^[1-9]\d*$/,
  couponCode: /^[A-Z0-9]{4,15}$/,
  otp: /^\d{6}$/,
};

export const messages = {
  name: "Name must be 2 to 50 characters and contain only letters",
  email: "Please enter a valid email address",
  phone: "Please enter a valid 10-digit Indian mobile number",
  password: "Password must be at least 6 characters",
  confirmPassword: "Passwords do not match",
  vehicleNumber: "Enter a valid Indian vehicle number (e.g. MH12AB1234)",
  pincode: "Enter a valid 6-digit pincode",
  price: "Enter a valid price",
  positiveInteger: "Enter a valid number greater than 0",
  latitude: "Enter a valid latitude between -90 and 90",
  longitude: "Enter a valid longitude between -180 and 180",
  couponCode: "Coupon code must be 4 to 15 uppercase letters or numbers",
  otp: "Enter the 6-digit OTP",
};

export const normalizeVehicleNumber = (value) => value.toUpperCase().replace(/\s+/g, "");

export const validateField = (type, value, options = {}) => {
  const text = String(value ?? "").trim();

  if (options.required !== false && !text) {
    return options.requiredMessage || "This field is required";
  }

  if (!text && options.required === false) return "";

  if (type === "name") return patterns.name.test(text) ? "" : messages.name;
  if (type === "email") return patterns.email.test(text) ? "" : messages.email;
  if (type === "phone") return patterns.phone.test(text) ? "" : messages.phone;
  if (type === "password") return patterns.password.test(text) ? "" : messages.password;
  if (type === "confirmPassword") return text === options.password ? "" : messages.confirmPassword;
  if (type === "vehicleNumber") return patterns.vehicleNumber.test(normalizeVehicleNumber(text)) ? "" : messages.vehicleNumber;
  if (type === "pincode") return patterns.pincode.test(text) ? "" : messages.pincode;
  if (type === "price") return Number(text) > 0 && patterns.price.test(text) ? "" : messages.price;
  if (type === "positiveInteger") return patterns.positiveInteger.test(text) ? "" : messages.positiveInteger;
  if (type === "latitude") return Number(text) >= -90 && Number(text) <= 90 ? "" : messages.latitude;
  if (type === "longitude") return Number(text) >= -180 && Number(text) <= 180 ? "" : messages.longitude;
  if (type === "couponCode") return patterns.couponCode.test(text) ? "" : messages.couponCode;
  if (type === "otp") return patterns.otp.test(text) ? "" : messages.otp;
  if (type === "maxLength") return text.length <= options.max ? "" : `Maximum ${options.max} characters allowed`;

  return "";
};

export const getPasswordStrength = (password = "") => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[@$!%*?&]/.test(password)) score += 1;

  if (score <= 2) return { label: "Weak", percent: 25, className: "bg-error" };
  if (score === 3) return { label: "Fair", percent: 50, className: "bg-warning" };
  if (score === 4) return { label: "Strong", percent: 75, className: "bg-info" };
  return { label: "Very Strong", percent: 100, className: "bg-success" };
};
