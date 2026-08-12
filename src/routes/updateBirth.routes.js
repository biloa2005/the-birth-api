import { Router } from "express";
import { updateBirth } from "../controllers/updateBirth.controllers.js";
const router= Router()
router.put("/births/:id",updateBirth)
export default router
// lions