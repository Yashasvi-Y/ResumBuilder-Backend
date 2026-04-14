import multer from "multer";

// Use memory storage instead of disk for Render compatibility
const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload;
