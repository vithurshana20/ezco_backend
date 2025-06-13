// middleware/uploadMiddleware.js
import multer from "multer";
import path from "path";

// Temp folder to store before uploading to Cloudinary
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/"); // make sure 'uploads/' folder exists
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File type validation
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png/;
  const extname = fileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = fileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Images only! (jpeg, jpg, png)"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});
upload.array("images", 5)

export default upload;
