import { pool } from '../config/database.js';

// Helper to validate URLs when provided
function isValidHttpUrl(string) {
  if (!string || string.trim() === '') return true;
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

/**
 * Get profile for the authenticated user
 * GET /api/profile
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch profile associated strictly with authenticated req.user.id
    const [rows] = await pool.query(
      `SELECT 
        p.id,
        p.user_id,
        p.register_number,
        p.department,
        p.college,
        p.graduation_year,
        p.phone,
        p.bio,
        p.github_url,
        p.linkedin_url,
        p.profile_image,
        u.name,
        u.email
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = ?
      LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    const userData = rows[0];

    // If no profile record has been created yet
    if (!userData.id) {
      return res.status(200).json({
        success: true,
        profile: null,
        user: {
          id: userData.user_id || userId,
          name: userData.name,
          email: userData.email,
        },
        message: 'No profile has been created yet.',
      });
    }

    const publicSlug = (userData.name || 'student')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Return the authenticated student's profile
    return res.status(200).json({
      success: true,
      profile: {
        id: userData.id,
        user_id: userData.user_id,
        register_number: userData.register_number || '',
        department: userData.department || '',
        college: userData.college || '',
        graduation_year: userData.graduation_year || null,
        phone: userData.phone || '',
        bio: userData.bio || '',
        github_url: userData.github_url || '',
        linkedin_url: userData.linkedin_url || '',
        profile_image: userData.profile_image || null,
        name: userData.name,
        email: userData.email,
        public_slug: publicSlug,
      },
    });
  } catch (error) {
    console.error('getProfile Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error retrieving student profile.',
    });
  }
};

/**
 * Create or update profile for authenticated user
 * PUT /api/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Enforce ownership strictly from JWT
    const {
      register_number,
      department,
      college,
      graduation_year,
      phone,
      bio,
      github_url,
      linkedin_url,
      profile_image,
    } = req.body;

    // Validation: Field lengths
    const cleanRegNumber = register_number ? String(register_number).trim() : null;
    if (cleanRegNumber && cleanRegNumber.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Register number must not exceed 50 characters.',
      });
    }

    const cleanDepartment = department ? String(department).trim() : null;
    if (cleanDepartment && cleanDepartment.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Department must not exceed 100 characters.',
      });
    }

    const cleanCollege = college ? String(college).trim() : null;
    if (cleanCollege && cleanCollege.length > 150) {
      return res.status(400).json({
        success: false,
        message: 'College must not exceed 150 characters.',
      });
    }

    // Validation: Graduation Year
    let cleanGradYear = null;
    if (graduation_year !== undefined && graduation_year !== null && graduation_year !== '') {
      const parsedYear = parseInt(graduation_year, 10);
      if (isNaN(parsedYear) || parsedYear < 1950 || parsedYear > 2100) {
        return res.status(400).json({
          success: false,
          message: 'Graduation year must be a valid 4-digit year between 1950 and 2100.',
        });
      }
      cleanGradYear = parsedYear;
    }

    const cleanPhone = phone ? String(phone).trim() : null;
    if (cleanPhone && cleanPhone.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must not exceed 20 characters.',
      });
    }

    const cleanBio = bio !== undefined && bio !== null ? String(bio).trim() : null;

    // Validation: URLs
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

    const cleanLinkedin = linkedin_url ? String(linkedin_url).trim() : null;
    if (cleanLinkedin) {
      if (cleanLinkedin.length > 255) {
        return res.status(400).json({
          success: false,
          message: 'LinkedIn URL must not exceed 255 characters.',
        });
      }
      if (!isValidHttpUrl(cleanLinkedin)) {
        return res.status(400).json({
          success: false,
          message: 'LinkedIn URL must be a valid URL starting with http:// or https://',
        });
      }
    }

    const cleanImage = profile_image ? String(profile_image).trim() : null;
    if (cleanImage && cleanImage.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Profile image path must not exceed 255 characters.',
      });
    }

    // Check if profile exists for this user_id
    const [existing] = await pool.query(
      'SELECT id FROM profiles WHERE user_id = ? LIMIT 1',
      [userId]
    );

    if (existing.length > 0) {
      // Update existing profile
      await pool.query(
        `UPDATE profiles SET
          register_number = ?,
          department = ?,
          college = ?,
          graduation_year = ?,
          phone = ?,
          bio = ?,
          github_url = ?,
          linkedin_url = ?,
          profile_image = COALESCE(?, profile_image)
        WHERE user_id = ?`,
        [
          cleanRegNumber,
          cleanDepartment,
          cleanCollege,
          cleanGradYear,
          cleanPhone,
          cleanBio,
          cleanGithub,
          cleanLinkedin,
          cleanImage,
          userId,
        ]
      );
    } else {
      // Create new profile row for this user_id
      await pool.query(
        `INSERT INTO profiles (
          user_id,
          register_number,
          department,
          college,
          graduation_year,
          phone,
          bio,
          github_url,
          linkedin_url,
          profile_image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          cleanRegNumber,
          cleanDepartment,
          cleanCollege,
          cleanGradYear,
          cleanPhone,
          cleanBio,
          cleanGithub,
          cleanLinkedin,
          cleanImage,
        ]
      );
    }

    // Fetch and return the updated profile with user identity
    const [rows] = await pool.query(
      `SELECT 
        p.id,
        p.user_id,
        p.register_number,
        p.department,
        p.college,
        p.graduation_year,
        p.phone,
        p.bio,
        p.github_url,
        p.linkedin_url,
        p.profile_image,
        u.name,
        u.email
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      LIMIT 1`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile saved successfully.',
      profile: rows[0],
    });
  } catch (error) {
    console.error('updateProfile Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error saving student profile.',
    });
  }
};

/**
 * Delete profile for authenticated user
 * DELETE /api/profile
 */
export const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if profile exists
    const [existing] = await pool.query(
      'SELECT id FROM profiles WHERE user_id = ? LIMIT 1',
      [userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No profile found to delete.',
      });
    }

    // Delete ONLY the profile record, never the user account
    await pool.query('DELETE FROM profiles WHERE user_id = ?', [userId]);

    return res.status(200).json({
      success: true,
      message: 'Profile deleted successfully.',
    });
  } catch (error) {
    console.error('deleteProfile Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error deleting student profile.',
    });
  }
};
