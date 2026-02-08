import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), "uploads", "products");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter to accept only images
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, png, gif, webp)"), false);
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Configure multer for multiple files
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
}).array("image", 5); // Max 5 images per product

// Helper function to get public image path
export const getImagePath = (filename: string): string => {
  return `/uploads/products/${filename}`;
};

// Helper function to delete image file
export const deleteImageFile = (imagePath: string): void => {
  try {
    const fullPath = path.join(process.cwd(), imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error("Error deleting image file:", error);
  }
};

// Helper function to delete multiple image files
export const deleteImageFiles = (imagePaths: string[]): void => {
  imagePaths.forEach((imagePath) => {
    deleteImageFile(imagePath);
  });
};

// Helper function to rollback uploaded files on error
export const rollbackUploadedFiles = (files: Express.Multer.File[]): void => {
  if (!files || files.length === 0) return;
  files.forEach((file) => {
    try {
      const fullPath = path.join(uploadDir, file.filename);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error("Error rolling back uploaded file:", error);
    }
  });
};
