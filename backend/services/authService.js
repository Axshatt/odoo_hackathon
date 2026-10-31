import crypto from "crypto";
import { User } from "../Modals/User.js";
import { ApiError } from "../utils/Constructors/ApiError.js";

const validatePasswordStrength = (password) => {
  if (!password || password.length <= 8) {
    throw new ApiError(400, "Password must be more than 8 characters long");
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpper || !hasLower || !hasSpecial) {
    throw new ApiError(
      400,
      "Password must contain an uppercase letter, a lowercase letter and a special character"
    );
  }
};

export const registerCustomer = async ({ name, email, password, companyName, phone }) => {
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  validatePasswordStrength(password);

  const user = await User.create({
    name,
    email: email.toLowerCase().trim(),
    password,
    role: "Customer",
    companyName: companyName || name,
    phone: phone || "",
  });

  const token = user.generateAuthToken();
  const createdUser = await User.findById(user._id).select("-password");

  return { user: createdUser, token };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is disabled. Please contact administrator");
  }

  const token = user.generateAuthToken();
  const userProfile = await User.findById(user._id).select("-password");

  return { user: userProfile, token };
};

export const addStaffMember = async ({ name, email, password, phone }) => {
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw new ApiError(409, "User with this email already exists");
  }

  validatePasswordStrength(password);

  const staff = await User.create({
    name,
    email: email.toLowerCase().trim(),
    password,
    role: "Staff",
    phone: phone || "",
  });

  return User.findById(staff._id).select("-password");
};

export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return { message: "If an account exists, a reset link will be sent" };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = hash;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save({ validateBeforeSave: false });

  return {
    message: "Password reset link generated",
    resetToken,
  };
};

export const resetPassword = async ({ token, newPassword }) => {
  validatePasswordStrength(newPassword);

  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hash,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Reset token is invalid or has expired");
  }

  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  return { message: "Password updated successfully" };
};

export const getProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};

export const listStaffMembers = async () => {
  return User.find({ role: "Staff" }).select("-password").sort({ createdAt: -1 });
};

