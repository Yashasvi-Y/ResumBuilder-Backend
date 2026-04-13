import express from "express";
import upload from "../middlewares/uploadMiddleware.js";

import {
    createResume,
    getUserResumes,
    getResumeById,
    updateResume,
    deleteResume,
} from "../controllers/resumeController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadResumeImages } from "../controllers/uploadImages.js";

const router = express.Router();

router.post("/", protect, createResume);
router.get("/", protect, getUserResumes);
router.get("/:id", protect, getResumeById);
router.put("/:id", protect, updateResume);
router.put("/:id/upload-images", protect, upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "profileImage", maxCount: 1 },
  ]), uploadResumeImages);

router.delete("/:id", protect, deleteResume);

export default router;
