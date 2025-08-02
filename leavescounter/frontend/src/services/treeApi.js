import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 30000, // 30 seconds timeout for large file uploads
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An error occurred';
    console.error('API Error:', message);
    throw new Error(message);
  }
);

/**
 * Upload front and side view images with optional metadata
 */
export const uploadImages = async (frontImage, sideImage, metadata = {}) => {
  const formData = new FormData();
  formData.append('front_image', frontImage);
  formData.append('side_image', sideImage);
  
  // Add metadata if provided
  if (metadata.camera_height) {
    formData.append('camera_height', metadata.camera_height);
  }
  if (metadata.distance_from_tree) {
    formData.append('distance_from_tree', metadata.distance_from_tree);
  }
  if (metadata.image_dpi) {
    formData.append('image_dpi', metadata.image_dpi);
  }

  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Process uploaded images for tree analysis
 */
export const processImages = async (sessionId) => {
  return api.post(`/process/${sessionId}`);
};

/**
 * Get analysis results for a session
 */
export const getResults = async (sessionId) => {
  return api.get(`/results/${sessionId}`);
};

/**
 * Export results in specified format
 */
export const exportResults = async (sessionId, format) => {
  const response = await fetch(`${api.defaults.baseURL}/export/${sessionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `format=${format}`,
  });

  if (!response.ok) {
    throw new Error(`Export failed: ${response.statusText}`);
  }

  // Get filename from headers or use default
  const contentDisposition = response.headers.get('content-disposition');
  let filename = `tree_analysis_${sessionId}.${format}`;
  
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    if (filenameMatch) {
      filename = filenameMatch[1];
    }
  }

  // Download the file
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Get list of all analysis sessions
 */
export const getSessions = async () => {
  return api.get('/sessions');
};

/**
 * Health check endpoint
 */
export const healthCheck = async () => {
  return api.get('/health');
};

export default api;
