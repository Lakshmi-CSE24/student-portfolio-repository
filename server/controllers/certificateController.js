import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { pool } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');

// URL validator helper
function isValidHttpUrl(string) {
  if (!string || String(string).trim() === '') return true;
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Date validator helper
function parseValidDate(dateString) {
  if (!dateString || String(dateString).trim() === '') return null;
  const str = String(dateString).trim();
  const d = new Date(str);
  if (isNaN(d.getTime())) return false;
  
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return d.toISOString().split('T')[0];
}

// Safe file deletion helper to prevent path traversal and orphan files
function safeDeleteLocalFile(documentUrl) {
  if (!documentUrl || typeof documentUrl !== 'string') return;
  if (documentUrl.startsWith('/uploads/')) {
    const filename = path.basename(documentUrl); // extracts only filename
    const filePath = path.join(uploadDir, filename);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.error('Error removing document file:', e.message);
    }
  }
}

/**
 * Get all certificates for authenticated user
 * GET /api/certificates
 */
export const getCertificates = async (req, res) => {
  try {
    const userId = req.user.id; // Strictly derived from verified JWT

    const [rows] = await pool.query(
      `SELECT id, user_id, title, issuing_organization, issue_date, 
              credential_id, credential_url, document_url, created_at
       FROM certificates 
       WHERE user_id = ? 
       ORDER BY issue_date DESC, created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      certificates: rows,
    });
  } catch (error) {
    console.error('getCertificates Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error retrieving certificates.',
    });
  }
};

/**
 * Get a single certificate by ID for authenticated user
 * GET /api/certificates/:id
 */
export const getCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const certId = parseInt(req.params.id, 10);

    if (isNaN(certId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid certificate ID format.',
      });
    }

    const [rows] = await pool.query(
      `SELECT id, user_id, title, issuing_organization, issue_date, 
              credential_id, credential_url, document_url, created_at
       FROM certificates 
       WHERE id = ? AND user_id = ? 
       LIMIT 1`,
      [certId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found.',
      });
    }

    return res.status(200).json({
      success: true,
      certificate: rows[0],
    });
  } catch (error) {
    console.error('getCertificate Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error retrieving certificate.',
    });
  }
};

/**
 * Create a new certificate for authenticated user (with optional document upload)
 * POST /api/certificates
 */
export const createCertificate = async (req, res) => {
  try {
    const userId = req.user.id; // Never trust user_id from frontend
    const { title, issuing_organization, issue_date, credential_id, credential_url } = req.body;

    // Validate title (required, <= 150)
    if (!title || String(title).trim() === '') {
      if (req.file) safeDeleteLocalFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({
        success: false,
        message: 'Certificate title is required.',
      });
    }

    const cleanTitle = String(title).trim();
    if (cleanTitle.length > 150) {
      if (req.file) safeDeleteLocalFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({
        success: false,
        message: 'Certificate title must not exceed 150 characters.',
      });
    }

    // Validate issuing_organization (optional, <= 150)
    let cleanOrg = null;
    if (issuing_organization !== undefined && issuing_organization !== null && String(issuing_organization).trim() !== '') {
      cleanOrg = String(issuing_organization).trim();
      if (cleanOrg.length > 150) {
        if (req.file) safeDeleteLocalFile(`/uploads/${req.file.filename}`);
        return res.status(400).json({
          success: false,
          message: 'Issuing organization must not exceed 150 characters.',
        });
      }
    }

    // Validate issue_date (optional, valid date)
    let cleanDate = null;
    if (issue_date !== undefined && issue_date !== null && String(issue_date).trim() !== '') {
      const parsed = parseValidDate(issue_date);
      if (parsed === false) {
        if (req.file) safeDeleteLocalFile(`/uploads/${req.file.filename}`);
        return res.status(400).json({
          success: false,
          message: 'Invalid issue_date format. Please use YYYY-MM-DD.',
        });
      }
      cleanDate = parsed;
    }

    // Validate credential_id (optional, <= 150)
    let cleanCredId = null;
    if (credential_id !== undefined && credential_id !== null && String(credential_id).trim() !== '') {
      cleanCredId = String(credential_id).trim();
      if (cleanCredId.length > 150) {
        if (req.file) safeDeleteLocalFile(`/uploads/${req.file.filename}`);
        return res.status(400).json({
          success: false,
          message: 'Credential ID must not exceed 150 characters.',
        });
      }
    }

    // Validate credential_url (optional, <= 255, valid URL)
    let cleanCredUrl = null;
    if (credential_url !== undefined && credential_url !== null && String(credential_url).trim() !== '') {
      cleanCredUrl = String(credential_url).trim();
      if (cleanCredUrl.length > 255) {
        if (req.file) safeDeleteLocalFile(`/uploads/${req.file.filename}`);
        return res.status(400).json({
          success: false,
          message: 'Credential URL must not exceed 255 characters.',
        });
      }
      if (!isValidHttpUrl(cleanCredUrl)) {
        if (req.file) safeDeleteLocalFile(`/uploads/${req.file.filename}`);
        return res.status(400).json({
          success: false,
          message: 'Credential URL must be a valid URL starting with http:// or https://',
        });
      }
    }

    // Set document_url reference if file was uploaded
    let documentUrl = null;
    if (req.file) {
      documentUrl = `/uploads/${req.file.filename}`;
    }

    // Insert into MySQL certificates table
    const [result] = await pool.query(
      `INSERT INTO certificates (
        user_id, title, issuing_organization, issue_date, credential_id, credential_url, document_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, cleanTitle, cleanOrg, cleanDate, cleanCredId, cleanCredUrl, documentUrl]
    );

    // Fetch newly created certificate
    const [newCertRows] = await pool.query(
      `SELECT id, user_id, title, issuing_organization, issue_date, 
              credential_id, credential_url, document_url, created_at
       FROM certificates 
       WHERE id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Certificate created successfully.',
      certificate: newCertRows[0],
    });
  } catch (error) {
    if (req.file) safeDeleteLocalFile(`/uploads/${req.file.filename}`);
    console.error('createCertificate Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error creating certificate.',
    });
  }
};

/**
 * Update an existing certificate for authenticated user (with optional document replacement)
 * PUT /api/certificates/:id
 */
export const updateCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const certId = parseInt(req.params.id, 10);

    if (isNaN(certId)) {
      if (req.file) safeDeleteLocalFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid certificate ID format.',
      });
    }

    // Verify ownership
    const [existing] = await pool.query(
      'SELECT id, document_url FROM certificates WHERE id = ? AND user_id = ? LIMIT 1',
      [certId, userId]
    );

    if (existing.length === 0) {
      if (req.file) safeDeleteLocalFile(`/uploads/${req.file.filename}`);
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or unauthorized.',
      });
    }

    const { title, issuing_organization, issue_date, credential_id, credential_url } = req.body;

    // Validate title (required, <= 150)
    if (!title || String(title).trim() === '') {
      if (req.file) safeDeleteLocalFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({
        success: false,
        message: 'Certificate title cannot be empty.',
      });
    }

    const cleanTitle = String(title).trim();
    if (cleanTitle.length > 150) {
      if (req.file) safeDeleteLocalFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({
        success: false,
        message: 'Certificate title must not exceed 150 characters.',
      });
    }

    // Validate issuing_organization (optional, <= 150)
    let cleanOrg = null;
    if (issuing_organization !== undefined && issuing_organization !== null && String(issuing_organization).trim() !== '') {
      cleanOrg = String(issuing_organization).trim();
      if (cleanOrg.length > 150) {
        if (req.file) safeDeleteLocalFile(`/uploads/${req.file.filename}`);
        return res.status(400).json({
          success: false,
          message: 'Issuing organization must not exceed 150 characters.',
        });
      }
    }

    // Validate issue_date (optional, valid date)
    let cleanDate = null;
    if (issue_date !== undefined && issue_date !== null && String(issue_date).trim() !== '') {
      const parsed = parseValidDate(issue_date);
      if (parsed === false) {
        if (req.file) safeDeleteLocalFile(`/uploads/${req.file.filename}`);
        return res.status(400).json({
          success: false,
          message: 'Invalid issue_date format. Please use YYYY-MM-DD.',
        });
      }
      cleanDate = parsed;
    }

    // Validate credential_id (optional, <= 150)
    let cleanCredId = null;
    if (credential_id !== undefined && credential_id !== null && String(credential_id).trim() !== '') {
      cleanCredId = String(credential_id).trim();
      if (cleanCredId.length > 150) {
        if (req.file) safeDeleteLocalFile(`/uploads/${req.file.filename}`);
        return res.status(400).json({
          success: false,
          message: 'Credential ID must not exceed 150 characters.',
        });
      }
    }

    // Validate credential_url (optional, <= 255, valid URL)
    let cleanCredUrl = null;
    if (credential_url !== undefined && credential_url !== null && String(credential_url).trim() !== '') {
      cleanCredUrl = String(credential_url).trim();
      if (cleanCredUrl.length > 255) {
        if (req.file) safeDeleteLocalFile(`/uploads/${req.file.filename}`);
        return res.status(400).json({
          success: false,
          message: 'Credential URL must not exceed 255 characters.',
        });
      }
      if (!isValidHttpUrl(cleanCredUrl)) {
        if (req.file) safeDeleteLocalFile(`/uploads/${req.file.filename}`);
        return res.status(400).json({
          success: false,
          message: 'Credential URL must be a valid URL starting with http:// or https://',
        });
      }
    }

    // Document handling: if new file uploaded, replace old file
    let documentUrl = existing[0].document_url;
    if (req.file) {
      documentUrl = `/uploads/${req.file.filename}`;
      // Safely delete previous file if it was a local upload
      if (existing[0].document_url && existing[0].document_url !== documentUrl) {
        safeDeleteLocalFile(existing[0].document_url);
      }
    }

    // Update with strict user_id condition
    await pool.query(
      `UPDATE certificates 
       SET title = ?, issuing_organization = ?, issue_date = ?, 
           credential_id = ?, credential_url = ?, document_url = ? 
       WHERE id = ? AND user_id = ?`,
      [cleanTitle, cleanOrg, cleanDate, cleanCredId, cleanCredUrl, documentUrl, certId, userId]
    );

    // Fetch updated certificate
    const [updatedRows] = await pool.query(
      `SELECT id, user_id, title, issuing_organization, issue_date, 
              credential_id, credential_url, document_url, created_at
       FROM certificates 
       WHERE id = ? AND user_id = ?`,
      [certId, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Certificate updated successfully.',
      certificate: updatedRows[0],
    });
  } catch (error) {
    if (req.file) safeDeleteLocalFile(`/uploads/${req.file.filename}`);
    console.error('updateCertificate Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error updating certificate.',
    });
  }
};

/**
 * Delete a certificate for authenticated user and remove local file
 * DELETE /api/certificates/:id
 */
export const deleteCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const certId = parseInt(req.params.id, 10);

    if (isNaN(certId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid certificate ID format.',
      });
    }

    // Retrieve certificate to find local document reference
    const [existing] = await pool.query(
      'SELECT id, document_url FROM certificates WHERE id = ? AND user_id = ? LIMIT 1',
      [certId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or unauthorized.',
      });
    }

    const documentUrl = existing[0].document_url;

    // Delete record from MySQL
    const [result] = await pool.query(
      'DELETE FROM certificates WHERE id = ? AND user_id = ?',
      [certId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or unauthorized.',
      });
    }

    // Safely remove associated file if present
    if (documentUrl) {
      safeDeleteLocalFile(documentUrl);
    }

    return res.status(200).json({
      success: true,
      message: 'Certificate deleted successfully.',
    });
  } catch (error) {
    console.error('deleteCertificate Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error deleting certificate.',
    });
  }
};
