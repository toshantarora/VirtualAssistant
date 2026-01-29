import api from './api';

const locationService = {
  // Fetch locations (supports parentId, type, etc.)
  getLocations: async (params = {}) => {
    const response = await api.get('/admin/locations', { params });
    return response.data?.data || [];
  },
  getFiltersLocations: async (params = {}) => {
    const {
      search,
      type, // REQUIRED
      page = 1,
      limit = 10,
      populateHierarchy = false,
      parentId,
      countryId,
      provinceId,
      districtId,
      constituencyId,
      wardId,
    } = params;

    if (!type) {
      throw new Error('type is required');
    }

    const queryParams = {
      type,
      page,
      limit,
      populateHierarchy,
      parentId,
      countryId,
      provinceId,
      districtId,
      constituencyId,
      wardId,
      search, // ✅ IMPORTANT
    };

    // remove undefined / empty values
    Object.keys(queryParams).forEach(
      (key) =>
        (queryParams[key] === undefined || queryParams[key] === '') && delete queryParams[key]
    );

    const response = await api.get('/admin/locations/search', {
      params: queryParams,
    });

    // ✅ return full pagination payload
    return (
      response.data?.data || {
        items: [],
        total: 0,
        page,
        limit,
      }
    );
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
