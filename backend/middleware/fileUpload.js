const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

// Define directories
const catalogueDir = path.join(__dirname, "../catalogues");
const photoDir = path.join(__dirname, "../images");
const resumeDir = path.join(__dirname, "../resumes");
const tempDir = path.join(__dirname, "../temp");

// Ensure directories exist
[photoDir, catalogueDir, resumeDir, tempDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "catalogue") cb(null, catalogueDir);
    else if (file.fieldname === "photo") cb(null, tempDir); // save temporarily
    else if (file.fieldname === "resume") cb(null, resumeDir);
  },
  filename: (req, file, cb) => {
    let fileName;
    if (file.fieldname === "catalogue") {
      fileName = file.originalname;
      req.fileName = fileName;
    } else if (file.fieldname === "photo") {
      fileName = `photo_${Date.now()}${path.extname(file.originalname)}`;
    } else if (file.fieldname === "resume") {
      fileName = `resume_${Date.now()}${path.extname(file.originalname)}`;
    }
    cb(null, fileName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Max 50MB
  fileFilter: (req, file, cb) => cb(null, true),
});

// ✅ Helper function: process & move photo safely
const processAndMovePhoto = async (tempPath, finalPath) => {
  try {
    await sharp(tempPath).webp({ quality: 80 }).toFile(finalPath);

    // ✅ Safer delete to avoid EPERM error on Windows
    await fs.promises.rm(tempPath, { force: true });

    return finalPath;
  } catch (err) {
    console.error("Image processing error:", err);
    throw new Error(`Image processing failed: ${err.message}`);
  }
};

// ✅ Middleware
const uploadPhoto = (req, res, next) => {
  upload.fields([
    { name: "catalogue", maxCount: 1 },
    { name: "photo", maxCount: 5 },
    { name: "resume", maxCount: 1 },
  ])(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      if (req.files?.photo) {
        for (const photo of req.files.photo) {
          const tempPath = path.join(tempDir, photo.filename);
          const finalPath = path.join(
            photoDir,
            `${path.basename(photo.filename, path.extname(photo.filename))}.webp`
          );

          if (fs.existsSync(tempPath)) {
            await processAndMovePhoto(tempPath, finalPath);
            photo.filename = path.basename(finalPath); // update filename for DB
          } else {
            throw new Error(`Temp file not found: ${photo.filename}`);
          }
        }
      }

      next();
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });
};

module.exports = { uploadPhoto };
