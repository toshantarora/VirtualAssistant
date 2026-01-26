import api from './api';

const locationService = {
  // Fetch locations (supports parentId, type, etc.)
  getLocations: async (params = {}) => {
    const response = await api.get('/public/locations', { params });
    return response.data?.data || [];
  },

  // Create a new location
  createLocation: async (data) => {
    const response = await api.post('/admin/locations', data);
    return response.data?.data;
  },

  // Update a location
  updateLocation: async (id, data) => {
    const response = await api.patch(`/admin/locations/${id}`, data);
    return response.data?.data;
  },

  // Delete a location
  deleteLocation: async (id, type) => {
    const response = await api.delete(`/admin/locations/${id}`, {
      params: { type },
    });
    return response.data;
  },

  // Get location hierarchy/details if needed
  // getLocation: async (id) => {
  //   const response = await api.get(`/admin/locations/${id}`);
  //   return response.data;
  // },
};

export default locationService;
