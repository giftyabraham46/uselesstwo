import axios from 'axios';

// Configure axios defaults
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for image processing
});

// Upload images and metadata
export const uploadImages = async (frontImage, sideImage, metadata) => {
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

  try {
    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || 
      error.message || 
      'Failed to upload images'
    );
  }
};

// Process uploaded images
export const processImages = async (sessionId) => {
  try {
    const response = await api.post(`/api/process/${sessionId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || 
      error.message || 
      'Failed to process images'
    );
  }
};

// Get analysis results
export const getResults = async (sessionId) => {
  try {
    const response = await api.get(`/api/results/${sessionId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || 
      error.message || 
      'Failed to get results'
    );
  }
};

// Export results in specified format
export const exportResults = async (sessionId, format) => {
  try {
    const formData = new FormData();
    formData.append('format', format);

    const response = await api.post(`/api/export/${sessionId}`, formData, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Determine filename based on format
    const fileExtension = format === 'pdf' ? 'pdf' : 
                         format === 'png' ? 'png' : 
                         format === 'obj' ? 'obj' : 'gltf';
    link.setAttribute('download', `tree_analysis_${sessionId}.${fileExtension}`);
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || 
      error.message || 
      'Failed to export results'
    );
  }
};

// Get list of sessions
export const getSessions = async () => {
  try {
    const response = await api.get('/api/sessions');
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || 
      error.message || 
      'Failed to get sessions'
    );
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('API is not available');
  }
};

export default api;
