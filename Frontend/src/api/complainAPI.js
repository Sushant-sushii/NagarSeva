// Frontend/src/api/complainAPI.js
// API client for complaint management endpoints

const API_BASE_URL = 'http://localhost:3000/api/complains';

/**
 * Make API requests with error handling
 * Includes credentials: 'include' to automatically send/receive cookies
 */
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include', // Send and receive cookies with every request
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Create a new complaint
 * @param {Object} complaintData - Complaint data object
 * @param {Object} complaintData.location - Location object with latitude and longitude
 * @param {number} complaintData.location.latitude - Latitude of complaint location
 * @param {number} complaintData.location.longitude - Longitude of complaint location
 * @param {string} complaintData.category - Category of complaint
 * @param {string} complaintData.department - Department to handle complaint
 * @param {string} complaintData.wardNumber - Ward number
 * @param {string} complaintData.severity - Severity level (Low, Medium, High)
 * @param {string} complaintData.imageUrl - Image URL (optional)
 * @param {boolean} complaintData.isSafetyHazardAtNight - Safety hazard flag (optional)
 * @returns {Promise<Object>} Created complaint object
 */
export const createComplaint = async (complaintData) => {
  return apiCall('/create', {
    method: 'POST',
    body: JSON.stringify(complaintData),
  });
};

/**
 * Get a single complaint by ID
 * @param {string} complaintId - ID of the complaint
 * @returns {Promise<Object>} Complaint object
 */
export const getComplaint = async (complaintId) => {
  if (!complaintId) {
    throw new Error('Complaint ID is required');
  }
  return apiCall(`/${complaintId}`, {
    method: 'GET',
  });
};

/**
 * Get all complaints with optional filters and pagination
 * @param {Object} filters - Filter options (optional)
 * @param {string} filters.status - Status filter (Open, Resolved, Escalated)
 * @param {string} filters.category - Category filter
 * @param {string} filters.department - Department filter
 * @param {string} filters.wardNumber - Ward number filter
 * @param {string} filters.severity - Severity filter (Low, Medium, High)
 * @param {number} filters.page - Page number (default: 1)
 * @param {number} filters.limit - Items per page (default: 10)
 * @returns {Promise<Object>} Paginated complaints array with metadata
 */
export const getAllComplaints = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.category) queryParams.append('category', filters.category);
  if (filters.department) queryParams.append('department', filters.department);
  if (filters.wardNumber) queryParams.append('wardNumber', filters.wardNumber);
  if (filters.severity) queryParams.append('severity', filters.severity);
  if (filters.page) queryParams.append('page', filters.page);
  if (filters.limit) queryParams.append('limit', filters.limit);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/?${queryString}` : '/';

  return apiCall(endpoint, {
    method: 'GET',
  });
};

/**
 * Get complaints filed by a specific user
 * @param {string} userId - ID of the user
 * @param {Object} options - Pagination options (optional)
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @returns {Promise<Object>} User's complaints with pagination metadata
 */
export const getMyComplaints = async (userId, options = {}) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const queryParams = new URLSearchParams();
  if (options.page) queryParams.append('page', options.page);
  if (options.limit) queryParams.append('limit', options.limit);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/user/${userId}?${queryString}` : `/user/${userId}`;

  return apiCall(endpoint, {
    method: 'GET',
  });
};

/**
 * Get complaints near a specific location (geospatial query)
 * @param {number} latitude - Latitude of center point
 * @param {number} longitude - Longitude of center point
 * @param {number} radius - Radius in meters
 * @returns {Promise<Object>} Nearby complaints array
 */
export const getNearbyCom plaints = async (latitude, longitude, radius) => {
  if (!latitude || !longitude || !radius) {
    throw new Error('Latitude, longitude, and radius are required');
  }

  return apiCall(`/nearby/${latitude}/${longitude}/${radius}`, {
    method: 'GET',
  });
};

/**
 * Update complaint status
 * @param {string} complaintId - ID of the complaint
 * @param {string} status - New status (Open, Resolved, Escalated)
 * @returns {Promise<Object>} Updated complaint object
 */
export const updateComplaintStatus = async (complaintId, status) => {
  if (!complaintId || !status) {
    throw new Error('Complaint ID and status are required');
  }

  return apiCall(`/${complaintId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

/**
 * Update complaint fields (admin/official only)
 * @param {string} complaintId - ID of the complaint
 * @param {Object} updateData - Data to update
 * @param {string} updateData.category - Category (optional)
 * @param {string} updateData.department - Department (optional)
 * @param {string} updateData.severity - Severity (optional)
 * @param {string} updateData.officialSummary - Official summary (optional)
 * @param {boolean} updateData.isSafetyHazardAtNight - Safety flag (optional)
 * @returns {Promise<Object>} Updated complaint object
 */
export const updateComplaint = async (complaintId, updateData) => {
  if (!complaintId) {
    throw new Error('Complaint ID is required');
  }

  return apiCall(`/${complaintId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
};

/**
 * Delete a complaint (only by creator or admin)
 * @param {string} complaintId - ID of the complaint
 * @returns {Promise<Object>} Success message
 */
export const deleteComplaint = async (complaintId) => {
  if (!complaintId) {
    throw new Error('Complaint ID is required');
  }

  return apiCall(`/${complaintId}`, {
    method: 'DELETE',
  });
};

/**
 * Get complaint statistics for a ward
 * @param {string} wardNumber - Ward number
 * @returns {Promise<Object>} Ward statistics including counts by status, category, etc.
 */
export const getWardStats = async (wardNumber) => {
  if (!wardNumber) {
    throw new Error('Ward number is required');
  }

  return apiCall(`/stats/${wardNumber}`, {
    method: 'GET',
  });
};

/**
 * Build query string from filter object
 * @param {Object} filters - Filter object
 * @returns {string} Query string
 */
export const buildQueryString = (filters) => {
  const queryParams = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      queryParams.append(key, filters[key]);
    }
  });

  return queryParams.toString();
};
