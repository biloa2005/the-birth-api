import { Router } from "express"
import { createBirth, allBirth, getBirthById, deleteBirth, getBirthDashboard } from "../controllers/birth.controllers.js"

const router=Router()
router.post("/births", createBirth);
router.get("/births",allBirth);
router.get("/births/dashboard", getBirthDashboard);
router.post("/births/:id", getBirthById);
router.delete("/births/:id", deleteBirth);

export default router;
//