import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderGit2,
  FileCheck2,
  Code2,
  Plus,
  ExternalLink,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  Award,
  Building2,
  User,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import {
  profileService,
  projectService,
  skillService,
  achievementService,
  certificateService,
} from '../services/api';
import {
  calculatePortfolioScore,
  formatDate,
  getReadinessRecommendations,
} from '../utils/portfolioScore';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Central repository state populated from MySQL
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [certificates, setCertificates] = useState([]);

  // Loading & individual error states
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Fetch all 5 central repository modules in parallel
  const fetchDashboardData = async () => {
    setLoading(true);
    const errMap = {};

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

      if (profileRes.status === 'fulfilled' && profileRes.value.data.success) {
        setProfile(profileRes.value.data.profile);
      } else if (profileRes.status === 'rejected') {
        errMap.profile = true;
      }

      if (projectsRes.status === 'fulfilled' && projectsRes.value.data.success) {
        setProjects(projectsRes.value.data.projects || []);
      } else if (projectsRes.status === 'rejected') {
        errMap.projects = true;
      }

      if (skillsRes.status === 'fulfilled' && skillsRes.value.data.success) {
        setSkills(skillsRes.value.data.skills || []);
      } else if (skillsRes.status === 'rejected') {
        errMap.skills = true;
      }

      if (achievementsRes.status === 'fulfilled' && achievementsRes.value.data.success) {
        setAchievements(achievementsRes.value.data.achievements || []);
      } else if (achievementsRes.status === 'rejected') {
        errMap.achievements = true;
      }

      if (certificatesRes.status === 'fulfilled' && certificatesRes.value.data.success) {
        setCertificates(certificatesRes.value.data.certificates || []);
      } else if (certificatesRes.status === 'rejected') {
        errMap.certificates = true;
      }

      setErrors(errMap);
    } catch (err) {
      console.error('Dashboard data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = profile?.name || user?.name || 'Student';

  // Calculate real portfolio completion score
  const completionScore = calculatePortfolioScore({
    profile,
    projects,
    skills,
    achievements,
    certificates,
  });

  // Actionable recommendations based on missing data
  const recommendations = getReadinessRecommendations({
    profile,
    projects,
    skills,
    achievements,
    certificates,
  });

  // Repository Analytics for BarChart
  const repositoryData = [
    { name: 'Projects', count: projects.length, fill: '#6366f1' },
    { name: 'Certificates', count: certificates.length, fill: '#10b981' },
    { name: 'Skills', count: skills.length, fill: '#8b5cf6' },
    { name: 'Achievements', count: achievements.length, fill: '#06b6d4' },
  ];

  // Dynamic Skill Distribution Donut based on skill_category
  const skillCategoryCounts = skills.reduce((acc, s) => {
    const cat = s.skill_category?.trim() || 'General';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const palette = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
  const skillEntries = Object.entries(skillCategoryCounts);
  const totalSkills = skills.length || 1;
  const dynamicSkillDistribution =
    skillEntries.length > 0
      ? skillEntries.map(([name, count], index) => ({
          name,
          value: Math.round((count / totalSkills) * 100),
          color: palette[index % palette.length],
        }))
      : [{ name: 'Tracked Skills', value: 100, color: '#6366f1' }];

  // Real recent activity combined from projects, achievements, and certificates
  const combinedActivities = [
    ...projects.map((p) => ({
      id: `proj-${p.id}`,
      title: `Added project: ${p.title}`,
      category: 'Project',
      date: new Date(p.created_at || Date.now()),
      displayDate: formatDate(p.created_at),
      icon: FolderGit2,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      action: () => navigate('/projects'),
    })),
    ...achievements.map((a) => ({
      id: `ach-${a.id}`,
      title: `Recorded milestone: ${a.title}`,
      category: a.category || 'Achievement',
      date: new Date(a.achievement_date || a.created_at || Date.now()),
      displayDate: formatDate(a.achievement_date),
      icon: Award,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      action: () => navigate('/achievements'),
    })),
    ...certificates.map((c) => ({
      id: `cert-${c.id}`,
      title: `Uploaded credential: ${c.title}`,
      category: 'Certification',
      date: new Date(c.issue_date || c.created_at || Date.now()),
      displayDate: formatDate(c.issue_date),
      icon: FileCheck2,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      action: () => navigate('/certificates'),
    })),
  ]
    .sort((a, b) => b.date - a.date)
    .slice(0, 5);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
              Student Overview
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">
              {profile?.register_number ? `Reg: ${profile.register_number}` : 'Central Repository'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {getGreeting()},{' '}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
              {displayName}
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Build your academic and professional identity in one place.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Button
            variant="secondary"
            size="md"
            leftIcon={ExternalLink}
            onClick={() => navigate('/portfolio')}
          >
            Live Portfolio
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={Plus}
            onClick={() => navigate('/projects')}
          >
            Add Project
          </Button>
        </div>
      </div>

      {/* Profile Completion & Guidance Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 rounded-2xl bg-gradient-to-r from-[#121526] via-[#161930] to-[#141226] border border-brand-500/20 shadow-glow-sm relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-brand-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
                Profile Readiness
              </span>
              <Badge variant={completionScore >= 80 ? 'brand' : 'warning'} size="sm">
                {completionScore}% Completed
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {completionScore === 100
                ? 'Your repository is 100% complete and placement-ready!'
                : completionScore >= 80
                ? 'Your profile is almost ready for campus placements!'
                : 'Complete your profile details to improve your readiness!'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {profile
                ? `Academic information for ${profile.department || 'your department'} is registered in MySQL.`
                : 'Visit the Profile tab to add your department, college, register number, and social links.'}
            </p>

            {/* Actionable Next Steps Chips */}
            {recommendations.length > 0 && completionScore < 100 && (
              <div className="pt-2 flex flex-wrap gap-2">
                {recommendations.slice(0, 3).map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => navigate(rec.route)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/[0.08] transition-all group"
                  >
                    <span>{rec.title}</span>
                    <ArrowRight className="w-3 h-3 text-brand-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-full lg:w-72 flex flex-col gap-2 shrink-0">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-400">Readiness Score</span>
              <span className="text-brand-300">{completionScore}%</span>
            </div>
            {/* Animated Progress Bar */}
            <div className="h-3 w-full bg-[#090A0F]/80 rounded-full p-0.5 border border-white/[0.08] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionScore}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className="h-full rounded-full bg-gradient-to-r from-brand-500 via-indigo-500 to-violet-500 shadow-glow-sm"
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>Basic Info</span>
              <span>Credentials</span>
              <span className={completionScore === 100 ? 'text-brand-300 font-bold' : 'text-slate-500'}>
                All-Star
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Core Statistics Cards Grid with Skeletons */}
      {loading ? (
        <LoadingSkeleton type="stat" count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Projects"
            value={errors.projects ? 'Error' : String(projects.length)}
            subtitle="Database records"
            icon={FolderGit2}
            color="indigo"
            trend={errors.projects ? 'Sync failed' : `${projects.length} active`}
            index={0}
          />
          <StatCard
            title="Certifications"
            value={errors.certificates ? 'Error' : String(certificates.length)}
            subtitle="Vault credentials"
            icon={FileCheck2}
            color="emerald"
            trend={errors.certificates ? 'Sync failed' : `${certificates.length} credentials`}
            index={1}
          />
          <StatCard
            title="Achievements"
            value={errors.achievements ? 'Error' : String(achievements.length)}
            subtitle="Honors & awards"
            icon={Award}
            color="cyan"
            trend={errors.achievements ? 'Sync failed' : `${achievements.length} recorded`}
            index={2}
          />
          <StatCard
            title="Skills"
            value={errors.skills ? 'Error' : String(skills.length)}
            subtitle="Database records"
            icon={Code2}
            color="violet"
            trend={errors.skills ? 'Sync failed' : `${skills.length} tracked`}
            index={3}
          />
        </div>
      )}

      {/* Analytics & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Repository Items Bar Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Repository Distribution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized records in student_portfolio_repository
              </p>
            </div>
            <Badge variant="neutral" size="sm">Live MySQL</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repositoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#232738' }}
                  interval={0}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#232738' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141726',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                  }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {repositoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Skill Domain Focus Donut */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Skill Weightage
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Technical domain spread
              </p>
            </div>
            <Badge variant="violet" size="sm">Categorized</Badge>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dynamicSkillDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dynamicSkillDistribution.map((entry, index) => (
                    <Cell key={`donut-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141726',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06] max-h-24 overflow-y-auto">
            {dynamicSkillDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-300 font-medium truncate">{item.name}</span>
                <span className="text-xs text-slate-400 ml-auto font-mono">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Panel — All 6 actions */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white tracking-tight">
                Quick Actions
              </h3>
              <span className="text-xs text-slate-400">Fast shortcuts</span>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Rapidly manage your central database records without leaving the dashboard.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/profile')}
                className="flex flex-col items-start p-3.5 rounded-xl bg-[#151829] hover:bg-[#1a1e33] border border-white/[0.06] hover:border-brand-500/30 transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 group-hover:scale-105 transition-transform mb-2">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors">
                  Edit Profile
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">Bio & socials</span>
              </button>

              <button
                onClick={() => navigate('/projects')}
                className="flex flex-col items-start p-3.5 rounded-xl bg-[#151829] hover:bg-[#1a1e33] border border-white/[0.06] hover:border-brand-500/30 transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform mb-2">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Add Project
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">Repo & demo</span>
              </button>

              <button
                onClick={() => navigate('/skills')}
                className="flex flex-col items-start p-3.5 rounded-xl bg-[#151829] hover:bg-[#1a1e33] border border-white/[0.06] hover:border-brand-500/30 transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 group-hover:scale-105 transition-transform mb-2">
                  <Code2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">
                  Add Skill
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">Categorized tags</span>
              </button>

              <button
                onClick={() => navigate('/achievements')}
                className="flex flex-col items-start p-3.5 rounded-xl bg-[#151829] hover:bg-[#1a1e33] border border-white/[0.06] hover:border-brand-500/30 transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-105 transition-transform mb-2">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Add Achievement
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">Awards & honors</span>
              </button>

              <button
                onClick={() => navigate('/certificates')}
                className="flex flex-col items-start p-3.5 rounded-xl bg-[#151829] hover:bg-[#1a1e33] border border-white/[0.06] hover:border-brand-500/30 transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform mb-2">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Add Certificate
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">Upload document</span>
              </button>

              <button
                onClick={() => navigate('/portfolio')}
                className="flex flex-col items-start p-3.5 rounded-xl bg-[#151829] hover:bg-[#1a1e33] border border-white/[0.06] hover:border-brand-500/30 transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 group-hover:scale-105 transition-transform mb-2">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors">
                  View Portfolio
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">Live assembled</span>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-xs text-slate-400">Share portfolio link</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/portfolio')}
              rightIcon={ChevronRight}
            >
              Share View
            </Button>
          </div>
        </Card>

        {/* Real Recent Activity Timeline */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Recent Repository Activity
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chronological records from your projects, achievements, and certificates
                </p>
              </div>
              <Badge variant="brand" size="sm" dot>Live</Badge>
            </div>

            {loading ? (
              <div className="space-y-3">
                <LoadingSkeleton type="row" count={4} />
              </div>
            ) : combinedActivities.length > 0 ? (
              <div className="space-y-3.5">
                {combinedActivities.map((act) => {
                  const Icon = act.icon;
                  return (
                    <div
                      key={act.id}
                      onClick={act.action}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-[#0F111C]/80 border border-white/[0.05] hover:border-white/[0.1] cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`p-2.5 rounded-xl border shrink-0 ${act.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                            {act.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/[0.04] px-1.5 py-0.5 rounded">
                              {act.category}
                            </span>
                            <span className="text-[10px] text-slate-500">•</span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" />
                              {act.displayDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center space-y-3">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-slate-400 inline-flex">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-300">No activity recorded yet</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Start by adding your first project, skill, or certificate using the Quick Actions on the left.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-500">
            <span>Audit trail powered by MySQL</span>
            <button
              onClick={fetchDashboardData}
              className="text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
