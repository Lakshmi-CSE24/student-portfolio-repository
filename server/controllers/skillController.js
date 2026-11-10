import { pool } from '../config/database.js';

const ALLOWED_PROFICIENCIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

/**
 * Get all skills for authenticated user
 * GET /api/skills
 */
export const getSkills = async (req, res) => {
  try {
    const userId = req.user.id; // Strictly derived from JWT

    const [rows] = await pool.query(
      `SELECT id, user_id, skill_name, skill_category, proficiency 
       FROM skills 
       WHERE user_id = ? 
       ORDER BY skill_category ASC, skill_name ASC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      skills: rows,
    });
  } catch (error) {
    console.error('getSkills Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error retrieving skills.',
    });
  }
};

/**
 * Get a single skill by ID for authenticated user
 * GET /api/skills/:id
 */
export const getSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const skillId = parseInt(req.params.id, 10);

    if (isNaN(skillId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID format.',
      });
    }

    const [rows] = await pool.query(
      `SELECT id, user_id, skill_name, skill_category, proficiency 
       FROM skills 
       WHERE id = ? AND user_id = ? 
       LIMIT 1`,
      [skillId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found.',
      });
    }

    return res.status(200).json({
      success: true,
      skill: rows[0],
    });
  } catch (error) {
    console.error('getSkill Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error retrieving skill.',
    });
  }
};

/**
 * Create a new skill for authenticated user
 * POST /api/skills
 */
export const createSkill = async (req, res) => {
  try {
    const userId = req.user.id; // Never trust user_id from frontend
    const { skill_name, skill_category, proficiency } = req.body;

    // Validate skill_name
    if (!skill_name || String(skill_name).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required.',
      });
    }

    const cleanName = String(skill_name).trim();
    if (cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Skill name must not exceed 100 characters.',
      });
    }

    // Validate skill_category
    let cleanCategory = null;
    if (skill_category !== undefined && skill_category !== null && String(skill_category).trim() !== '') {
      cleanCategory = String(skill_category).trim();
      if (cleanCategory.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Skill category must not exceed 100 characters.',
        });
      }
    }

    // Validate proficiency
    let cleanProficiency = null;
    if (proficiency !== undefined && proficiency !== null && String(proficiency).trim() !== '') {
      const inputProf = String(proficiency).trim();
      const matched = ALLOWED_PROFICIENCIES.find(
        (p) => p.toLowerCase() === inputProf.toLowerCase()
      );
      if (!matched) {
        return res.status(400).json({
          success: false,
          message: `Proficiency must be one of: ${ALLOWED_PROFICIENCIES.join(', ')}.`,
        });
      }
      cleanProficiency = matched;
    }

    // Insert skill
    const [result] = await pool.query(
      `INSERT INTO skills (user_id, skill_name, skill_category, proficiency) 
       VALUES (?, ?, ?, ?)`,
      [userId, cleanName, cleanCategory, cleanProficiency]
    );

    // Fetch newly created skill
    const [newSkillRows] = await pool.query(
      `SELECT id, user_id, skill_name, skill_category, proficiency 
       FROM skills 
       WHERE id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Skill created successfully.',
      skill: newSkillRows[0],
    });
  } catch (error) {
    console.error('createSkill Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error creating skill.',
    });
  }
};

/**
 * Update a skill for authenticated user
 * PUT /api/skills/:id
 */
export const updateSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const skillId = parseInt(req.params.id, 10);

    if (isNaN(skillId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID format.',
      });
    }

    // Verify ownership
    const [existing] = await pool.query(
      'SELECT id FROM skills WHERE id = ? AND user_id = ? LIMIT 1',
      [skillId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found or unauthorized.',
      });
    }

    const { skill_name, skill_category, proficiency } = req.body;

    if (!skill_name || String(skill_name).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Skill name cannot be empty.',
      });
    }

    const cleanName = String(skill_name).trim();
    if (cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Skill name must not exceed 100 characters.',
      });
    }

    let cleanCategory = null;
    if (skill_category !== undefined && skill_category !== null && String(skill_category).trim() !== '') {
      cleanCategory = String(skill_category).trim();
      if (cleanCategory.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Skill category must not exceed 100 characters.',
        });
      }
    }

    let cleanProficiency = null;
    if (proficiency !== undefined && proficiency !== null && String(proficiency).trim() !== '') {
      const inputProf = String(proficiency).trim();
      const matched = ALLOWED_PROFICIENCIES.find(
        (p) => p.toLowerCase() === inputProf.toLowerCase()
      );
      if (!matched) {
        return res.status(400).json({
          success: false,
          message: `Proficiency must be one of: ${ALLOWED_PROFICIENCIES.join(', ')}.`,
        });
      }
      cleanProficiency = matched;
    }

    // Update with strict user_id condition
    await pool.query(
      `UPDATE skills 
       SET skill_name = ?, skill_category = ?, proficiency = ? 
       WHERE id = ? AND user_id = ?`,
      [cleanName, cleanCategory, cleanProficiency, skillId, userId]
    );

    // Fetch updated skill
    const [updatedRows] = await pool.query(
      `SELECT id, user_id, skill_name, skill_category, proficiency 
       FROM skills 
       WHERE id = ? AND user_id = ?`,
      [skillId, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Skill updated successfully.',
      skill: updatedRows[0],
    });
  } catch (error) {
    console.error('updateSkill Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error updating skill.',
    });
  }
};

/**
 * Delete a skill for authenticated user
 * DELETE /api/skills/:id
 */
export const deleteSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const skillId = parseInt(req.params.id, 10);

    if (isNaN(skillId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID format.',
      });
    }

    // Delete with strict user_id condition
    const [result] = await pool.query(
      'DELETE FROM skills WHERE id = ? AND user_id = ?',
      [skillId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found or unauthorized.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Skill deleted successfully.',
    });
  } catch (error) {
    console.error('deleteSkill Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error deleting skill.',
    });
  }
};
