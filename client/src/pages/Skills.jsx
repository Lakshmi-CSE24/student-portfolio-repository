import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Plus,
  Terminal,
  Database,
  Cloud,
  Wrench,
  Boxes,
  Trash2,
  Pencil,
  Search,
  Sparkles,
  RefreshCw,
  Cpu,
  GitBranch,
  AlertTriangle,
} from 'lucide-react';

import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Toast from '../components/Toast';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { skillService } from '../services/api';

const standardCategories = [
  'All',
  'Programming',
  'Frontend',
  'Backend',
  'Database',
  'Cloud',
  'DevOps',
  'Tools',
  'Other',
];

const categoryIcons = {
  Programming: Terminal,
  Frontend: Code2,
  Backend: Cpu,
  Database: Database,
  Cloud: Cloud,
  DevOps: GitBranch,
  Tools: Wrench,
  Other: Boxes,
};

const proficiencyColors = {
  Beginner: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  Intermediate: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  Advanced: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  Expert: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

const proficiencyToPercent = {
  Beginner: 40,
  Intermediate: 65,
  Advanced: 85,
  Expert: 95,
};

const emptyForm = {
  skill_name: '',
  skill_category: 'Programming',
  proficiency: 'Intermediate',
};

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  // Toast Notification
  const [toast, setToast] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  // Fetch skills from MySQL
  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await skillService.getSkills();
      if (res.data.success) {
        setSkills(res.data.skills || []);
      }
    } catch (err) {
      console.error('Failed to fetch skills:', err);
      setToast({
        isOpen: true,
        title: 'Connection Error',
        message: err.response?.data?.message || 'Failed to load skills from MySQL database.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleOpenAddModal = () => {
    setEditingSkill(null);
    setFormData(emptyForm);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (skill) => {
    setEditingSkill(skill);
    setFormData({
      skill_name: skill.skill_name || '',
      skill_category: skill.skill_category || 'Programming',
      proficiency: skill.proficiency || 'Intermediate',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (skill) => {
    setSkillToDelete(skill);
    setIsDeleteModalOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!formData.skill_name || !formData.skill_name.trim()) {
      errors.skill_name = 'Skill name is required';
    } else if (formData.skill_name.trim().length > 100) {
      errors.skill_name = 'Skill name must not exceed 100 characters';
    }

    if (formData.skill_category && formData.skill_category.trim().length > 100) {
      errors.skill_category = 'Skill category must not exceed 100 characters';
    }

    const validProficiencies = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    if (formData.proficiency && !validProficiencies.includes(formData.proficiency)) {
      errors.proficiency = 'Invalid proficiency level selected';
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
      skill_name: formData.skill_name.trim(),
      skill_category: formData.skill_category?.trim() || null,
      proficiency: formData.proficiency || null,
    };

    setSubmitting(true);
    try {
      if (editingSkill) {
        const res = await skillService.updateSkill(editingSkill.id, payload);
        if (res.data.success) {
          setSkills((prev) =>
            prev.map((s) => (s.id === editingSkill.id ? res.data.skill : s))
          );
          setToast({
            isOpen: true,
            title: 'Skill Updated',
            message: `"${payload.skill_name}" has been updated in MySQL.`,
            type: 'success',
          });
        }
      } else {
        const res = await skillService.createSkill(payload);
        if (res.data.success) {
          setSkills((prev) => [...prev, res.data.skill]);
          setToast({
            isOpen: true,
            title: 'Skill Added',
            message: `"${payload.skill_name}" created successfully in MySQL database.`,
            type: 'success',
          });
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving skill:', err);
      setToast({
        isOpen: true,
        title: 'Save Failed',
        message: err.response?.data?.message || 'Could not save skill.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!skillToDelete) return;
    setDeleting(true);
    try {
      const res = await skillService.deleteSkill(skillToDelete.id);
      if (res.data.success) {
        setSkills((prev) => prev.filter((s) => s.id !== skillToDelete.id));
        setToast({
          isOpen: true,
          title: 'Skill Deleted',
          message: `"${skillToDelete.skill_name}" was removed from the database.`,
          type: 'success',
        });
        setIsDeleteModalOpen(false);
        setSkillToDelete(null);
      }
    } catch (err) {
      console.error('Failed to delete skill:', err);
      setToast({
        isOpen: true,
        title: 'Delete Failed',
        message: err.response?.data?.message || 'Could not delete skill from database.',
        type: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Filter skills by category and search query
  const filteredSkills = skills.filter((s) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (s.skill_category || '').toLowerCase() === selectedCategory.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (s.skill_name || '').toLowerCase().includes(q) ||
      (s.skill_category || '').toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <PageHeader
        title="Skills & Technologies"
        subtitle="Manage programming languages, frameworks, cloud infrastructure, and technical competencies."
        badge={<Badge variant="brand">{skills.length} Tracked Skills</Badge>}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              leftIcon={RefreshCw}
              onClick={fetchSkills}
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
              Add Skill
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
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && <LoadingSkeleton type="card" count={6} />}

      {/* Empty State when no skills exist in database */}
      {!loading && skills.length === 0 && (
        <EmptyState
          icon={Code2}
          title="No Skills in Your Repository Yet"
          description="Catalog your technical stack, programming languages, databases, and engineering competencies directly in MySQL."
          actionLabel="Add Your First Skill"
          onAction={handleOpenAddModal}
        />
      )}

      {/* Empty State when filtered results are zero */}
      {!loading && skills.length > 0 && filteredSkills.length === 0 && (
        <EmptyState
          icon={Search}
          title="No Matching Skills Found"
          description={`No skills match category "${selectedCategory}" with query "${searchQuery}".`}
          actionLabel="Clear Filters"
          onAction={() => {
            setSelectedCategory('All');
            setSearchQuery('');
          }}
        />
      )}

      {/* Skills Grid */}
      {!loading && filteredSkills.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredSkills.map((skill, index) => {
              const Icon = categoryIcons[skill.skill_category] || Code2;
              const prof = skill.proficiency || 'Intermediate';
              const badgeStyle = proficiencyColors[prof] || proficiencyColors.Intermediate;
              const percent = proficiencyToPercent[prof] || 65;

              return (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, delay: index * 0.02 }}
                  className="relative p-5 rounded-2xl bg-[#11131F]/90 border border-white/[0.08] hover:border-brand-500/30 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-brand-400 group-hover:scale-105 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-tight group-hover:text-brand-300 transition-colors">
                          {skill.skill_name}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {skill.skill_category || 'General'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditModal(skill)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                        title="Edit Skill"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(skill)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeStyle}`}
                      >
                        {prof}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {percent}%
                      </span>
                    </div>

                    {/* Skill level indicator bar */}
                    <div className="h-2 w-full bg-[#0A0C14] rounded-full overflow-hidden p-0.5 border border-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Skill Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSkill ? 'Edit Skill' : 'Add New Skill'}
        description="Configure technical competency, domain category, and proficiency level in MySQL."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Skill Name *"
            name="skill_name"
            value={formData.skill_name}
            onChange={(e) => setFormData({ ...formData, skill_name: e.target.value })}
            placeholder="e.g. Next.js, Kubernetes, PostgreSQL, Go"
            error={formErrors.skill_name}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Category
              </label>
              <select
                name="skill_category"
                value={formData.skill_category}
                onChange={(e) =>
                  setFormData({ ...formData, skill_category: e.target.value })
                }
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
              {formErrors.skill_category && (
                <p className="text-xs text-rose-400">{formErrors.skill_category}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Proficiency Level
              </label>
              <select
                name="proficiency"
                value={formData.proficiency}
                onChange={(e) =>
                  setFormData({ ...formData, proficiency: e.target.value })
                }
                className="w-full bg-[#0D0F18]/90 text-slate-100 text-sm rounded-xl border border-white/[0.08] px-3 py-2.5 focus:outline-none focus:border-brand-500"
              >
                <option value="Beginner" className="bg-[#121422] text-white">
                  Beginner
                </option>
                <option value="Intermediate" className="bg-[#121422] text-white">
                  Intermediate
                </option>
                <option value="Advanced" className="bg-[#121422] text-white">
                  Advanced
                </option>
                <option value="Expert" className="bg-[#121422] text-white">
                  Expert
                </option>
              </select>
              {formErrors.proficiency && (
                <p className="text-xs text-rose-400">{formErrors.proficiency}</p>
              )}
            </div>
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
              {editingSkill ? 'Save Changes' : 'Create Skill'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Skill Deletion"
        description="This action is permanent and cannot be undone."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-rose-200">
                Are you sure you want to delete this skill?
              </p>
              <p className="text-xs text-rose-300/80 leading-relaxed">
                Skill: <strong className="text-rose-100">{skillToDelete?.skill_name}</strong> will be permanently removed from your MySQL database.
              </p>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/[0.08]">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
            >
              Keep Skill
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
