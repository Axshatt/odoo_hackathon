import { Router } from "express";
import {
  handleCreateProduct,
  handleGetProducts,
  handleGetProductById,
  handleUpdateProduct,
  handleDeleteProduct,
} from "../controller/productController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/", handleGetProducts);
router.get("/:id", handleGetProductById);
router.post("/", authorizeRoles("Admin"), handleCreateProduct);
router.put("/:id", authorizeRoles("Admin"), handleUpdateProduct);
router.delete("/:id", authorizeRoles("Admin"), handleDeleteProduct);

export default router;

