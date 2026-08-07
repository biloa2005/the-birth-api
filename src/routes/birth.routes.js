import { Router } from "express"
import { createBirth } from "../controllers/birth.controllers.js"
const router=Router()
router.post("/births", createBirth);
export default router;