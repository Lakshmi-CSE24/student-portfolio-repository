import { pool } from '../config/database.js';

/**
 * Normalizes a name or string into a URL-safe lowercase slug
 */
export function normalizeSlug(str) {
  if (!str) return 'student';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Resolves a public slug to a single registered user
 * Supports:
 *  1. Exact normalized name slug: "alex-rivera"
 *  2. Trailing ID collision-safe format: "alex-rivera-1"
 *  3. Student registration number: "21cs104"
 */
export async function resolveUserBySlug(slug) {
  if (!slug || typeof slug !== 'string') return null;
  const cleanSlug = slug.toLowerCase().trim();

  // 1. Check if slug matches a profile register_number
  const [byReg] = await pool.query(
    `SELECT u.id, u.name, u.email
     FROM users u
     INNER JOIN profiles p ON u.id = p.user_id
     WHERE LOWER(TRIM(p.register_number)) = ?
     LIMIT 1`,
    [cleanSlug]
  );
  if (byReg.length > 0) return byReg[0];

  // 2. Check if slug matches "name-slug-id" (e.g., "alex-rivera-1")
  const trailingIdMatch = cleanSlug.match(/^(.+)-(\d+)$/);
  if (trailingIdMatch) {
    const baseSlug = trailingIdMatch[1];
    const userId = parseInt(trailingIdMatch[2], 10);
    if (!isNaN(userId)) {
      const [byId] = await pool.query(
        'SELECT id, name, email FROM users WHERE id = ? LIMIT 1',
        [userId]
      );
      if (byId.length > 0) {
        const expectedBase = normalizeSlug(byId[0].name);
        if (expectedBase === baseSlug) {
          return byId[0];
        }
      }
    }
  }

  // 3. Match normalized name among all users
  const [users] = await pool.query('SELECT id, name, email FROM users ORDER BY id ASC');
  const matchedUsers = users.filter((u) => normalizeSlug(u.name) === cleanSlug);

  if (matchedUsers.length > 0) {
    // Primary user with lowest id resolves to the clean name slug
    return matchedUsers[0];
  }

  return null;
}

/**
 * Public portfolio endpoint
 * GET /api/public/portfolio/:slug
 * Open to anyone — does not require JWT authentication
 */
export const getPublicPortfolio = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug || slug.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Portfolio slug is required.',
      });
    }

    // Resolve slug to a specific registered user
    const resolvedUser = await resolveUserBySlug(slug);
    if (!resolvedUser) {
      return res.status(404).json({
        success: false,
        message: 'Student portfolio not found.',
      });
    }

    const userId = resolvedUser.id;

    // Explicitly query ONLY public portfolio columns
    // PRIVACY & SECURITY: register_number, phone, passwords, and database secrets are strictly excluded
    const [profileRows] = await pool.query(
      `SELECT 
        u.name,
        u.email,
        p.department,
        p.college,
        p.graduation_year,
        p.bio,
        p.github_url,
        p.linkedin_url,
        p.profile_image
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = ?
       LIMIT 1`,
      [userId]
    );

    // Public projects
    const [projects] = await pool.query(
      `SELECT id, title, description, technologies, github_url, demo_url, image_url, created_at
       FROM projects
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    // Public skills
    const [skills] = await pool.query(
      `SELECT id, skill_name, skill_category, proficiency
       FROM skills
       WHERE user_id = ?
       ORDER BY skill_category ASC, skill_name ASC`,
      [userId]
    );

    // Public achievements
    const [achievements] = await pool.query(
      `SELECT id, title, category, description, organization, 
              DATE_FORMAT(achievement_date, '%Y-%m-%d') AS achievement_date, 
              document_url, verified
       FROM achievements
       WHERE user_id = ?
       ORDER BY achievement_date DESC, created_at DESC`,
      [userId]
    );

    // Public certificates
    const [certificates] = await pool.query(
      `SELECT id, title, issuing_organization, 
              DATE_FORMAT(issue_date, '%Y-%m-%d') AS issue_date, 
              credential_id, credential_url, document_url
       FROM certificates
       WHERE user_id = ?
       ORDER BY issue_date DESC, created_at DESC`,
      [userId]
    );

    const profileData = profileRows[0] || {
      name: resolvedUser.name,
      email: resolvedUser.email,
    };

    return res.status(200).json({
      success: true,
      slug: normalizeSlug(resolvedUser.name),
      portfolio: {
        profile: profileData,
        projects: projects || [],
        skills: skills || [],
        achievements: achievements || [],
        certificates: certificates || [],
      },
    });
  } catch (error) {
    console.error('getPublicPortfolio Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error retrieving public portfolio.',
    });
  }
};
