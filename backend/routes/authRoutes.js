import { Router } from "express";
import {
  handleRegister,
  handleLogin,
  handleAddStaff,
  handleForgotPassword,
  handleResetPassword,
  handleGetProfile,
  handleListStaff,
} from "../controller/authController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = Router();

router.post("/register", handleRegister);
router.post("/login", handleLogin);
router.post("/forgot-password", handleForgotPassword);
router.post("/reset-password", handleResetPassword);

router.get("/me", verifyJWT, handleGetProfile);
router.post("/add-staff", verifyJWT, authorizeRoles("Admin"), handleAddStaff);
router.get("/staff", verifyJWT, authorizeRoles("Admin"), handleListStaff);

export default router;

