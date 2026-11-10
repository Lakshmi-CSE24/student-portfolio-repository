import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token when authenticated
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Profile API methods
export const profileService = {
  getProfile: () => api.get('/profile'),
  updateProfile: (profileData) => api.put('/profile', profileData),
  deleteProfile: () => api.delete('/profile'),
};

// Project API methods
export const projectService = {
  getProjects: () => api.get('/projects'),
  getProject: (id) => api.get(`/projects/${id}`),
  createProject: (projectData) => api.post('/projects', projectData),
  updateProject: (id, projectData) => api.put(`/projects/${id}`, projectData),
  deleteProject: (id) => api.delete(`/projects/${id}`),
};

// Skill API methods
export const skillService = {
  getSkills: () => api.get('/skills'),
  getSkill: (id) => api.get(`/skills/${id}`),
  createSkill: (skillData) => api.post('/skills', skillData),
  updateSkill: (id, skillData) => api.put(`/skills/${id}`, skillData),
  deleteSkill: (id) => api.delete(`/skills/${id}`),
};

// Achievement API methods
export const achievementService = {
  getAchievements: () => api.get('/achievements'),
  getAchievement: (id) => api.get(`/achievements/${id}`),
  createAchievement: (achievementData) => api.post('/achievements', achievementData),
  updateAchievement: (id, achievementData) => api.put(`/achievements/${id}`, achievementData),
  deleteAchievement: (id) => api.delete(`/achievements/${id}`),
};

// Certificate API methods
export const certificateService = {
  getCertificates: () => api.get('/certificates'),
  getCertificate: (id) => api.get(`/certificates/${id}`),
  createCertificate: (formData) => {
    const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
    return api.post('/certificates', formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },
  updateCertificate: (id, formData) => {
    const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
    return api.put(`/certificates/${id}`, formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
  },
  deleteCertificate: (id) => api.delete(`/certificates/${id}`),
};

// Public portfolio API (No authentication/JWT required)
export const publicService = {
  getPublicPortfolio: (slug) => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return axios.get(`${baseURL}/public/portfolio/${encodeURIComponent(slug)}`);
  },
};

export default api;
