import { Router } from "express";
import { searchBirth } from "../controllers/searchBirth.controllers.js";

const router = Router();

router.post("/births/search/:actNumber", searchBirth);
//n
export default router;