import multer from 'multer';
import path from 'path';
import fs from 'fs';
import config from '../config/config.js';

const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const createStorage = (destination, filenamePrefix, includeUserId = false) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      ensureDirectoryExists(destination);
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const userId = includeUserId && req.user ? req.user.id : '';
      const filename = userId 
        ? `${filenamePrefix}-${userId}-${uniqueSuffix}${ext}`
        : `${filenamePrefix}-${uniqueSuffix}${ext}`;
      cb(null, filename);
    }
  });
};

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed'));
};

export const avatarUpload = multer({
  storage: createStorage('uploads/avatars', 'avatar', true),
  limits: {
    fileSize: config.maxFileSize
  },
  fileFilter: imageFileFilter
});

export const eventImageUpload = multer({
  storage: createStorage('uploads/events', 'event'),
  limits: {
    fileSize: config.maxFileSize
  },
  fileFilter: imageFileFilter
});

