import { Router } from "express";
import upload from "../middlewares/upload.middlewares.js";
import { uploadAttachment } from "../controllers/birthAttachment.controllers.js";

const router = Router();

router.post(
  "/births/:id/attachments",
  upload.single("file"),
  uploadAttachment
);

export default router;