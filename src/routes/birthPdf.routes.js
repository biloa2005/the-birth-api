import { Router } from "express";
import { printBirth } from "../controllers/birthPdf.controllers.js";

const router = Router();

router.post("/births/:id/print", printBirth);

export default router;