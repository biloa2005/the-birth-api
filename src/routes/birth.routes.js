import { Router } from "express"
import { createBirth, allBirth, getBirthById } from "../controllers/birth.controllers.js"

const router=Router()
router.post("/births", createBirth);
router.get("/births",allBirth);
router.get("/births/:id", getBirthById);

export default router;
//t