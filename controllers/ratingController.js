/**
 * Rating Controller
 * Handles user ratings for the resume builder service
 */

import Resume from "../models/Resume.js";

/**
 * Submit rating for a resume
 */
export const submitResumeRating = async (req, res) => {
    try {
        const userId = req.user.id;
        const { resumeId, rating } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ 
                success: false,
                message: "Rating must be between 1 and 5" 
            });
        }

        // Find and update resume
        const resume = await Resume.findById(resumeId);
        if (!resume) {
            return res.status(404).json({ 
                success: false,
                message: "Resume not found" 
            });
        }

        // Check if resume belongs to user
        if (resume.userId.toString() !== userId) {
            return res.status(403).json({ 
                success: false,
                message: "Unauthorized to rate this resume" 
            });
        }

        // Update rating
        resume.rating = rating;
        resume.userHasRated = true;
        await resume.save();

        res.status(200).json({
            success: true,
            message: "Thank you for rating!",
            rating: resume.rating,
        });
    } catch (error) {
        console.error("❌ Error submitting rating:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to submit rating",
            error: error.message,
        });
    }
};

/**
 * Check if user should be shown rating prompt (first resume only)
 */
export const checkShouldShowRatingPrompt = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if user has any unrated resumes (first resume)
        const unratedResume = await Resume.findOne({
            userId,
            userHasRated: false,
        }).sort({ createdAt: 1 });

        if (unratedResume) {
            return res.status(200).json({
                success: true,
                shouldShowPrompt: true,
                resumeId: unratedResume._id,
            });
        }

        res.status(200).json({
            success: true,
            shouldShowPrompt: false,
        });
    } catch (error) {
        console.error("❌ Error checking rating prompt:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to check rating status",
            error: error.message,
        });
    }
};
