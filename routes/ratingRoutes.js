import express from "express";
import { submitResumeRating, checkShouldShowRatingPrompt } from "../controllers/ratingController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Rating routes (protected)
router.post("/submit", protect, submitResumeRating);
router.get("/check-prompt", protect, checkShouldShowRatingPrompt);

export default router;
