import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderGit2,
  Plus,
  ExternalLink,
  Pencil,
  Trash2,
  Search,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { GithubIcon } from '../components/Icons';

import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Toast from '../components/Toast';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { projectService } from '../services/api';

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

const emptyForm = {
  title: '',
  description: '',
  technologies: '',
  github_url: '',
  demo_url: '',
  image_url: '',
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  
  // Toast notifications
  const [toast, setToast] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  // Form State
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  // Fetch projects on component mount
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectService.getProjects();
      if (res.data.success) {
        setProjects(res.data.projects || []);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setToast({
        isOpen: true,
        title: 'Connection Error',
        message: err.response?.data?.message || 'Failed to load projects from MySQL database.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setFormData(emptyForm);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      technologies: project.technologies || '',
      github_url: project.github_url || project.githubUrl || '',
      demo_url: project.demo_url || project.demoUrl || '',
      image_url: project.image_url || project.imageUrl || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!formData.title || !formData.title.trim()) {
      errors.title = 'Project title is required';
    } else if (formData.title.trim().length > 150) {
      errors.title = 'Project title must not exceed 150 characters';
    }

    if (formData.technologies && formData.technologies.trim().length > 500) {
      errors.technologies = 'Technologies list must not exceed 500 characters';
    }

    if (formData.github_url && formData.github_url.trim()) {
      if (formData.github_url.trim().length > 255) {
        errors.github_url = 'GitHub URL must not exceed 255 characters';
      } else if (!isValidHttpUrl(formData.github_url.trim())) {
        errors.github_url = 'Must be a valid URL starting with http:// or https://';
      }
    }

    if (formData.demo_url && formData.demo_url.trim()) {
      if (formData.demo_url.trim().length > 255) {
        errors.demo_url = 'Demo URL must not exceed 255 characters';
      } else if (!isValidHttpUrl(formData.demo_url.trim())) {
        errors.demo_url = 'Must be a valid URL starting with http:// or https://';
      }
    }

    if (formData.image_url && formData.image_url.trim()) {
      if (formData.image_url.trim().length > 255) {
        errors.image_url = 'Image URL must not exceed 255 characters';
      } else if (!isValidHttpUrl(formData.image_url.trim())) {
        errors.image_url = 'Must be a valid URL starting with http:// or https://';
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
      description: formData.description?.trim() || null,
      technologies: formData.technologies?.trim() || null,
      github_url: formData.github_url?.trim() || null,
      demo_url: formData.demo_url?.trim() || null,
      image_url: formData.image_url?.trim() || null,
    };

    setSubmitting(true);
    try {
      if (editingProject) {
        const res = await projectService.updateProject(editingProject.id, payload);
        if (res.data.success) {
          setProjects((prev) =>
            prev.map((p) => (p.id === editingProject.id ? res.data.project : p))
          );
          setToast({
            isOpen: true,
            title: 'Project Updated',
            message: `"${payload.title}" has been saved to MySQL.`,
            type: 'success',
          });
        }
      } else {
        const res = await projectService.createProject(payload);
        if (res.data.success) {
          setProjects((prev) => [res.data.project, ...prev]);
          setToast({
            isOpen: true,
            title: 'Project Added',
            message: `"${payload.title}" created successfully in MySQL database.`,
            type: 'success',
          });
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving project:', err);
      const serverMsg = err.response?.data?.message || 'Failed to save project.';
      setToast({
        isOpen: true,
        title: 'Save Failed',
        message: serverMsg,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setDeleting(true);
    try {
      const res = await projectService.deleteProject(projectToDelete.id);
      if (res.data.success) {
        setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
        setToast({
          isOpen: true,
          title: 'Project Deleted',
          message: `"${projectToDelete.title}" was removed from the database.`,
          type: 'success',
        });
        setIsDeleteModalOpen(false);
        setProjectToDelete(null);
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
      setToast({
        isOpen: true,
        title: 'Delete Failed',
        message: err.response?.data?.message || 'Could not delete project from database.',
        type: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Filter projects by title, description, or tech tags
  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = (p.title || '').toLowerCase().includes(q);
    const descMatch = (p.description || '').toLowerCase().includes(q);
    const techMatch = (p.technologies || '').toLowerCase().includes(q);
    return titleMatch || descMatch || techMatch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <PageHeader
        title="Project Showcase"
        subtitle="Manage software systems, open-source repositories, and verified engineering artifacts."
        badge={<Badge variant="brand">{projects.length} Total Projects</Badge>}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              leftIcon={RefreshCw}
              onClick={fetchProjects}
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
              Add Project
            </Button>
          </div>
        }
      />

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            icon={Search}
            placeholder="Search projects or tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-400 font-medium">
          <span>
            Showing {filteredProjects.length} of {projects.length} projects
          </span>
        </div>
      </div>

      {/* Loading Skeleton View */}
      {loading && (
        <LoadingSkeleton type="card" count={4} />
      )}

      {/* Empty State when no projects exist in database */}
      {!loading && projects.length === 0 && (
        <EmptyState
          icon={FolderGit2}
          title="No Projects in Your Repository Yet"
          description="Build your university portfolio by showcasing engineering projects, hackathons, full-stack systems, and research implementations."
          actionLabel="Add Your First Project"
          onAction={handleOpenAddModal}
        />
      )}

      {/* Empty State when search returns no matches */}
      {!loading && projects.length > 0 && filteredProjects.length === 0 && (
        <EmptyState
          icon={Search}
          title="No Matching Projects Found"
          description={`No project or technology matches "${searchQuery}". Try searching with a different term.`}
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
        />
      )}

      {/* Project Cards Grid */}
      {!loading && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredProjects.map((project, idx) => {
              const techList = project.technologies
                ? (Array.isArray(project.technologies)
                    ? project.technologies
                    : project.technologies.split(',').map((t) => t.trim()).filter(Boolean))
                : [];

              const displayImage =
                project.image_url ||
                project.imageUrl ||
                'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80';

              const githubLink = project.github_url || project.githubUrl;
              const demoLink = project.demo_url || project.demoUrl;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  className="flex flex-col rounded-2xl bg-[#11131F]/90 border border-white/[0.08] hover:border-brand-500/30 backdrop-blur-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 group"
                >
                  {/* Card Image Header */}
                  <div className="relative h-52 w-full overflow-hidden bg-[#0A0C14]">
                    <img
                      src={displayImage}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#11131F] via-transparent to-black/40" />

                    {/* Top badges */}
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-brand-300 border border-brand-500/30">
                        Repository Project
                      </span>
                    </div>

                    {/* Quick actions hover pill */}
                    <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditModal(project)}
                        className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-slate-300 hover:text-white hover:bg-black/80 transition-colors border border-white/[0.1]"
                        title="Edit Project"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(project)}
                        className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors border border-rose-500/20"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-brand-300 transition-colors">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                          {project.description}
                        </p>
                      )}
                    </div>

                    {/* Tech tags */}
                    {techList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {techList.map((tech, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-300 border border-white/[0.06]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer links */}
                    <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {githubLink && (
                          <a
                            href={githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                          >
                            <GithubIcon className="w-4 h-4" />
                            <span>Source</span>
                          </a>
                        )}
                        {demoLink && (
                          <a
                            href={demoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Live Demo</span>
                          </a>
                        )}
                        {!githubLink && !demoLink && (
                          <span className="text-xs text-slate-500 italic">No external links</span>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditModal(project)}
                      >
                        Edit Details
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Add New Project'}
        description="Provide comprehensive details and links for your engineering project. Changes persist directly to MySQL."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Project Title *"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Distributed Consensus Engine"
            error={formErrors.title}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#0D0F18]/90 text-slate-100 placeholder-slate-500 text-sm rounded-xl border border-white/[0.08] p-3 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              placeholder="Brief explanation of architecture, algorithms, and key impact..."
            />
            {formErrors.description && (
              <p className="text-xs text-rose-400">{formErrors.description}</p>
            )}
          </div>

          <Input
            label="Technologies (Comma-separated)"
            name="technologies"
            value={formData.technologies}
            onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
            placeholder="React, Go, Docker, gRPC, MySQL"
            error={formErrors.technologies}
            helperText="Separate multiple skills or libraries with commas."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="GitHub Repository URL"
              name="github_url"
              icon={GithubIcon}
              value={formData.github_url}
              onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
              placeholder="https://github.com/user/repo"
              error={formErrors.github_url}
            />
            <Input
              label="Live Demo URL"
              name="demo_url"
              icon={ExternalLink}
              value={formData.demo_url}
              onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
              placeholder="https://my-app.vercel.app"
              error={formErrors.demo_url}
            />
          </div>

          <Input
            label="Cover Image URL (Optional)"
            name="image_url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            error={formErrors.image_url}
            helperText="Leave empty to use a curated tech banner image."
          />

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
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Project Deletion"
        description="This action is permanent and cannot be undone."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-rose-200">
                Are you sure you want to delete this project?
              </p>
              <p className="text-xs text-rose-300/80 leading-relaxed">
                Project: <strong className="text-rose-100">{projectToDelete?.title}</strong> will be permanently removed from your MySQL database.
              </p>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/[0.08]">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
            >
              Keep Project
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

      {/* Toast Notification */}
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
