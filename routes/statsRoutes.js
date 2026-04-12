import express from "express";
import { getOverallStats } from "../controllers/statsController.js";

const router = express.Router();

// Public stats endpoint
router.get("/overall", getOverallStats);

export default router;
