import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck2,
  Upload,
  Calendar,
  Building2,
  ExternalLink,
  Eye,
  Trash2,
  Pencil,
  FileText,
  FileImage,
  Search,
  RefreshCw,
  AlertTriangle,
  Award,
  CheckCircle2,
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
import { certificateService } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

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
  if (!dateStr) return 'No issue date';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    });
  } catch (_) {
    return dateStr;
  }
}

// Date input helper (YYYY-MM-DD)
function toDateInputValue(dateStr) {
  if (!dateStr) return '';
  try {
    const match = String(dateStr).match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch (_) {
    return '';
  }
}

// Helper to resolve document URL
function getDocumentFullUrl(docUrl) {
  if (!docUrl) return '';
  if (docUrl.startsWith('http://') || docUrl.startsWith('https://')) {
    return docUrl;
  }
  return `${API_BASE}${docUrl}`;
}

// Helper to determine document format badge
function getDocumentFormat(docUrl) {
  if (!docUrl) return null;
  const ext = docUrl.split('.').pop()?.toUpperCase()?.split('?')[0];
  if (['PDF', 'PNG', 'JPG', 'JPEG'].includes(ext)) {
    return ext;
  }
  return 'DOC';
}

const emptyForm = {
  title: '',
  issuing_organization: '',
  issue_date: '',
  credential_id: '',
  credential_url: '',
};

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [certToDelete, setCertToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Toast
  const [toast, setToast] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  // Fetch certificates from MySQL
  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await certificateService.getCertificates();
      if (res.data.success) {
        setCertificates(res.data.certificates || []);
      }
    } catch (err) {
      console.error('Failed to fetch certificates:', err);
      setToast({
        isOpen: true,
        title: 'Connection Error',
        message: err.response?.data?.message || 'Failed to load certificates from server.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCert(null);
    setFormData(emptyForm);
    setSelectedFile(null);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cert) => {
    setEditingCert(cert);
    setFormData({
      title: cert.title || '',
      issuing_organization: cert.issuing_organization || '',
      issue_date: toDateInputValue(cert.issue_date),
      credential_id: cert.credential_id || '',
      credential_url: cert.credential_url || '',
    });
    setSelectedFile(null);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (cert) => {
    setCertToDelete(cert);
    setIsDeleteModalOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedExts = ['.pdf', '.png', '.jpg', '.jpeg'];
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedExts.includes(fileExt)) {
        setFormErrors((prev) => ({
          ...prev,
          file: 'Only PDF, PNG, JPG, and JPEG documents are supported.',
        }));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setFormErrors((prev) => ({
          ...prev,
          file: 'File size must not exceed 10MB.',
        }));
        return;
      }
      setFormErrors((prev) => ({ ...prev, file: undefined }));
      setSelectedFile(file);
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.title || !formData.title.trim()) {
      errors.title = 'Certificate title is required';
    } else if (formData.title.trim().length > 150) {
      errors.title = 'Title must not exceed 150 characters';
    }

    if (formData.issuing_organization && formData.issuing_organization.trim().length > 150) {
      errors.issuing_organization = 'Issuing organization must not exceed 150 characters';
    }

    if (formData.credential_id && formData.credential_id.trim().length > 150) {
      errors.credential_id = 'Credential ID must not exceed 150 characters';
    }

    if (formData.credential_url && formData.credential_url.trim()) {
      if (formData.credential_url.trim().length > 255) {
        errors.credential_url = 'Credential URL must not exceed 255 characters';
      } else if (!isValidHttpUrl(formData.credential_url.trim())) {
        errors.credential_url = 'Must be a valid URL starting with http:// or https://';
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

    const data = new FormData();
    data.append('title', formData.title.trim());
    if (formData.issuing_organization?.trim()) {
      data.append('issuing_organization', formData.issuing_organization.trim());
    }
    if (formData.issue_date) {
      data.append('issue_date', formData.issue_date);
    }
    if (formData.credential_id?.trim()) {
      data.append('credential_id', formData.credential_id.trim());
    }
    if (formData.credential_url?.trim()) {
      data.append('credential_url', formData.credential_url.trim());
    }
    if (selectedFile) {
      data.append('document', selectedFile);
    }

    setSubmitting(true);
    try {
      if (editingCert) {
        const res = await certificateService.updateCertificate(editingCert.id, data);
        if (res.data.success) {
          setCertificates((prev) =>
            prev.map((c) => (c.id === editingCert.id ? res.data.certificate : c))
          );
          setToast({
            isOpen: true,
            title: 'Certificate Updated',
            message: `"${formData.title}" updated in MySQL database.`,
            type: 'success',
          });
        }
      } else {
        const res = await certificateService.createCertificate(data);
        if (res.data.success) {
          setCertificates((prev) => [res.data.certificate, ...prev]);
          setToast({
            isOpen: true,
            title: 'Certificate Added',
            message: `"${formData.title}" saved to repository.`,
            type: 'success',
          });
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving certificate:', err);
      setToast({
        isOpen: true,
        title: 'Save Failed',
        message: err.response?.data?.message || 'Could not save certificate.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!certToDelete) return;
    setDeleting(true);
    try {
      const res = await certificateService.deleteCertificate(certToDelete.id);
      if (res.data.success) {
        setCertificates((prev) => prev.filter((c) => c.id !== certToDelete.id));
        setToast({
          isOpen: true,
          title: 'Certificate Deleted',
          message: `"${certToDelete.title}" was removed from the repository.`,
          type: 'success',
        });
        setIsDeleteModalOpen(false);
        setCertToDelete(null);
      }
    } catch (err) {
      console.error('Failed to delete certificate:', err);
      setToast({
        isOpen: true,
        title: 'Delete Failed',
        message: err.response?.data?.message || 'Could not delete certificate from database.',
        type: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Filter certificates by search query
  const filteredCerts = certificates.filter((c) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = (c.title || '').toLowerCase().includes(q);
    const orgMatch = (c.issuing_organization || '').toLowerCase().includes(q);
    const credMatch = (c.credential_id || '').toLowerCase().includes(q);
    return titleMatch || orgMatch || credMatch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <PageHeader
        title="Certificates & Credentials"
        subtitle="Secure document vault for professional certifications, course diplomas, and verified engineering credentials."
        badge={<Badge variant="brand">{certificates.length} Total Credentials</Badge>}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              leftIcon={RefreshCw}
              onClick={fetchCertificates}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={Upload}
              onClick={handleOpenAddModal}
            >
              Upload Certificate
            </Button>
          </div>
        }
      />

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            icon={Search}
            placeholder="Search certificates or organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-400 font-medium">
          <span>
            Showing {filteredCerts.length} of {certificates.length} credentials
          </span>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && <LoadingSkeleton type="card" count={4} />}

      {/* Empty State when no certificates exist in database */}
      {!loading && certificates.length === 0 && (
        <EmptyState
          icon={FileCheck2}
          title="No Certificates in Your Repository Yet"
          description="Build your university credential vault by uploading PDF or image certificates from AWS, Google, Meta, Coursera, and universities."
          actionLabel="Upload First Certificate"
          onAction={handleOpenAddModal}
        />
      )}

      {/* Empty State when search returns no matches */}
      {!loading && certificates.length > 0 && filteredCerts.length === 0 && (
        <EmptyState
          icon={Search}
          title="No Matching Credentials Found"
          description={`No certificates match "${searchQuery}". Try a different keyword.`}
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
        />
      )}

      {/* Certificates Grid */}
      {!loading && filteredCerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredCerts.map((cert, idx) => {
              const format = getDocumentFormat(cert.document_url);
              const docFullUrl = getDocumentFullUrl(cert.document_url);

              return (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  className="p-6 rounded-2xl bg-[#11131F]/90 border border-white/[0.08] hover:border-brand-500/30 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 group flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    {/* Header: Document Format Badge & Action buttons */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 group-hover:scale-105 transition-transform">
                          <FileCheck2 className="w-5 h-5" />
                        </div>
                        <div>
                          {format ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-300 border border-white/[0.08]">
                              {format} Document Attached
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                              No document attached
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEditModal(cert)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                          title="Edit Certificate"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(cert)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Certificate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Metadata */}
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-white tracking-tight group-hover:text-brand-300 transition-colors">
                        {cert.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium">
                        {cert.issuing_organization && (
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <Building2 className="w-3.5 h-3.5 text-brand-400" />
                            {cert.issuing_organization}
                          </span>
                        )}
                        {cert.issue_date && (
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(cert.issue_date)}
                          </span>
                        )}
                      </div>

                      {cert.credential_id && (
                        <div className="pt-1 flex items-center gap-2 text-xs text-slate-400">
                          <span className="text-[11px] font-medium text-slate-500">ID:</span>
                          <code className="text-xs text-slate-300 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06] font-mono">
                            {cert.credential_id}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                    <div>
                      {cert.credential_url ? (
                        <a
                          href={cert.credential_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                        >
                          <span>Verify Online</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          Internal record
                        </span>
                      )}
                    </div>

                    {cert.document_url ? (
                      <a
                        href={docFullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-brand-300 bg-white/[0.05] hover:bg-white/[0.1] px-3 py-1.5 rounded-xl border border-white/[0.08] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Certificate</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500 italic">
                        No file uploaded
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Certificate Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCert ? 'Edit Certificate' : 'Upload Certificate Credential'}
        description="Attach document scans (PDF/PNG/JPG) and credential metadata to your repository."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Certificate Title *"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. AWS Certified Solutions Architect"
            error={formErrors.title}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Issuing Organization"
              name="issuing_organization"
              value={formData.issuing_organization}
              onChange={(e) =>
                setFormData({ ...formData, issuing_organization: e.target.value })
              }
              placeholder="e.g. Amazon Web Services, Coursera"
              error={formErrors.issuing_organization}
            />

            <Input
              label="Issue Date"
              name="issue_date"
              type="date"
              value={formData.issue_date}
              onChange={(e) =>
                setFormData({ ...formData, issue_date: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Credential ID (Optional)"
              name="credential_id"
              value={formData.credential_id}
              onChange={(e) =>
                setFormData({ ...formData, credential_id: e.target.value })
              }
              placeholder="e.g. AWS-PSA-90821-X"
              error={formErrors.credential_id}
            />

            <Input
              label="Verification URL (Optional)"
              name="credential_url"
              icon={ExternalLink}
              value={formData.credential_url}
              onChange={(e) =>
                setFormData({ ...formData, credential_url: e.target.value })
              }
              placeholder="https://aws.amazon.com/verify/..."
              error={formErrors.credential_url}
            />
          </div>

          {/* File Upload Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Certificate Document (PDF, PNG, JPG, max 10MB)
            </label>
            <div className="border border-dashed border-white/[0.12] rounded-xl p-4 bg-[#0D0F18]/80 text-center hover:border-brand-500/40 transition-colors">
              <input
                type="file"
                id="cert-file-upload"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
              />
              <label
                htmlFor="cert-file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-6 h-6 text-brand-400" />
                <span className="text-xs font-medium text-slate-300">
                  {selectedFile
                    ? selectedFile.name
                    : editingCert?.document_url
                    ? 'Replace existing document (click to choose new file)'
                    : 'Click to select certificate document'}
                </span>
                <span className="text-[11px] text-slate-500">
                  Supported formats: PDF, PNG, JPG (up to 10MB)
                </span>
              </label>
            </div>
            {formErrors.file && (
              <p className="text-xs text-rose-400">{formErrors.file}</p>
            )}
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
              {editingCert ? 'Save Changes' : 'Upload Certificate'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Certificate Deletion"
        description="This action is permanent and cannot be undone."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-rose-200">
                Are you sure you want to delete this certificate?
              </p>
              <p className="text-xs text-rose-300/80 leading-relaxed">
                Certificate: <strong className="text-rose-100">{certToDelete?.title}</strong> and any associated document file will be permanently removed.
              </p>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/[0.08]">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
            >
              Keep Certificate
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
