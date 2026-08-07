import { Router } from "express";
import { updateBirth } from "../controllers/updateBirth.controllers.js";
const router= Router()
router.put("/birth/:id",updateBirth)
export default router
// lion