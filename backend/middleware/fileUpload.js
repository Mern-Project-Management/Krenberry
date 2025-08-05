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

// ✅ Helper function: safely delete temp file with retries
const safeDeleteTempFile = async (filePath, maxRetries = 10) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await fs.promises.rm(filePath, { force: true });
      return; // Success
    } catch (err) {
      if ((err.code === 'EBUSY' || err.code === 'ENOTEMPTY' || err.code === 'EPERM') && attempt < maxRetries) {
        // Wait progressively longer between retries
        const delay = Math.min(100 * attempt, 1000);
        console.log(`Temp file delete attempt ${attempt} failed (${err.code}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      // If it's not a file lock error or we've exhausted retries, throw
      if (attempt === maxRetries) {
        console.warn(`Failed to delete temp file after ${maxRetries} attempts:`, filePath);
        // Don't throw - just log warning as the main operation succeeded
        return;
      }
      throw err;
    }
  }
};

// ✅ Helper function: process & move photo safely
const processAndMovePhoto = async (tempPath, finalPath) => {
  try {
    // Process image with sharp
    await sharp(tempPath).webp({ quality: 80 }).toFile(finalPath);
    
    // Wait a bit to ensure file handles are released
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Safely delete temp file with retries
    await safeDeleteTempFile(tempPath);

    return finalPath;
  } catch (err) {
    console.error("Image processing error:", err);
    
    // Try to clean up temp file even if processing failed
    try {
      await safeDeleteTempFile(tempPath);
    } catch (cleanupErr) {
      console.warn("Failed to cleanup temp file:", tempPath, cleanupErr.message);
    }
    
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
