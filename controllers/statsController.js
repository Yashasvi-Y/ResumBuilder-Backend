/**
 * Stats Controller
 * Returns resume and user statistics
 */

import User from "../models/User.js";
import Resume from "../models/Resume.js";

/**
 * Get overall statistics (for landing page)
 */
export const getOverallStats = async (req, res) => {
    try {
        // Get total users
        const totalUsers = await User.countDocuments({ isEmailVerified: true });

        // Get total resumes
        const totalResumes = await Resume.countDocuments();

        // Get average rating (if rating field exists in Resume or User)
        const resumeStats = await Resume.aggregate([
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    ratedCount: { $sum: { $cond: ["$rating", 1, 0] } }
                }
            }
        ]);

        const rating = resumeStats.length > 0 && resumeStats[0].ratedCount > 0 
            ? (resumeStats[0].averageRating || 4.9).toFixed(1) 
            : "4.9";

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalResumes,
                averageRating: parseFloat(rating),
                ratedCount: resumeStats[0]?.ratedCount || 0,
            }
        });
    } catch (error) {
        console.error("❌ Error fetching stats:", error.message);
        // Return default stats on error
        res.status(200).json({
            success: true,
            stats: {
                totalUsers: 0,
                totalResumes: 0,
                averageRating: 4.9,
                ratedCount: 0,
            }
        });
    }
};
