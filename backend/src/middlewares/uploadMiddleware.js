import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ApiError } from '../utils/ApiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseUploadDir = path.join(__dirname, '../../uploads');

// Ensure upload subdirectories exist
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

['reports', 'site-photos', 'documents'].forEach((folder) => {
  ensureDir(path.join(baseUploadDir, folder));
});

// Configure Multer storage engine
const createStorage = (subfolder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const targetDir = path.join(baseUploadDir, subfolder);
      ensureDir(targetDir);
      cb(null, targetDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const sanitizedBase = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9-_]/g, '_')
        .substring(0, 50);
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
    },
  });
};

// Allowed File Type Checkers
const documentFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest(`Invalid file format: ${file.mimetype}. Allowed: PDF, DOC, DOCX, PNG, JPG`));
  }
};

const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest(`Invalid image format: ${file.mimetype}. Allowed: JPEG, PNG, WEBP, HEIC`));
  }
};

// 1. Survey Report Upload (Max 50MB, PDF/Images)
export const uploadReport = multer({
  storage: createStorage('reports'),
  fileFilter: documentFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// 2. Surveyor Site Photos (Max 25MB each, up to 20 photos per batch)
export const uploadSitePhotos = multer({
  storage: createStorage('site-photos'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

// 3. General Documents (Max 30MB)
export const uploadDocument = multer({
  storage: createStorage('documents'),
  fileFilter: documentFileFilter,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
});
