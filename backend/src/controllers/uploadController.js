import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Controller for Local File Uploads (/api/v1/uploads)
 * Stored securely on server hard disk in /backend/uploads
 */

export const handleSingleUpload = (subfolder) => (req, res, next) => {
  try {
    if (!req.file) {
      throw ApiError.badRequest('No file uploaded. Please provide a valid file.');
    }

    const fileUrl = `/uploads/${subfolder}/${req.file.filename}`;

    return ApiResponse.created(
      res,
      {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
      },
      'File uploaded successfully to server storage'
    );
  } catch (error) {
    next(error);
  }
};

export const handleMultipleUploads = (subfolder) => (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw ApiError.badRequest('No files uploaded.');
    }

    const files = req.files.map((file) => ({
      fileName: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${subfolder}/${file.filename}`,
    }));

    return ApiResponse.created(
      res,
      { files, total: files.length },
      `${files.length} file(s) uploaded successfully to server storage`
    );
  } catch (error) {
    next(error);
  }
};
