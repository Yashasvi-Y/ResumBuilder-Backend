import fs from "fs";
import path from "path";
import Resume from "../models/Resume.js";

export const uploadResumeImages = async (req, res) => {
  try {
    const resumeId = req.params.id;

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found or unauthorized",
      });
    }

    const uploadsFolder = path.join(process.cwd(), "uploads");
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Safely access files
    const newThumbnail = req.files?.thumbnail?.[0];
    const newProfileImage = req.files?.profileImage?.[0];

    // ❌ If thumbnail missing → reject
    if (!newThumbnail) {
      return res.status(400).json({
        message: "Thumbnail missing",
      });
    }

    // 🧹 Delete old thumbnail if exists
    if (resume.thumbnailLink) {
      const oldThumbnailPath = path.join(
        uploadsFolder,
        path.basename(resume.thumbnailLink)
      );

      if (fs.existsSync(oldThumbnailPath)) {
        fs.unlinkSync(oldThumbnailPath);
      }
    }

    // ✅ Save new thumbnail
    resume.thumbnailLink = `${baseUrl}/uploads/${newThumbnail.filename}`;

    // 🧹 Handle profile image (optional)
    if (newProfileImage) {
      if (resume.profileInfo?.profilePreviewUrl) {
        const oldProfilePath = path.join(
          uploadsFolder,
          path.basename(resume.profileInfo.profilePreviewUrl)
        );

        if (fs.existsSync(oldProfilePath)) {
          fs.unlinkSync(oldProfilePath);
        }
      }

      resume.profileInfo.profilePreviewUrl = `${baseUrl}/uploads/${newProfileImage.filename}`;
    }

    await resume.save();

    return res.status(200).json({
      message: "Images uploaded successfully",
      thumbnailLink: resume.thumbnailLink,
      profilePreviewUrl: resume.profileInfo?.profilePreviewUrl || null,
    });

  } catch (err) {
    console.error("❌ Error uploading images:", err);

    return res.status(500).json({
      message: "Failed to upload images",
      error: err.message,
    });
  }
};