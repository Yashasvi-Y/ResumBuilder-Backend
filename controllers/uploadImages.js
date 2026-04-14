import { v2 as cloudinary } from "cloudinary";
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

    // Debug: Log all files received
    console.log("FILES:", req.files);

    const newThumbnail = req.files?.thumbnail?.[0];
    const newProfileImage = req.files?.profileImage?.[0];

    if (!newThumbnail) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 🔥 Convert buffer to base64
    const base64 = newThumbnail.buffer.toString("base64");
    const dataURI = `data:${newThumbnail.mimetype};base64,${base64}`;

    // ☁️ Upload thumbnail to Cloudinary with user folder
    console.log(`📤 Uploading thumbnail to Cloudinary...`);
    const thumbnailResult = await cloudinary.uploader.upload(dataURI, {
      folder: `resumes/${req.user._id}`,
    });

    // 💾 Save URL in MongoDB
    resume.thumbnailLink = thumbnailResult.secure_url;
    console.log(`✅ Thumbnail uploaded: ${thumbnailResult.secure_url}`);

    // Upload profile image if provided
    if (newProfileImage) {
      if (!resume.profileInfo) {
        resume.profileInfo = {};
      }

      console.log(`📤 Uploading profile image to Cloudinary...`);
      const base64Profile = newProfileImage.buffer.toString("base64");
      const dataURIProfile = `data:${newProfileImage.mimetype};base64,${base64Profile}`;

      const profileResult = await cloudinary.uploader.upload(dataURIProfile, {
        folder: `resumes/${req.user._id}`,
      });

      resume.profileInfo.profilePreviewUrl = profileResult.secure_url;
      console.log(`✅ Profile image uploaded: ${profileResult.secure_url}`);
    }

    await resume.save();

    return res.status(200).json({
      message: "Images uploaded successfully",
      thumbnailLink: resume.thumbnailLink,
      profilePreviewUrl: resume.profileInfo?.profilePreviewUrl || null,
    });
  } catch (err) {
    console.error("❌ Error uploading images:", err.message);
    console.error("Full error:", err);

    return res.status(500).json({
      message: "Failed to upload images",
      error: err.message,
    });
  }
};