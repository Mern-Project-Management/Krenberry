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

const safeUnlink = async (filePath, maxRetries = 5) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Increase delay with each attempt
      await delay(200 * (attempt + 1));
      
      // Check if file exists before trying to delete
      try {
        await fs.promises.access(filePath);
      } catch (accessErr) {
        // File doesn't exist, consider it successfully "deleted"
        return;
      }

      await fs.promises.unlink(filePath);
      return; // Success
    } catch (err) {
      if (err.code === "ENOENT") {
        // File doesn't exist, consider it successfully deleted
        return;
      }
      
      if (err.code === "EBUSY" && attempt < maxRetries - 1) {
        console.warn(`File busy, retrying... (attempt ${attempt + 1}/${maxRetries})`);
        continue; // Retry
      }
      
      // If it's the last attempt or a different error, log and continue
      if (attempt === maxRetries - 1) {
        console.error(`Failed to delete file after ${maxRetries} attempts:`, err);
        // Don't throw - just log and continue to prevent breaking the flow
      }
    }
  }
};

const processLogoImage = async (tempPath, finalPath) => {
  let sharpInstance = null;
  let buffer = null;
  
  try {
    // Create Sharp instance and immediately read to buffer to release file handle
    sharpInstance = sharp(tempPath);
    buffer = await sharpInstance
      .resize({ width: 1024, withoutEnlargement: true })
      .webp({ quality: 100 })
      .toBuffer();

    // Explicitly destroy the Sharp instance to release resources
    if (sharpInstance) {
      sharpInstance.destroy();
      sharpInstance = null;
    }

    let quality = 100;

    // Reduce quality until file size <= 100KB or quality <= 10
    while (buffer.length > 100 * 1024 && quality > 10) {
      quality -= 10;
      // Create new Sharp instance from buffer (not from file)
      buffer = await sharp(buffer).webp({ quality }).toBuffer();
    }

    // Write final optimized image
    await fs.promises.writeFile(finalPath, buffer);

    // Add a longer delay before attempting to delete
    await delay(500);

    // Delete the temp file safely with retries
    await safeUnlink(tempPath);

    return finalPath;
  } catch (err) {
    console.error("Error processing logo image:", err);

    // Ensure Sharp instance is destroyed
    if (sharpInstance) {
      try {
        sharpInstance.destroy();
      } catch (destroyErr) {
        console.warn("Error destroying Sharp instance:", destroyErr);
      }
    }

    // Clean up files if something fails
    await safeUnlink(tempPath);
    
    // Clean up final file if it was created
    try {
      await fs.promises.access(finalPath);
      await safeUnlink(finalPath);
    } catch (accessErr) {
      // Final file doesn't exist, no need to delete
    }

    throw new Error("Error processing logo image");
  }
};

// Alternative approach: Process without temp file (direct to final location)
const processLogoImageDirect = async (tempPath, finalPath) => {
  try {
    // Read file to buffer immediately to release file handle
    const inputBuffer = await fs.promises.readFile(tempPath);
    
    // Process the buffer
    let buffer = await sharp(inputBuffer)
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

    // Now safe to delete temp file since we're not using Sharp on it anymore
    await safeUnlink(tempPath);

    return finalPath;
  } catch (err) {
    console.error("Error processing logo image:", err);

    // Clean up files if something fails
    await safeUnlink(tempPath);
    
    try {
      await fs.promises.access(finalPath);
      await safeUnlink(finalPath);
    } catch (accessErr) {
      // Final file doesn't exist, no need to delete
    }

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

        // Use the direct processing approach (recommended)
        await processLogoImageDirect(tempPath, finalPath);

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