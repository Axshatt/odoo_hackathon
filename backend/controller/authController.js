import { asyncHandler } from "../utils/Constructors/asyncHandler.js";
import { ApiResponse } from "../utils/Constructors/ApiResponse.js";
import * as authService from "../services/authService.js";

export const handleRegister = asyncHandler(async (req, res) => {
  const { name, email, password, companyName, phone } = req.body;
  const result = await authService.registerCustomer({
    name,
    email,
    password,
    companyName,
    phone,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, result, "User registered successfully"));
});

export const handleLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser({ email, password });
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Login successful"));
});

export const handleAddStaff = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const staff = await authService.addStaffMember({
    name,
    email,
    password,
    phone,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, staff, "Staff member added successfully"));
});

export const handleForgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.requestPasswordReset(email);
  return res.status(200).json(new ApiResponse(200, result, result.message));
});

export const handleResetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const result = await authService.resetPassword({ token, newPassword });
  return res.status(200).json(new ApiResponse(200, result, result.message));
});

export const handleGetProfile = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, profile, "Profile fetched successfully"));
});

export const handleListStaff = asyncHandler(async (req, res) => {
  const staff = await authService.listStaffMembers();
  return res
    .status(200)
    .json(new ApiResponse(200, staff, "Staff members fetched successfully"));
});

