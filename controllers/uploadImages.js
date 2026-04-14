import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import Resume from "../models/Resume.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    // Get files from multer
    const newThumbnail = req.files?.thumbnail?.[0];
    const newProfileImage = req.files?.profileImage?.[0];

    // ❌ If thumbnail missing → reject
    if (!newThumbnail) {
      return res.status(400).json({
        message: "Thumbnail is required",
      });
    }

    // Upload thumbnail to Cloudinary via Buffer
    console.log(`📤 Uploading thumbnail from: ${newThumbnail.path}`);
    const thumbnailBuffer = fs.readFileSync(newThumbnail.path);
    console.log(`📊 Buffer size: ${thumbnailBuffer.length} bytes`);

    const thumbnailResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "resumes" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(thumbnailBuffer);
    });

    console.log(`✅ Thumbnail uploaded: ${thumbnailResult.secure_url}`);
    resume.thumbnailLink = thumbnailResult.secure_url;

    // Upload profile image if provided
    if (newProfileImage) {
      if (!resume.profileInfo) {
        resume.profileInfo = {};
      }

      console.log(`📤 Uploading profile image from: ${newProfileImage.path}`);
      const profileBuffer = fs.readFileSync(newProfileImage.path);
      console.log(`📊 Buffer size: ${profileBuffer.length} bytes`);

      const profileResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "resumes" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(profileBuffer);
      });

      console.log(`✅ Profile image uploaded: ${profileResult.secure_url}`);
      resume.profileInfo.profilePreviewUrl = profileResult.secure_url;
    }

    await resume.save();

    // Cleanup local files
    try {
      if (fs.existsSync(newThumbnail.path)) fs.unlinkSync(newThumbnail.path);
      if (newProfileImage && fs.existsSync(newProfileImage.path)) fs.unlinkSync(newProfileImage.path);
    } catch (err) {
      console.warn(`⚠️ Could not delete local files: ${err.message}`);
    }

    return res.status(200).json({
      message: "Images uploaded successfully",
      thumbnailLink: resume.thumbnailLink,
      profilePreviewUrl: resume.profileInfo?.profilePreviewUrl || null,
    });
  } catch (err) {
    console.error("❌ Error uploading images:", err.message);

    return res.status(500).json({
      message: "Failed to upload images",
      error: err.message,
    });
  }
};