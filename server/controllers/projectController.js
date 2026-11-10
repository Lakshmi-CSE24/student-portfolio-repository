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

/**
 * Get all projects for the authenticated user
 * GET /api/projects
 */
export const getProjects = async (req, res) => {
  try {
    const userId = req.user.id; // Strictly derived from JWT

    const [rows] = await pool.query(
      'SELECT id, user_id, title, description, technologies, github_url, demo_url, image_url, created_at FROM projects WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    return res.status(200).json({
      success: true,
      projects: rows,
    });
  } catch (error) {
    console.error('getProjects Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error retrieving projects.',
    });
  }
};

/**
 * Get a single project by ID for authenticated user
 * GET /api/projects/:id
 */
export const getProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = parseInt(req.params.id, 10);

    if (isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format.',
      });
    }

    // Ownership enforced: project must belong to req.user.id
    const [rows] = await pool.query(
      'SELECT id, user_id, title, description, technologies, github_url, demo_url, image_url, created_at FROM projects WHERE id = ? AND user_id = ? LIMIT 1',
      [projectId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    return res.status(200).json({
      success: true,
      project: rows[0],
    });
  } catch (error) {
    console.error('getProject Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error retrieving project.',
    });
  }
};

/**
 * Create a new project for authenticated user
 * POST /api/projects
 */
export const createProject = async (req, res) => {
  try {
    const userId = req.user.id; // Never trust user_id from frontend
    const { title, description, technologies, github_url, demo_url, image_url } = req.body;

    // Validate required fields
    if (!title || String(title).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Project title is required.',
      });
    }

    const cleanTitle = String(title).trim();
    if (cleanTitle.length > 150) {
      return res.status(400).json({
        success: false,
        message: 'Project title must not exceed 150 characters.',
      });
    }

    const cleanDescription = description !== undefined && description !== null ? String(description).trim() : null;

    const cleanTech = technologies !== undefined && technologies !== null ? String(technologies).trim() : null;
    if (cleanTech && cleanTech.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Technologies string must not exceed 500 characters.',
      });
    }

    // Validate URLs
    const cleanGithub = github_url ? String(github_url).trim() : null;
    if (cleanGithub) {
      if (cleanGithub.length > 255) {
        return res.status(400).json({
          success: false,
          message: 'GitHub URL must not exceed 255 characters.',
        });
      }
      if (!isValidHttpUrl(cleanGithub)) {
        return res.status(400).json({
          success: false,
          message: 'GitHub URL must be a valid URL starting with http:// or https://',
        });
      }
    }

    const cleanDemo = demo_url ? String(demo_url).trim() : null;
    if (cleanDemo) {
      if (cleanDemo.length > 255) {
        return res.status(400).json({
          success: false,
          message: 'Demo URL must not exceed 255 characters.',
        });
      }
      if (!isValidHttpUrl(cleanDemo)) {
        return res.status(400).json({
          success: false,
          message: 'Demo URL must be a valid URL starting with http:// or https://',
        });
      }
    }

    const cleanImage = image_url ? String(image_url).trim() : null;
    if (cleanImage) {
      if (cleanImage.length > 255) {
        return res.status(400).json({
          success: false,
          message: 'Image URL must not exceed 255 characters.',
        });
      }
      if (!isValidHttpUrl(cleanImage)) {
        return res.status(400).json({
          success: false,
          message: 'Image URL must be a valid URL starting with http:// or https://',
        });
      }
    }

    // Insert into existing projects table
    const [result] = await pool.query(
      `INSERT INTO projects (
        user_id,
        title,
        description,
        technologies,
        github_url,
        demo_url,
        image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, cleanTitle, cleanDescription, cleanTech, cleanGithub, cleanDemo, cleanImage]
    );

    // Fetch the newly created project
    const [newProjectRows] = await pool.query(
      'SELECT id, user_id, title, description, technologies, github_url, demo_url, image_url, created_at FROM projects WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      project: newProjectRows[0],
    });
  } catch (error) {
    console.error('createProject Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error creating project.',
    });
  }
};

/**
 * Update an existing project for authenticated user
 * PUT /api/projects/:id
 */
export const updateProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = parseInt(req.params.id, 10);

    if (isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format.',
      });
    }

    // Verify project exists and belongs to this user
    const [existing] = await pool.query(
      'SELECT id FROM projects WHERE id = ? AND user_id = ? LIMIT 1',
      [projectId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or unauthorized.',
      });
    }

    const { title, description, technologies, github_url, demo_url, image_url } = req.body;

    if (!title || String(title).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Project title cannot be empty.',
      });
    }

    const cleanTitle = String(title).trim();
    if (cleanTitle.length > 150) {
      return res.status(400).json({
        success: false,
        message: 'Project title must not exceed 150 characters.',
      });
    }

    const cleanDescription = description !== undefined && description !== null ? String(description).trim() : null;

    const cleanTech = technologies !== undefined && technologies !== null ? String(technologies).trim() : null;
    if (cleanTech && cleanTech.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Technologies string must not exceed 500 characters.',
      });
    }

    const cleanGithub = github_url ? String(github_url).trim() : null;
    if (cleanGithub) {
      if (cleanGithub.length > 255) {
        return res.status(400).json({
          success: false,
          message: 'GitHub URL must not exceed 255 characters.',
        });
      }
      if (!isValidHttpUrl(cleanGithub)) {
        return res.status(400).json({
          success: false,
          message: 'GitHub URL must be a valid URL starting with http:// or https://',
        });
      }
    }

    const cleanDemo = demo_url ? String(demo_url).trim() : null;
    if (cleanDemo) {
      if (cleanDemo.length > 255) {
        return res.status(400).json({
          success: false,
          message: 'Demo URL must not exceed 255 characters.',
        });
      }
      if (!isValidHttpUrl(cleanDemo)) {
        return res.status(400).json({
          success: false,
          message: 'Demo URL must be a valid URL starting with http:// or https://',
        });
      }
    }

    const cleanImage = image_url ? String(image_url).trim() : null;
    if (cleanImage) {
      if (cleanImage.length > 255) {
        return res.status(400).json({
          success: false,
          message: 'Image URL must not exceed 255 characters.',
        });
      }
      if (!isValidHttpUrl(cleanImage)) {
        return res.status(400).json({
          success: false,
          message: 'Image URL must be a valid URL starting with http:// or https://',
        });
      }
    }

    // Update with strict user_id check
    await pool.query(
      `UPDATE projects SET
        title = ?,
        description = ?,
        technologies = ?,
        github_url = ?,
        demo_url = ?,
        image_url = ?
      WHERE id = ? AND user_id = ?`,
      [cleanTitle, cleanDescription, cleanTech, cleanGithub, cleanDemo, cleanImage, projectId, userId]
    );

    // Fetch updated record
    const [updatedRows] = await pool.query(
      'SELECT id, user_id, title, description, technologies, github_url, demo_url, image_url, created_at FROM projects WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      project: updatedRows[0],
    });
  } catch (error) {
    console.error('updateProject Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error updating project.',
    });
  }
};

/**
 * Delete a project for authenticated user
 * DELETE /api/projects/:id
 */
export const deleteProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = parseInt(req.params.id, 10);

    if (isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID format.',
      });
    }

    // Execute delete strictly constrained by id and user_id
    const [result] = await pool.query(
      'DELETE FROM projects WHERE id = ? AND user_id = ?',
      [projectId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or unauthorized.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully.',
    });
  } catch (error) {
    console.error('deleteProject Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error deleting project.',
    });
  }
};
