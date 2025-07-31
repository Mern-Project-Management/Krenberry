const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const multer = require('multer');

// Specify the directory path
const uploadDir = path.join(__dirname, '../uploads');

// Check if the directory exists, create it if it doesn't
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Define storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Save uploaded files in the 'uploads' directory
    },
    filename: function (req, file, cb) {
        const fileName = `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, fileName);
    }
});

// Initialize multer with defined storage options and file size limits
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const ext = path.extname(file.originalname).toLowerCase();
        
        if (!allowedTypes.includes(ext)) {
            cb(new Error('Only .jpg, .jpeg, .png, .webp, and .gif files are allowed'));
            return;
        }
        cb(null, true);
    }
});

// Function to process and convert images to webp format
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const processImage = async (filePath) => {
  try {
    const fileExtension = path.extname(filePath).toLowerCase();
    const directory = path.dirname(filePath);
    const filename = path.basename(filePath, fileExtension);
    const tempPath = path.join(directory, `${filename}_temp.webp`);
    const finalPath = path.join(directory, `${filename}.webp`);

    if (fileExtension !== ".webp" && [".jpg", ".jpeg", ".png"].includes(fileExtension)) {
      // Convert to WebP
      await sharp(filePath)
        .resize({ width: 1024, withoutEnlargement: true })
        .webp({ quality: 100 })
        .toFile(tempPath);

      await delay(50); // small delay to release file locks

      // Remove original file safely
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath).catch(() => {});
      }

      // Rename temp file
      await fs.promises.rename(tempPath, finalPath);

      let fileSize = fs.statSync(finalPath).size;
      let quality = 90;

      while (fileSize > 100 * 1024 && quality > 20) {
        await sharp(finalPath)
          .webp({ quality })
          .toFile(tempPath);

        await delay(50);

        if (fs.existsSync(finalPath)) {
          await fs.promises.unlink(finalPath).catch(() => {});
        }
        await fs.promises.rename(tempPath, finalPath);

        fileSize = fs.statSync(finalPath).size;
        quality -= 10;
      }

      return finalPath;
    }
    return filePath;
  } catch (err) {
    console.error("Error processing image:", err);
    throw new Error(`Error processing image: ${err.message}`);
  }
};

// Create middleware function
const createUploadMiddleware = (fieldName) => {
    return async (req, res, next) => {
        try {
            await new Promise((resolve, reject) => {
                upload.single(fieldName)(req, res, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            if (req.file) {
                const newPath = await processImage(req.file.path);
                req.file.path = newPath;
                req.file.filename = path.basename(newPath);
            }
            next();
        } catch (err) {
            // Cleanup uploaded file if it exists
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (cleanupErr) {
                    console.error('Failed to cleanup file:', cleanupErr);
                }
            }

            const statusCode = err.message.includes('Only') ? 400 : 500;
            const errorMessage = statusCode === 400 ? 
                err.message : 
                `Error processing the ${fieldName}`;

            res.status(statusCode).json({ error: errorMessage });
        }
    };
};

// Create middleware instances
const uploadImage = createUploadMiddleware('images');
const uploadPhoto = createUploadMiddleware('photo');
const uploadIcon = createUploadMiddleware('icon');

module.exports = {
    uploadImage,
    uploadPhoto,
    uploadIcon
};