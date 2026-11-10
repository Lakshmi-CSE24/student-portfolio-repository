import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  GraduationCap,
  Mail,
  Phone,
  Building2,
  Calendar,
  UploadCloud,
  CheckCircle,
  Camera,
  Save,
  Sparkles,
  Link as LinkIcon,
  AlertCircle,
  Loader2,
  Info,
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';

import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import Toast from '../components/Toast';

export default function Profile() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    registerNumber: '',
    department: '',
    college: '',
    graduationYear: '',
    phone: '',
    bio: '',
    github: '',
    linkedin: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  // Fetch student profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        setFormError('');
        const response = await profileService.getProfile();
        if (response.data.success && response.data.profile) {
          const p = response.data.profile;
          setFormData({
            registerNumber: p.register_number || '',
            department: p.department || '',
            college: p.college || '',
            graduationYear: p.graduation_year ? String(p.graduation_year) : '',
            phone: p.phone || '',
            bio: p.bio || '',
            github: p.github_url || '',
            linkedin: p.linkedin_url || '',
          });
          setHasProfile(true);
        } else {
          // No profile row exists yet in MySQL
          setHasProfile(false);
          setFormData({
            registerNumber: '',
            department: '',
            college: '',
            graduationYear: '',
            phone: '',
            bio: '',
            github: '',
            linkedin: '',
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err.message);
        setFormError('Unable to load your profile. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    // Client-side validations
    if (formData.graduationYear) {
      const year = parseInt(formData.graduationYear, 10);
      if (isNaN(year) || year < 1950 || year > 2100) {
        setFormError('Please enter a valid 4-digit graduation year between 1950 and 2100.');
        return;
      }
    }

    if (formData.github && !formData.github.startsWith('http://') && !formData.github.startsWith('https://')) {
      setFormError('GitHub URL must start with http:// or https://');
      return;
    }

    if (formData.linkedin && !formData.linkedin.startsWith('http://') && !formData.linkedin.startsWith('https://')) {
      setFormError('LinkedIn URL must start with http:// or https://');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        register_number: formData.registerNumber,
        department: formData.department,
        college: formData.college,
        graduation_year: formData.graduationYear ? parseInt(formData.graduationYear, 10) : null,
        phone: formData.phone,
        bio: formData.bio,
        github_url: formData.github,
        linkedin_url: formData.linkedin,
      };

      const response = await profileService.updateProfile(payload);
      if (response.data.success) {
        setHasProfile(true);
        setToast({
          isOpen: true,
          title: 'Profile Saved',
          message: 'Your student profile has been successfully saved to MySQL.',
          type: 'success',
        });
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to save profile.';
      setFormError(message);
      setToast({
        isOpen: true,
        title: 'Save Failed',
        message,
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-12 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        <p className="text-xs uppercase tracking-wider font-semibold">Loading student profile from repository...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        title="Student Profile"
        subtitle="Manage your personal identity, academic credentials, and professional networks."
        badge={
          hasProfile ? (
            <Badge variant="brand">Verified Profile</Badge>
          ) : (
            <Badge variant="warning">New Profile</Badge>
          )
        }
        actions={
          <Button
            type="submit"
            form="profile-form"
            variant="primary"
            size="md"
            isLoading={isSaving}
            leftIcon={Save}
          >
            Save Changes
          </Button>
        }
      />

      {/* Info notice when no profile has been created yet */}
      {!hasProfile && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/25 flex items-start gap-3 text-xs text-brand-200"
        >
          <Info className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white">Initialize your Student Profile</p>
            <p className="text-slate-300 mt-0.5">
              Fill in your department, college, register number, and professional links below, then click <strong>Save Changes</strong> to store your official record in the database.
            </p>
          </div>
        </motion.div>
      )}

      {/* Form Error Banner */}
      {formError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3 text-xs text-rose-300"
        >
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </motion.div>
      )}

      <form id="profile-form" onSubmit={handleSave} className="space-y-8">
        {/* Profile Avatar & Quick Bio Banner */}
        <Card className="flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-[#121422] to-[#16182c] border-brand-500/20">
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-brand-500/40 shadow-glow-sm bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white text-2xl font-extrabold">
              {user?.name
                ? user.name
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()
                : 'SP'}
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl font-bold text-white truncate">{user?.name || 'Student'}</h2>
              <Badge variant="success" size="sm" dot>Active Account</Badge>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {formData.department ? formData.department : 'Department Not Specified'}
              {formData.graduationYear ? ` • Class of ${formData.graduationYear}` : ''}
            </p>
            <p className="text-xs text-slate-400 max-w-xl">
              Profile details are linked directly to your authenticated university account (<strong>{user?.email}</strong>).
            </p>
          </div>
        </Card>

        {/* 2-Column Grid: Personal & Academic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.08] mb-5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Personal Information
              </h3>
            </div>

            <div className="space-y-4">
              <Input
                label="Full Name (Account Identity)"
                value={user?.name || ''}
                disabled
                helperText="Name is linked to your university account login"
              />
              <Input
                label="Email Address (Account Identity)"
                type="email"
                icon={Mail}
                value={user?.email || ''}
                disabled
                helperText="Primary email used for repository access"
              />
              <Input
                label="Phone Number"
                name="phone"
                icon={Phone}
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </Card>

          {/* Academic Information */}
          <Card>
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.08] mb-5">
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Academic Information
              </h3>
            </div>

            <div className="space-y-4">
              <Input
                label="Register Number / Student ID"
                name="registerNumber"
                value={formData.registerNumber}
                onChange={handleChange}
                placeholder="e.g. 21CS104"
              />
              <Input
                label="Department"
                name="department"
                icon={Building2}
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Computer Science & Engineering"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Graduation Year"
                  name="graduationYear"
                  icon={Calendar}
                  value={formData.graduationYear}
                  onChange={handleChange}
                  placeholder="2025"
                />
                <Input
                  label="College / Institution"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="School of Computing"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Professional Links */}
        <Card>
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.08] mb-5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <LinkIcon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Professional Links
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="GitHub Profile URL"
              name="github"
              icon={GithubIcon}
              value={formData.github}
              onChange={handleChange}
              placeholder="https://github.com/username"
            />
            <Input
              label="LinkedIn Profile URL"
              name="linkedin"
              icon={LinkedinIcon}
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </Card>

        {/* Bio / About */}
        <Card>
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/[0.08] mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              About & Professional Bio
            </h3>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Personal Bio (Rendered on Public Portfolio)
            </label>
            <textarea
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              className="w-full bg-[#0D0F18]/90 text-slate-100 placeholder-slate-500 text-sm rounded-xl border border-white/[0.08] p-3.5 transition-all duration-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              placeholder="Write a brief summary about your academic focus, career goals, and technical passions..."
            />
            <p className="text-xs text-slate-400">
              Tip: Keep it concise highlighting your strongest competencies and areas of focus.
            </p>
          </div>
        </Card>
      </form>

      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
}
