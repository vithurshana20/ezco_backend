import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js"; // multer for parsing multipart/form-data

import {
  addCourt,
  getAllCourts,
  getMyCourts,
  addAvailableTime,
  uploadCourtImage,
} from "../controllers/courtController.js";

const router = express.Router();

// Add new court - Court Owner only - Max 5 images
router.post(
  "/add",
  protect,
  authorizeRoles("court_owner"),
  upload.array("images", 5),
  addCourt
);

// Get all courts (Player view)
router.get("/", getAllCourts);

// Get courts owned by the logged-in court owner
router.get(
  "/my-courts",
  protect,
  authorizeRoles("court_owner"),
  getMyCourts
);

// Add available time slot for a court
router.post(
  "/add-available-time",
  protect,
  authorizeRoles("court_owner"),
  addAvailableTime
);

// Optional route: Upload single image to Cloudinary
router.post(
  "/upload-image",
  protect,
  authorizeRoles("court_owner"),
  upload.single("image"),
  uploadCourtImage
);

export default router;
