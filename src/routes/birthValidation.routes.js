import { Router } from "express";
import { validateBirth } from "../controllers/birthValidation.controllers.js";

const router = Router();

router.post("/births/:id/validate", validateBirth);

export default router;
// lio