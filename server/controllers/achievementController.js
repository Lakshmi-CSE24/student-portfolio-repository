import { pool } from '../config/database.js';

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
  if (isNaN(d.getTime())) return false; // Invalid date
  
  // Format as YYYY-MM-DD for MySQL DATE type
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return d.toISOString().split('T')[0];
}

/**
 * Get all achievements for authenticated user
 * GET /api/achievements
 */
export const getAchievements = async (req, res) => {
  try {
    const userId = req.user.id; // Strictly derived from verified JWT

    const [rows] = await pool.query(
      `SELECT id, user_id, title, category, description, organization, 
              achievement_date, document_url, verified, created_at
       FROM achievements 
       WHERE user_id = ? 
       ORDER BY achievement_date DESC, created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      achievements: rows,
    });
  } catch (error) {
    console.error('getAchievements Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error retrieving achievements.',
    });
  }
};

/**
 * Get a single achievement by ID for authenticated user
 * GET /api/achievements/:id
 */
export const getAchievement = async (req, res) => {
  try {
    const userId = req.user.id;
    const achievementId = parseInt(req.params.id, 10);

    if (isNaN(achievementId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid achievement ID format.',
      });
    }

    const [rows] = await pool.query(
      `SELECT id, user_id, title, category, description, organization, 
              achievement_date, document_url, verified, created_at
       FROM achievements 
       WHERE id = ? AND user_id = ? 
       LIMIT 1`,
      [achievementId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found.',
      });
    }

    return res.status(200).json({
      success: true,
      achievement: rows[0],
    });
  } catch (error) {
    console.error('getAchievement Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error retrieving achievement.',
    });
  }
};

/**
 * Create a new achievement for authenticated user
 * POST /api/achievements
 */
export const createAchievement = async (req, res) => {
  try {
    const userId = req.user.id; // Never trust user_id from frontend
    const { title, category, description, organization, achievement_date, document_url } = req.body;

    // Validate title
    if (!title || String(title).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Achievement title is required.',
      });
    }

    const cleanTitle = String(title).trim();
    if (cleanTitle.length > 150) {
      return res.status(400).json({
        success: false,
        message: 'Achievement title must not exceed 150 characters.',
      });
    }

    // Validate category
    if (!category || String(category).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Achievement category is required.',
      });
    }

    const cleanCategory = String(category).trim();
    if (cleanCategory.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Achievement category must not exceed 100 characters.',
      });
    }

    // Validate organization
    let cleanOrg = null;
    if (organization !== undefined && organization !== null && String(organization).trim() !== '') {
      cleanOrg = String(organization).trim();
      if (cleanOrg.length > 150) {
        return res.status(400).json({
          success: false,
          message: 'Organization must not exceed 150 characters.',
        });
      }
    }

    // Validate achievement_date
    let cleanDate = null;
    if (achievement_date !== undefined && achievement_date !== null && String(achievement_date).trim() !== '') {
      const parsedDate = parseValidDate(achievement_date);
      if (parsedDate === false) {
        return res.status(400).json({
          success: false,
          message: 'Invalid achievement_date. Please provide a valid date format (YYYY-MM-DD).',
        });
      }
      cleanDate = parsedDate;
    }

    // Validate document_url
    let cleanDocUrl = null;
    if (document_url !== undefined && document_url !== null && String(document_url).trim() !== '') {
      cleanDocUrl = String(document_url).trim();
      if (cleanDocUrl.length > 255) {
        return res.status(400).json({
          success: false,
          message: 'Document URL must not exceed 255 characters.',
        });
      }
      if (!isValidHttpUrl(cleanDocUrl)) {
        return res.status(400).json({
          success: false,
          message: 'Document URL must be a valid URL starting with http:// or https://',
        });
      }
    }

    const cleanDescription = description !== undefined && description !== null ? String(description).trim() : null;

    // Insert into MySQL with verified defaulting to FALSE (0) and strictly user_id = req.user.id
    const [result] = await pool.query(
      `INSERT INTO achievements (
        user_id, title, category, description, organization, achievement_date, document_url, verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)`,
      [userId, cleanTitle, cleanCategory, cleanDescription, cleanOrg, cleanDate, cleanDocUrl]
    );

    // Fetch the newly created achievement
    const [newRows] = await pool.query(
      `SELECT id, user_id, title, category, description, organization, 
              achievement_date, document_url, verified, created_at
       FROM achievements 
       WHERE id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Achievement created successfully.',
      achievement: newRows[0],
    });
  } catch (error) {
    console.error('createAchievement Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error creating achievement.',
    });
  }
};

