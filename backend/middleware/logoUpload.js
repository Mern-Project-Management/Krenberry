const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const multer = require('multer');

// Specify the directories for logos and temporary files
const uploadDir = path.join(__dirname, '../logos');
const tempDir = path.join(__dirname, '../temp');

// Create directories if they don't exist
[uploadDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Define storage for uploaded photos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store initially in temp directory
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const fileName = `${file.fieldname}_${Date.now()}.webp`; // Always use .webp extension
    cb(null, fileName);
  }
});

// Initialize multer with defined storage options and file size limits
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: function (req, file, cb) {
    // Check if file is an image
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Function to process the uploaded logo image
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const safeUnlink = async (filePath) => {
  try {
    await delay(100); // small delay to ensure file is released
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error("Error deleting file:", err);
    }
  }
};

const processLogoImage = async (tempPath, finalPath) => {
  try {
    // Read the file into memory
    let buffer = await sharp(tempPath)
      .resize({ width: 1024, withoutEnlargement: true })
      .webp({ quality: 100 })
      .toBuffer();

    let quality = 100;

    // Reduce quality until file size <= 100KB or quality <= 10
    while (buffer.length > 100 * 1024 && quality > 10) {
      quality -= 10;
      buffer = await sharp(buffer).webp({ quality }).toBuffer();
    }

    // Write final optimized image
    await fs.promises.writeFile(finalPath, buffer);

    // Delete the temp file safely
    await safeUnlink(tempPath);

    return finalPath;
  } catch (err) {
    console.error("Error processing logo image:", err);

    // Clean up files if something fails
    await safeUnlink(tempPath);
    try {
      await fs.promises.unlink(finalPath);
    } catch {}

    throw new Error("Error processing logo image");
  }
};

// Middleware to handle the logo file upload and process the image
const uploadLogo = async (req, res, next) => {
  try {
    await upload.single('photo')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          error: err.message || 'Error uploading file'
        });
      }

      // If no file is uploaded, proceed without photo processing
      if (!req.file) {
        return next(); // No file uploaded, just move to next middleware
      }

      try {
        const tempPath = req.file.path;
        const finalPath = path.join(uploadDir, req.file.filename);

        // Process the image if file is present
        await processLogoImage(tempPath, finalPath);

        // Update req.file with the new path
        req.file.path = finalPath;
        next();
      } catch (processError) {
        console.error('Processing error:', processError);
        return res.status(500).json({
          error: 'Error processing the image'
        });
      }
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({
      error: 'Server error during upload'
    });
  }
};

module.exports = { uploadLogo };
