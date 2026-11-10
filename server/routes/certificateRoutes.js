import express from 'express';
import multer from 'multer';
import {
  getCertificates,
  getCertificate,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} from '../controllers/certificateController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Wrap upload.single('document') to capture Multer errors and return clean HTTP 400 responses
const handleUpload = (req, res, next) => {
  upload.single('document')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds 10MB limit.',
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Invalid file uploaded.',
      });
    }
    next();
  });
};

// All certificate routes require valid JWT authentication
router.use(authenticateToken);

router.get('/', getCertificates);
router.get('/:id', getCertificate);
router.post('/', handleUpload, createCertificate);
router.put('/:id', handleUpload, updateCertificate);
router.delete('/:id', deleteCertificate);

export default router;
