import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Plus,
  Calendar,
  Building2,
  ExternalLink,
  Trash2,
  Pencil,
  Search,
  RefreshCw,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Toast from '../components/Toast';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { achievementService } from '../services/api';

const standardCategories = [
  'All',
  'Academic',
  'Certification',
  'Competition',
  'Hackathon',
  'Award',
  'Research',
  'Leadership',
  'Extracurricular',
  'Other',
];

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

// Display date formatter
function formatDate(dateStr) {
  if (!dateStr) return 'Not specified';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
  } catch (_) {
    return dateStr;
  }
}

// HTML date input value helper (YYYY-MM-DD)
function toDateInputValue(dateStr) {
  if (!dateStr) return '';
  try {
    // If already in YYYY-MM-DD
    const match = String(dateStr).match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch (_) {
    return '';
  }
}

const emptyForm = {
  title: '',
  category: 'Certification',
  organization: '',
  achievement_date: '',
  description: '',
  document_url: '',
};

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [achievementToDelete, setAchievementToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  // Toast State
  const [toast, setToast] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  // Fetch achievements from MySQL
  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await achievementService.getAchievements();
      if (res.data.success) {
        setAchievements(res.data.achievements || []);
      }
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
      setToast({
        isOpen: true,
        title: 'Connection Error',
        message: err.response?.data?.message || 'Failed to load achievements from MySQL database.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleOpenAddModal = () => {
    setEditingAchievement(null);
    setFormData(emptyForm);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingAchievement(item);
    setFormData({
      title: item.title || '',
      category: item.category || 'Certification',
      organization: item.organization || '',
      achievement_date: toDateInputValue(item.achievement_date),
      description: item.description || '',
      document_url: item.document_url || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (item) => {
    setAchievementToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!formData.title || !formData.title.trim()) {
      errors.title = 'Achievement title is required';
    } else if (formData.title.trim().length > 150) {
      errors.title = 'Title must not exceed 150 characters';
    }

    if (!formData.category || !formData.category.trim()) {
      errors.category = 'Category is required';
    } else if (formData.category.trim().length > 100) {
      errors.category = 'Category must not exceed 100 characters';
    }

    if (formData.organization && formData.organization.trim().length > 150) {
      errors.organization = 'Organization must not exceed 150 characters';
    }

    if (formData.document_url && formData.document_url.trim()) {
      if (formData.document_url.trim().length > 255) {
        errors.document_url = 'Document URL must not exceed 255 characters';
      } else if (!isValidHttpUrl(formData.document_url.trim())) {
        errors.document_url = 'Must be a valid URL starting with http:// or https://';
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      title: formData.title.trim(),
      category: formData.category.trim(),
      organization: formData.organization?.trim() || null,
      achievement_date: formData.achievement_date || null,
      description: formData.description?.trim() || null,
      document_url: formData.document_url?.trim() || null,
    };

    setSubmitting(true);
    try {
      if (editingAchievement) {
        const res = await achievementService.updateAchievement(
          editingAchievement.id,
          payload
        );
        if (res.data.success) {
          setAchievements((prev) =>
            prev.map((a) =>
              a.id === editingAchievement.id ? res.data.achievement : a
            )
          );
          setToast({
            isOpen: true,
            title: 'Achievement Updated',
            message: `"${payload.title}" updated in MySQL database.`,
            type: 'success',
          });
        }
      } else {
        const res = await achievementService.createAchievement(payload);
        if (res.data.success) {
          setAchievements((prev) => [res.data.achievement, ...prev]);
          setToast({
            isOpen: true,
            title: 'Achievement Added',
            message: `"${payload.title}" created successfully in MySQL database.`,
            type: 'success',
          });
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving achievement:', err);
      setToast({
        isOpen: true,
        title: 'Save Failed',
        message: err.response?.data?.message || 'Could not save achievement.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!achievementToDelete) return;
    setDeleting(true);
    try {
      const res = await achievementService.deleteAchievement(achievementToDelete.id);
      if (res.data.success) {
        setAchievements((prev) =>
          prev.filter((a) => a.id !== achievementToDelete.id)
        );
        setToast({
          isOpen: true,
          title: 'Achievement Deleted',
          message: `"${achievementToDelete.title}" was removed from the database.`,
          type: 'success',
        });
        setIsDeleteModalOpen(false);
        setAchievementToDelete(null);
      }
    } catch (err) {
      console.error('Failed to delete achievement:', err);
      setToast({
        isOpen: true,
        title: 'Delete Failed',
        message: err.response?.data?.message || 'Could not delete achievement from database.',
        type: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Filter achievements by category & search query
  const filteredAchievements = achievements.filter((a) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (a.category || '').toLowerCase() === selectedCategory.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (a.title || '').toLowerCase().includes(q) ||
      (a.category || '').toLowerCase().includes(q) ||
      (a.organization || '').toLowerCase().includes(q) ||
      (a.description || '').toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        title="Achievements & Milestones"
        subtitle="Chronological record of internships, certifications, university honors, and verified publications."
        badge={<Badge variant="brand">{achievements.length} Recorded Entries</Badge>}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              leftIcon={RefreshCw}
              onClick={fetchAchievements}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={Plus}
              onClick={handleOpenAddModal}
            >
              Add Achievement
            </Button>
          </div>
        }
      />

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
          {standardCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-brand-500 text-white shadow-glow-sm border border-brand-400/30'
                  : 'bg-[#121422] text-slate-400 hover:text-white hover:bg-[#181a2e] border border-white/[0.06]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-72 shrink-0">
          <Input
            icon={Search}
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && <LoadingSkeleton type="list" count={4} />}

      {/* Empty State when no achievements exist in database */}
      {!loading && achievements.length === 0 && (
        <EmptyState
          icon={Award}
          title="No Achievements in Your Repository Yet"
          description="Record your university awards, hackathons, verified certifications, internships, and research milestones directly in MySQL."
          actionLabel="Add Your First Achievement"
          onAction={handleOpenAddModal}
        />
      )}

      {/* Empty State when filtered results are zero */}
      {!loading && achievements.length > 0 && filteredAchievements.length === 0 && (
        <EmptyState
          icon={Search}
          title="No Matching Achievements Found"
          description={`No achievements match category "${selectedCategory}" with query "${searchQuery}".`}
          actionLabel="Clear Filters"
          onAction={() => {
            setSelectedCategory('All');
            setSearchQuery('');
          }}
        />
      )}

      {/* Timeline Layout */}
      {!loading && filteredAchievements.length > 0 && (
        <div className="relative border-l border-white/[0.08] ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8">
          <AnimatePresence>
            {filteredAchievements.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="relative group"
              >
                {/* Timeline Node Dot */}
                <div className="absolute -left-[35px] sm:-left-[43px] top-4 w-5 h-5 rounded-full bg-[#0D0F18] border-2 border-brand-500 flex items-center justify-center shadow-glow-sm group-hover:scale-125 transition-transform">
                  <div className="w-2 h-2 rounded-full bg-brand-400" />
                </div>

                {/* Achievement Card */}
                <Card className="hover:border-brand-500/30 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md border border-brand-500/20">
                          {item.category}
                        </span>

                        {/* Verified Status */}
                        {item.verified ? (
                          <Badge variant="success" size="sm" dot>
                            Verified Record
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">
                            Self-Reported
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-white tracking-tight pt-1">
                        {item.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium">
                        {item.organization && (
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <Building2 className="w-3.5 h-3.5 text-brand-400" />
                            {item.organization}
                          </span>
                        )}
                        {item.achievement_date && (
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(item.achievement_date)}
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-xs text-slate-300 leading-relaxed pt-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                        title="Edit Achievement"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Achievement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Supporting Document Link */}
                  {item.document_url && (
                    <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <FileText className="w-4 h-4 text-brand-400 shrink-0" />
                        <span className="font-mono text-[11px] truncate max-w-xs text-slate-300">
                          Supporting Credential Document
                        </span>
                      </div>
                      <a
                        href={item.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                      >
                        <span>View Document</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Achievement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAchievement ? 'Edit Achievement' : 'Add New Achievement'}
        description="Record your milestones, certifications, and awards directly in MySQL."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Achievement Title *"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. AWS Certified Solutions Architect"
            error={formErrors.title}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#0D0F18]/90 text-slate-100 text-sm rounded-xl border border-white/[0.08] px-3 py-2.5 focus:outline-none focus:border-brand-500"
              >
                {standardCategories
                  .filter((c) => c !== 'All')
                  .map((cat) => (
                    <option key={cat} value={cat} className="bg-[#121422] text-white">
                      {cat}
                    </option>
                  ))}
              </select>
              {formErrors.category && (
                <p className="text-xs text-rose-400">{formErrors.category}</p>
              )}
            </div>

            <Input
              label="Issuing Organization"
              name="organization"
              value={formData.organization}
              onChange={(e) =>
                setFormData({ ...formData, organization: e.target.value })
              }
              placeholder="e.g. Amazon Web Services, IEEE"
              error={formErrors.organization}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Achievement Date"
              name="achievement_date"
              type="date"
              value={formData.achievement_date}
              onChange={(e) =>
                setFormData({ ...formData, achievement_date: e.target.value })
              }
            />

            <Input
              label="Document URL (Optional)"
              name="document_url"
              icon={ExternalLink}
              value={formData.document_url}
              onChange={(e) =>
                setFormData({ ...formData, document_url: e.target.value })
              }
              placeholder="https://credential.net/..."
              error={formErrors.document_url}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Description / Impact
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full bg-[#0D0F18]/90 text-slate-100 placeholder-slate-500 text-sm rounded-xl border border-white/[0.08] p-3 focus:outline-none focus:border-brand-500"
              placeholder="Summary of skills demonstrated, competition ranking, or publication impact..."
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.08]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              {editingAchievement ? 'Save Changes' : 'Create Achievement'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Achievement Deletion"
        description="This action is permanent and cannot be undone."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-rose-200">
                Are you sure you want to delete this achievement?
              </p>
              <p className="text-xs text-rose-300/80 leading-relaxed">
                Achievement: <strong className="text-rose-100">{achievementToDelete?.title}</strong> will be permanently removed from your MySQL database.
              </p>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/[0.08]">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
            >
              Keep Achievement
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              isLoading={deleting}
              leftIcon={Trash2}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Feedback */}
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