/**
 * Update an existing achievement for authenticated user
 * PUT /api/achievements/:id
 */
export const updateAchievement = async (req, res) => {
  try {
    const userId = req.user.id;
    const achievementId = parseInt(req.params.id, 10);

    if (isNaN(achievementId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid achievement ID format.',
      });
    }

    // Verify ownership
    const [existing] = await pool.query(
      'SELECT id FROM achievements WHERE id = ? AND user_id = ? LIMIT 1',
      [achievementId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found or unauthorized.',
      });
    }

    const { title, category, description, organization, achievement_date, document_url } = req.body;

    // Validate title
    if (!title || String(title).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Achievement title cannot be empty.',
      });
    }

    const cleanTitle = String(title).trim();
    if (cleanTitle.length > 150) {
      return res.status(400).json({
        success: false,
        message: 'Achievement title must not exceed 150 characters.',
      });
    }

    // Validate category
    if (!category || String(category).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Achievement category cannot be empty.',
      });
    }

    const cleanCategory = String(category).trim();
    if (cleanCategory.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Achievement category must not exceed 100 characters.',
      });
    }

    // Validate organization
    let cleanOrg = null;
    if (organization !== undefined && organization !== null && String(organization).trim() !== '') {
      cleanOrg = String(organization).trim();
      if (cleanOrg.length > 150) {
        return res.status(400).json({
          success: false,
          message: 'Organization must not exceed 150 characters.',
        });
      }
    }

    // Validate achievement_date
    let cleanDate = null;
    if (achievement_date !== undefined && achievement_date !== null && String(achievement_date).trim() !== '') {
      const parsedDate = parseValidDate(achievement_date);
      if (parsedDate === false) {
        return res.status(400).json({
          success: false,
          message: 'Invalid achievement_date. Please provide a valid date format (YYYY-MM-DD).',
        });
      }
      cleanDate = parsedDate;
    }

    // Validate document_url
    let cleanDocUrl = null;
    if (document_url !== undefined && document_url !== null && String(document_url).trim() !== '') {
      cleanDocUrl = String(document_url).trim();
      if (cleanDocUrl.length > 255) {
        return res.status(400).json({
          success: false,
          message: 'Document URL must not exceed 255 characters.',
        });
      }
      if (!isValidHttpUrl(cleanDocUrl)) {
        return res.status(400).json({
          success: false,
          message: 'Document URL must be a valid URL starting with http:// or https://',
        });
      }
    }

    const cleanDescription = description !== undefined && description !== null ? String(description).trim() : null;

    // Update with strict WHERE id = ? AND user_id = ?
    // Do NOT allow changing user_id, verified, or created_at
    await pool.query(
      `UPDATE achievements 
       SET title = ?, category = ?, description = ?, organization = ?, 
           achievement_date = ?, document_url = ?
       WHERE id = ? AND user_id = ?`,
      [cleanTitle, cleanCategory, cleanDescription, cleanOrg, cleanDate, cleanDocUrl, achievementId, userId]
    );

    // Fetch updated achievement
    const [updatedRows] = await pool.query(
      `SELECT id, user_id, title, category, description, organization, 
              achievement_date, document_url, verified, created_at
       FROM achievements 
       WHERE id = ? AND user_id = ?`,
      [achievementId, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Achievement updated successfully.',
      achievement: updatedRows[0],
    });
  } catch (error) {
    console.error('updateAchievement Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error updating achievement.',
    });
  }
};

/**
 * Delete an achievement for authenticated user
 * DELETE /api/achievements/:id
 */
export const deleteAchievement = async (req, res) => {
  try {
    const userId = req.user.id;
    const achievementId = parseInt(req.params.id, 10);

    if (isNaN(achievementId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid achievement ID format.',
      });
    }

    // Execute delete with strict id and user_id conditions
    const [result] = await pool.query(
      'DELETE FROM achievements WHERE id = ? AND user_id = ?',
      [achievementId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found or unauthorized.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Achievement deleted successfully.',
    });
  } catch (error) {
    console.error('deleteAchievement Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error deleting achievement.',
    });
  }
};
