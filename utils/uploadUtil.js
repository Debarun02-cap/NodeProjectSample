//External Module
const multer = require('multer');
const path = require('path');

// Use memory storage to get file buffer for MongoDB
const storage = multer.memoryStorage();

// File filter - only allow jpeg/jpg
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpg and .jpeg files are allowed!'), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;

