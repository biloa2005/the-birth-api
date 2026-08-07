import { Router } from "express";
import { getBirthHistory } from "../controllers/birthHistory.controllers.js";

const router = Router();

router.get("/births/:id/history", getBirthHistory);

export default router;