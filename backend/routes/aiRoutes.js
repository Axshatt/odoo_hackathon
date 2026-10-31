import { Router } from "express";
import { handleAiQuery } from "../controller/aiController.js";

const router = Router();

router.post("/chat", handleAiQuery);

export default router;

