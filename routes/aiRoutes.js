import express from "express";
import {
    getWorkDescriptionSuggestion,
    getSkillSuggestions,
    getProjectDescriptionSuggestion,
    getAchievementSuggestions,
    getProfessionalSummarySuggestion,
} from "../controllers/aiController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// AI Suggestion routes (protected - requires authentication)
router.post("/suggest/work-description", protect, getWorkDescriptionSuggestion);
router.post("/suggest/skills", protect, getSkillSuggestions);
router.post("/suggest/project-description", protect, getProjectDescriptionSuggestion);
router.post("/suggest/achievements", protect, getAchievementSuggestions);
router.post("/suggest/professional-summary", protect, getProfessionalSummarySuggestion);

export default router;
