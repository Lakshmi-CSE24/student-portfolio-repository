import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  Download,
  Share2,
  FileText,
  Mail,
  Phone,
  Sparkles,
  ArrowUpRight,
  Code2,
  Award,
  FileCheck2,
  Terminal,
  Layers,
  MapPin,
  Calendar,
  ChevronRight,
  Copy,
  Check,
  Building2,
  GraduationCap,
  FolderGit2,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  User,
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';

import Button from '../components/Button';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Toast from '../components/Toast';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  profileService,
  projectService,
  skillService,
  achievementService,
  certificateService,
} from '../services/api';
import {
  calculatePortfolioScore,
  categorizeSkills,
  parseTechnologies,
} from '../utils/portfolioScore';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// Helper to safely resolve media and uploaded documents
function resolveMediaUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) return `${API_BASE}${url}`;
  return `${API_BASE}/${url}`;
}

// Helper to format dates cleanly
function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    });
  } catch {
    return dateStr;
  }
}

// Proficiency pill styling
function getProficiencyBadge(proficiency) {
  const level = (proficiency || '').toLowerCase();
  switch (level) {
    case 'expert':
      return {
        variant: 'violet',
        label: 'Expert',
        className: 'bg-violet-500/10 text-violet-300 border-violet-500/25',
      };
    case 'advanced':
      return {
        variant: 'brand',
        label: 'Advanced',
        className: 'bg-brand-500/10 text-brand-300 border-brand-500/25',
      };
    case 'intermediate':
      return {
        variant: 'success',
        label: 'Intermediate',
        className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
      };
    case 'beginner':
    default:
      return {
        variant: 'neutral',
        label: proficiency || 'Beginner',
        className: 'bg-white/[0.05] text-slate-300 border-white/[0.1]',
      };
  }
}

