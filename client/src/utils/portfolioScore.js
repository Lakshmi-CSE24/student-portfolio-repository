/**
 * Portfolio Readiness & Completion Calculation Helper
 * Evaluates real-time completeness based on live MySQL database records:
 * - Profile registration and academic data
 * - Skills tracked
 * - Projects submitted
 * - Certifications uploaded
 * - Achievements recorded
 */
export function calculatePortfolioScore({
  profile = null,
  projects = [],
  skills = [],
  achievements = [],
  certificates = [],
} = {}) {
  let score = 15; // Registered student account base score

  if (profile) {
    // Academic institutional details
    if (profile.department && profile.college) score += 15;
    // Professional biographical summary
    if (profile.bio && profile.bio.trim().length > 0) score += 10;
    // Student identification credentials
    if (profile.register_number || profile.graduation_year) score += 10;
    // Communication & Professional presence
    if (profile.phone || profile.github_url || profile.linkedin_url) score += 10;
    // Profile avatar image bonus
    if (profile.profile_image) score += 5;
  }

  // Central Repository records
  if (Array.isArray(skills) && skills.length > 0) score += 15;
  if (Array.isArray(projects) && projects.length > 0) score += 15;
  if (Array.isArray(certificates) && certificates.length > 0) score += 10;
  if (Array.isArray(achievements) && achievements.length > 0) score += 10;

  return Math.min(score, 100);
}

/**
 * Categorize skills by skill_category
 * Returns an object with category names as keys and arrays of skill items
 */
export function categorizeSkills(skills = []) {
  if (!Array.isArray(skills)) return {};
  return skills.reduce((acc, skill) => {
    const category = skill.skill_category?.trim() || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});
}

/**
 * Split project technologies string into clean badges array
 */
export function parseTechnologies(techString) {
  if (!techString) return [];
  if (Array.isArray(techString)) return techString;
  return techString
    .split(/[,;|]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Format date string consistently across all pages: e.g. "14 Mar 2024"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return String(dateStr);
  }
}

/**
 * Generate actionable next steps to reach 100% readiness
 */
export function getReadinessRecommendations({
  profile = null,
  projects = [],
  skills = [],
  achievements = [],
  certificates = [],
} = {}) {
  const recommendations = [];

  if (!profile?.department || !profile?.college) {
    recommendations.push({
      id: 'academic',
      title: 'Add Academic Details',
      description: 'Specify your department and university',
      route: '/profile',
    });
  }
  if (!profile?.bio) {
    recommendations.push({
      id: 'bio',
      title: 'Write Bio Summary',
      description: 'Introduce your career interests and background',
      route: '/profile',
    });
  }
  if (!profile?.github_url && !profile?.linkedin_url) {
    recommendations.push({
      id: 'socials',
      title: 'Link GitHub / LinkedIn',
      description: 'Connect recruiters to your online repositories',
      route: '/profile',
    });
  }
  if (!Array.isArray(skills) || skills.length === 0) {
    recommendations.push({
      id: 'skills',
      title: 'Add Technical Skills',
      description: 'Showcase your languages, frameworks, and tools',
      route: '/skills',
    });
  }
  if (!Array.isArray(projects) || projects.length === 0) {
    recommendations.push({
      id: 'projects',
      title: 'Submit First Project',
      description: 'Highlight your software systems and code repositories',
      route: '/projects',
    });
  }
  if (!Array.isArray(certificates) || certificates.length === 0) {
    recommendations.push({
      id: 'certs',
      title: 'Upload Certifications',
      description: 'Add course certificates and verification documents',
      route: '/certificates',
    });
  }
  if (!Array.isArray(achievements) || achievements.length === 0) {
    recommendations.push({
      id: 'achievements',
      title: 'Record Milestones',
      description: 'List awards, hackathons, and honors',
      route: '/achievements',
    });
  }

  return recommendations;
}
