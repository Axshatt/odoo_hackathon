import { Router } from "express";
import {
  handleCreateTemplate,
  handleGetTemplates,
  handleGetTemplateById,
  handleUpdateTemplate,
  handleDeleteTemplate,
} from "../controller/quoteController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = Router();

router.use(verifyJWT, authorizeRoles("Admin", "Staff"));

router.get("/", handleGetTemplates);
router.get("/:id", handleGetTemplateById);
router.post("/", handleCreateTemplate);
router.put("/:id", handleUpdateTemplate);
router.delete("/:id", handleDeleteTemplate);

export default router;

