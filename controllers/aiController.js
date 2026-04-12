import {
    suggestWorkDescription,
    suggestSkills,
    suggestProjectDescription,
    suggestAchievements,
    suggestProfessionalSummary,
} from "../utils/aiSuggestions.js";
import { checkAISuggestionQuota, incrementAISuggestionCount } from "../middlewares/aiRateLimiter.js";

// Get suggestion for work description
export const getWorkDescriptionSuggestion = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { company, role, description, _attempt } = req.body;

        // Check rate limit
        const quotaCheck = checkAISuggestionQuota(userId);
        if (!quotaCheck.hasQuota) {
            return res.status(429).json({ 
                success: false,
                message: quotaCheck.message,
                remaining: 0,
            });
        }

        if (!company || !role || !description) {
            return res.status(400).json({ message: "Company, role, and description are required" });
        }

        console.log(`💡 Getting work suggestion for ${role} at ${company} (attempt ${_attempt || 0})`);
        const suggestion = await suggestWorkDescription(company, role, description, _attempt);
        
        // Increment counter on successful call
        const usage = incrementAISuggestionCount(userId);

        res.status(200).json({
            success: true,
            suggestion: suggestion,
            quotaUsed: usage.count,
            quotaRemaining: usage.remaining,
        });
    } catch (error) {
        console.error("❌ Work description suggestion error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to get suggestion",
            error: error.message,
        });
    }
};

// Get skill suggestions
export const getSkillSuggestions = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { role, experience, _attempt } = req.body;

        // Check rate limit
        const quotaCheck = checkAISuggestionQuota(userId);
        if (!quotaCheck.hasQuota) {
            return res.status(429).json({ 
                success: false,
                message: quotaCheck.message,
                remaining: 0,
            });
        }

        if (!role) {
            return res.status(400).json({ message: "Role is required" });
        }

        console.log(`💡 Getting skill suggestions for ${role} (attempt ${_attempt || 0})`);
        const skills = await suggestSkills(role, experience || "5", _attempt);
        
        // Increment counter on successful call
        const usage = incrementAISuggestionCount(userId);

        res.status(200).json({
            success: true,
            skills: skills,
            quotaUsed: usage.count,
            quotaRemaining: usage.remaining,
        });
    } catch (error) {
        console.error("❌ Skill suggestion error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to get suggestions",
            error: error.message,
        });
    }
};

// Get project description suggestion
export const getProjectDescriptionSuggestion = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { projectTitle, description, _attempt } = req.body;

        // Check rate limit
        const quotaCheck = checkAISuggestionQuota(userId);
        if (!quotaCheck.hasQuota) {
            return res.status(429).json({ 
                success: false,
                message: quotaCheck.message,
                remaining: 0,
            });
        }

        if (!projectTitle || !description) {
            return res.status(400).json({ message: "Project title and description are required" });
        }

        console.log(`💡 Getting project suggestion for ${projectTitle} (attempt ${_attempt || 0})`);
        const suggestion = await suggestProjectDescription(projectTitle, description, _attempt);
        
        // Increment counter on successful call
        const usage = incrementAISuggestionCount(userId);

        res.status(200).json({
            success: true,
            suggestion: suggestion,
            quotaUsed: usage.count,
            quotaRemaining: usage.remaining,
        });
    } catch (error) {
        console.error("❌ Project suggestion error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to get suggestion",
            error: error.message,
        });
    }
};

// Get achievement suggestions
export const getAchievementSuggestions = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { role, responsibility, _attempt } = req.body;

        // Check rate limit
        const quotaCheck = checkAISuggestionQuota(userId);
        if (!quotaCheck.hasQuota) {
            return res.status(429).json({ 
                success: false,
                message: quotaCheck.message,
                remaining: 0,
            });
        }

        if (!role || !responsibility) {
            return res.status(400).json({ message: "Role and responsibility are required" });
        }

        console.log(`💡 Getting achievement suggestions for ${role} (attempt ${_attempt || 0})`);
        const suggestion = await suggestAchievements(role, responsibility, _attempt);
        
        // Increment counter on successful call
        const usage = incrementAISuggestionCount(userId);

        res.status(200).json({
            success: true,
            suggestion: suggestion,
            quotaUsed: usage.count,
            quotaRemaining: usage.remaining,
        });
    } catch (error) {
        console.error("❌ Achievement suggestion error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to get suggestion",
            error: error.message,
        });
    }
};

// Get professional summary suggestion
export const getProfessionalSummarySuggestion = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { jobTitle, experience, skills, _attempt } = req.body;

        // Check rate limit
        const quotaCheck = checkAISuggestionQuota(userId);
        if (!quotaCheck.hasQuota) {
            return res.status(429).json({ 
                success: false,
                message: quotaCheck.message,
                remaining: 0,
            });
        }

        if (!jobTitle) {
            return res.status(400).json({ message: "Job title is required" });
        }

        console.log(`💡 Getting summary suggestion for ${jobTitle} (attempt ${_attempt || 0})`);
        const suggestion = await suggestProfessionalSummary(jobTitle, experience || "5", skills, _attempt);
        
        // Increment counter on successful call
        const usage = incrementAISuggestionCount(userId);

        res.status(200).json({
            success: true,
            suggestion: suggestion,
            quotaUsed: usage.count,
            quotaRemaining: usage.remaining,
        });
    } catch (error) {
        console.error("❌ Summary suggestion error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to get suggestion",
            error: error.message,
        });
    }
};