export default function Portfolio({ isPublic = false, publicData = null, slug = null, username = null }) {
  const { user: authUser } = useAuth();

  // Core portfolio state populated from MySQL
  const [profile, setProfile] = useState(publicData ? publicData.profile : null);
  const [projects, setProjects] = useState(publicData ? publicData.projects || [] : []);
  const [skills, setSkills] = useState(publicData ? publicData.skills || [] : []);
  const [achievements, setAchievements] = useState(publicData ? publicData.achievements || [] : []);
  const [certificates, setCertificates] = useState(publicData ? publicData.certificates || [] : []);

  // UI state
  const [loading, setLoading] = useState(publicData ? false : true);
  const [fetchError, setFetchError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Load live data from all 5 repository modules in parallel
  const loadPortfolioData = async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const [
        profileRes,
        projectsRes,
        skillsRes,
        achievementsRes,
        certificatesRes,
      ] = await Promise.allSettled([
        profileService.getProfile(),
        projectService.getProjects(),
        skillService.getSkills(),
        achievementService.getAchievements(),
        certificateService.getCertificates(),
      ]);

      // Profile
      if (profileRes.status === 'fulfilled' && profileRes.value.data.success) {
        setProfile(profileRes.value.data.profile);
      } else {
        setProfile(null);
      }

      // Projects
      if (projectsRes.status === 'fulfilled' && projectsRes.value.data.success) {
        setProjects(projectsRes.value.data.projects || []);
      } else {
        setProjects([]);
      }

      // Skills
      if (skillsRes.status === 'fulfilled' && skillsRes.value.data.success) {
        setSkills(skillsRes.value.data.skills || []);
      } else {
        setSkills([]);
      }

      // Achievements
      if (achievementsRes.status === 'fulfilled' && achievementsRes.value.data.success) {
        setAchievements(achievementsRes.value.data.achievements || []);
      } else {
        setAchievements([]);
      }

      // Certificates
      if (certificatesRes.status === 'fulfilled' && certificatesRes.value.data.success) {
        setCertificates(certificatesRes.value.data.certificates || []);
      } else {
        setCertificates([]);
      }
    } catch (err) {
      console.error('Error loading portfolio data:', err);
      setFetchError('Unable to load portfolio details. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (publicData) {
      setProfile(publicData.profile);
      setProjects(publicData.projects || []);
      setSkills(publicData.skills || []);
      setAchievements(publicData.achievements || []);
      setCertificates(publicData.certificates || []);
      setLoading(false);
      return;
    }
    loadPortfolioData();
  }, [publicData]);

  // Compute student name and public slug
  const studentName = profile?.name || authUser?.name || 'Student';
  const studentEmail = profile?.email || authUser?.email;
  const userSlug =
    slug ||
    username ||
    profile?.public_slug ||
    (studentName ? studentName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : 'student');

  const publicUrl = `${window.location.origin}/portfolio/${userSlug}`;

  // Compute live portfolio readiness score
  const completionScore = calculatePortfolioScore({
    profile,
    projects,
    skills,
    achievements,
    certificates,
  });

  // Categorize skills by skill_category
  const categorizedSkills = categorizeSkills(skills);
  const skillCategories = Object.keys(categorizedSkills);

  const handleShare = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setToastMessage('Public portfolio URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } else {
      setToastMessage(`Public URL: ${publicUrl}`);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  // Modern initials fallback for profile image
  const getInitials = (name) => {
    if (!name) return 'SP';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Loading skeleton state
  if (loading) {
    return (
      <div className="space-y-12 max-w-6xl mx-auto py-8">
        <div className="p-8 rounded-3xl bg-[#11131F] border border-white/[0.06] animate-pulse flex flex-col md:flex-row items-center gap-8">
          <div className="w-40 h-40 rounded-3xl bg-white/[0.05]" />
          <div className="flex-1 space-y-4 w-full">
            <div className="h-6 w-36 bg-white/[0.08] rounded-full" />
            <div className="h-10 w-3/4 bg-white/[0.08] rounded-lg" />
            <div className="h-4 w-1/2 bg-white/[0.04] rounded" />
            <div className="h-16 w-full bg-white/[0.03] rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton type="card" count={3} />
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 inline-flex">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Portfolio Sync Failed</h2>
        <p className="text-sm text-slate-400">{fetchError}</p>
        <Button variant="secondary" size="md" leftIcon={RefreshCw} onClick={loadPortfolioData}>
          Try Again
        </Button>
      </div>
    );
  }

  // Complete empty portfolio state check (if literally no records in system)
  const isCompletelyEmpty =
    !profile?.bio &&
    !profile?.department &&
    projects.length === 0 &&
    skills.length === 0 &&
    achievements.length === 0 &&
    certificates.length === 0;

  return (
    <div className="space-y-16 max-w-6xl mx-auto selection:bg-brand-500/30 selection:text-brand-200">
      {/* ----------------- DASHBOARD PREVIEW CONTROLLER HEADER ----------------- */}
      {!isPublic && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121526] border border-brand-500/30 shadow-glow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-2.5 rounded-xl bg-brand-500/20 text-brand-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Generated Student Portfolio</h2>
                <Badge variant={completionScore >= 80 ? 'brand' : 'warning'} size="sm">
                  {completionScore}% Completed
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-xs text-slate-400">Shareable Public URL:</span>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-300 hover:text-brand-200 bg-black/40 hover:bg-black/60 px-2 py-0.5 rounded font-mono text-xs truncate transition-colors flex items-center gap-1 border border-white/[0.06]"
                  title="Open live public URL in new tab"
                >
                  <span>{publicUrl}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={copied ? Check : Copy}
              onClick={handleShare}
            >
              {copied ? 'Copied Link' : 'Copy Public Link'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={ExternalLink}
              onClick={() => window.open(publicUrl, '_blank')}
            >
              Open Public Portfolio
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={Download}
              onClick={handleDownload}
            >
              Export PDF
            </Button>
          </div>
        </div>
      )}

      {/* ----------------- HERO SECTION ----------------- */}
      <section className="relative pt-4 sm:pt-10 pb-8 flex flex-col md:flex-row items-center gap-10 lg:gap-14">
        {/* Glow ambient background */}
        <div className="absolute -top-12 left-1/3 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Hero Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 space-y-6 text-center md:text-left"
        >
          {/* Institutional / Academic Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {profile?.department
                ? `${profile.department}${profile?.graduation_year ? ` • Class of ${profile.graduation_year}` : ''}`
                : 'Verified Student Portfolio'}
            </span>
          </div>

          {/* Student Real Name */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
              {studentName}
            </h1>
            {profile?.college && (
              <p className="text-lg sm:text-xl font-semibold text-slate-300 tracking-tight flex items-center justify-center md:justify-start gap-2">
                <Building2 className="w-5 h-5 text-brand-400 shrink-0" />
                <span>{profile.college}</span>
              </p>
            )}
          </div>

          {/* Student Bio */}
          {profile?.bio ? (
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
              {profile.bio}
            </p>
          ) : (
            <p className="text-sm text-slate-400 italic">
              Digital portfolio repository compiled through university academic, project, and certification records.
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5 pt-2">
            {studentEmail && (
              <Button
                variant="primary"
                size="md"
                leftIcon={Mail}
                onClick={() => (window.location.href = `mailto:${studentEmail}`)}
              >
                Contact Student
              </Button>
            )}
            <Button
              variant="secondary"
              size="md"
              leftIcon={Download}
              onClick={handleDownload}
            >
              Export Portfolio
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={Share2}
              onClick={handleShare}
            >
              Share Profile
            </Button>
          </div>

          {/* Real Social & Contact Links */}
          <div className="flex items-center justify-center md:justify-start gap-3 pt-3 text-slate-400">
            {profile?.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Profile"
                className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] hover:text-white border border-white/[0.08] transition-all"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            )}
            {profile?.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] hover:text-white border border-white/[0.08] transition-all"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            )}
            {studentEmail && (
              <a
                href={`mailto:${studentEmail}`}
                aria-label="Student Email"
                className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] hover:text-white border border-white/[0.08] transition-all"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
            {!isPublic && profile?.phone && (
              <a
                href={`tel:${profile.phone}`}
                aria-label="Student Phone"
                className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] hover:text-white border border-white/[0.08] transition-all"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
          </div>
        </motion.div>

        {/* Hero Right Avatar Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative shrink-0"
        >
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl p-2 bg-gradient-to-tr from-brand-500 via-indigo-600 to-violet-600 shadow-glow">
            <div className="w-full h-full rounded-[22px] overflow-hidden bg-[#0D0F18] flex items-center justify-center">
              {profile?.profile_image ? (
                <img
                  src={resolveMediaUrl(profile.profile_image)}
                  alt={studentName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#121526] to-[#1a1d36] text-white ${
                  profile?.profile_image ? 'hidden' : 'flex'
                }`}
              >
                <div className="w-20 h-20 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-3xl font-extrabold text-brand-300">
                  {getInitials(studentName)}
                </div>
                <span className="text-xs font-semibold text-slate-300 mt-3">{studentName}</span>
                {!isPublic && profile?.register_number && (
                  <span className="text-[11px] text-slate-500 font-mono mt-0.5">
                    ID: {profile.register_number}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Floating Academic Badge */}
          {!isPublic && profile?.register_number && (
            <div className="absolute -bottom-4 -left-4 sm:bottom-4 sm:-left-6 p-3 rounded-2xl bg-[#121422]/95 border border-white/[0.1] backdrop-blur-md shadow-2xl flex items-center gap-3">
              <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Student Registration</p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {profile.register_number}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* ----------------- ABOUT SECTION ----------------- */}
      {(profile?.bio || profile?.department || profile?.college) && (
        <section className="space-y-6 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
              Academic Background
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">About Student</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 space-y-4">
              {profile?.bio && (
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-white/[0.06]">
                <div>
                  <p className="text-xs text-slate-400">Institution</p>
                  <p className="text-sm font-semibold text-white mt-0.5 truncate">
                    {profile?.college || 'Not Specified'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Department</p>
                  <p className="text-sm font-semibold text-white mt-0.5 truncate">
                    {profile?.department || 'Not Specified'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Graduation Year</p>
                  <p className="text-sm font-semibold text-brand-400 mt-0.5">
                    {profile?.graduation_year || 'In Progress'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-2">Repository Summary</h3>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-400">
                      <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                      Key Projects
                    </span>
                    <span className="font-semibold text-white font-mono">{projects.length}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-400">
                      <Code2 className="w-3.5 h-3.5 text-violet-400" />
                      Skills Tracked
                    </span>
                    <span className="font-semibold text-white font-mono">{skills.length}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-400">
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                      Certifications
                    </span>
                    <span className="font-semibold text-white font-mono">{certificates.length}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-400">
                      <Award className="w-3.5 h-3.5 text-cyan-400" />
                      Honors & Awards
                    </span>
                    <span className="font-semibold text-white font-mono">{achievements.length}</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-400">
                <span className="font-semibold text-slate-200">Repository Status:</span>{' '}
                <span className="text-brand-300">Active Academic Portfolio</span>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* ----------------- SKILLS SECTION (GROUPED BY CATEGORY) ----------------- */}
      {skillCategories.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20">
                Technical Stack
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">Skills & Competencies</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {skillCategories.map((category) => {
              const catSkills = categorizedSkills[category] || [];
              return (
                <Card key={category} padding="normal" className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2 text-brand-300 font-bold text-xs uppercase tracking-wider">
                      <Code2 className="w-4 h-4 text-brand-400" />
                      <span>{category}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {catSkills.length} {catSkills.length === 1 ? 'skill' : 'skills'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {catSkills.map((s) => {
                      const badgeInfo = getProficiencyBadge(s.proficiency);
                      return (
                        <div
                          key={s.id || s.skill_name}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08]"
                        >
                          <span className="text-xs font-medium text-slate-200">{s.skill_name}</span>
                          {s.proficiency && (
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${badgeInfo.className}`}
                            >
                              {s.proficiency}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* ----------------- PROJECTS SECTION ----------------- */}
      {projects.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
                Central Repository
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">Key Engineering Projects</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => {
              const techBadges = parseTechnologies(project.technologies);
              const fallbackImage =
                'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80';
              const displayImage = project.image_url
                ? resolveMediaUrl(project.image_url)
                : fallbackImage;

              return (
                <Card key={project.id} padding="none" className="group flex flex-col justify-between overflow-hidden">
                  <div>
                    {/* Project Header Image */}
                    <div className="h-52 w-full overflow-hidden bg-black relative">
                      <img
                        src={displayImage}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = fallbackImage;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#11131F] via-[#11131F]/30 to-transparent" />
                    </div>

                    {/* Card Content */}
                    <div className="p-6 space-y-3">
                      <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                          {project.description}
                        </p>
                      )}

                      {/* Tech Badges */}
                      {techBadges.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {techBadges.map((tech, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-medium px-2 py-0.5 rounded bg-white/[0.05] text-slate-300 border border-white/[0.08]"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="px-6 pb-5 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                        >
                          <GithubIcon className="w-4 h-4" />
                          <span>Source Code</span>
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Live Demo</span>
                        </a>
                      )}
                    </div>
                    {project.created_at && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        {formatDate(project.created_at)}
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* ----------------- ACHIEVEMENTS SECTION ----------------- */}
      {achievements.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Milestones & Honors
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">Achievements & Recognition</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {achievements.length} {achievements.length === 1 ? 'record' : 'records'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((item) => {
              const isVerified = item.verified === 1 || item.verified === true;
              return (
                <Card key={item.id} className="flex flex-col justify-between space-y-3">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Strictly enforce neutral language unless verified === true */}
                        {isVerified ? (
                          <Badge variant="success" size="sm" dot>
                            Verified Record
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">
                            {item.category || 'Self-Reported'}
                          </Badge>
                        )}
                        {item.organization && (
                          <span className="text-[11px] text-slate-400 truncate">
                            {item.organization}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white mt-1.5 leading-snug">
                        {item.title}
                      </h4>

                      {item.description && (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {formatDate(item.achievement_date) || 'Milestone'}
                    </span>
                    {item.document_url && (
                      <a
                        href={resolveMediaUrl(item.document_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Document</span>
                      </a>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* ----------------- CERTIFICATIONS SECTION ----------------- */}
      {certificates.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                Credential Vault
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">Certifications & Diplomas</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {certificates.length} {certificates.length === 1 ? 'credential' : 'credentials'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <Card key={cert.id} className="flex flex-col justify-between space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 mt-0.5">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                        Documented Credential
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1.5 leading-snug">
                      {cert.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {cert.issuing_organization || 'Accredited Authority'}
                    </p>
                    {cert.credential_id && (
                      <p className="text-[11px] text-slate-500 font-mono mt-1">
                        ID: {cert.credential_id}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3 text-xs">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Issued {formatDate(cert.issue_date) || 'Recorded'}
                  </span>

                  <div className="flex items-center gap-3">
                    {cert.document_url && (
                      <a
                        href={resolveMediaUrl(cert.document_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Certificate</span>
                      </a>
                    )}
                    {cert.credential_url && (
                      <a
                        href={cert.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Verify Credential</span>
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* ----------------- EMPTY ONBOARDING STATE ----------------- */}
      {isCompletelyEmpty && (
        <Card className="text-center py-12 px-6 max-w-xl mx-auto space-y-4">
          <div className="p-4 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 inline-flex">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Your Portfolio is Being Created</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            As you add your profile bio, skills, engineering projects, achievements, and certifications,
            this page automatically synthesizes them into an accredited digital portfolio.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => (window.location.href = '/profile')}
            >
              Complete Profile
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => (window.location.href = '/projects')}
            >
              Add Project
            </Button>
          </div>
        </Card>
      )}

      {/* ----------------- CONTACT & FOOTER ----------------- */}
      <section className="pt-8 border-t border-white/[0.08] text-center space-y-6 pb-12">
        <div className="max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Academic Portfolio Repository
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {profile?.college
              ? `${profile.college} — Department of ${profile.department || 'Computing'}`
              : 'Direct university verified digital credential and project repository.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3.5">
          {studentEmail && (
            <Button
              variant="primary"
              size="md"
              leftIcon={Mail}
              onClick={() => (window.location.href = `mailto:${studentEmail}`)}
            >
              {studentEmail}
            </Button>
          )}
          {!isPublic && profile?.phone && (
            <Button
              variant="secondary"
              size="md"
              leftIcon={Phone}
              onClick={() => (window.location.href = `tel:${profile.phone}`)}
            >
              {profile.phone}
            </Button>
          )}
          <Button
            variant="outline"
            size="md"
            leftIcon={Share2}
            onClick={handleShare}
          >
            Share Portfolio
          </Button>
        </div>

        <p className="text-[11px] text-slate-500 pt-6">
          Authenticated student repository powered by{' '}
          <strong className="text-slate-300">Folio — Student Portfolio Repository</strong>
        </p>
      </section>

      <Toast
        isOpen={!!toastMessage}
        onClose={() => setToastMessage(null)}
        title="Portfolio Action"
        message={toastMessage}
        type="success"
      />
    </div>
  );
}
