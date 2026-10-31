import { Router } from "express";
import {
  handleCreatePlan,
  handleGetPlans,
  handleGetPlanById,
  handleUpdatePlan,
  handleDeletePlan,
} from "../controller/planController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = Router();

router.get("/", handleGetPlans);
router.get("/:id", handleGetPlanById);

router.use(verifyJWT);
router.post("/", authorizeRoles("Admin"), handleCreatePlan);
router.put("/:id", authorizeRoles("Admin"), handleUpdatePlan);
router.delete("/:id", authorizeRoles("Admin"), handleDeletePlan);

export default router;

