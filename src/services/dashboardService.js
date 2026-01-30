import api from './api';

export const getLocations = async ({ type, parentId }) => {
  const { data } = await api.get('/admin/locations', {
    params: {
      type,
      ...(parentId && { parentId }),
    },
  });

  return data || [];
};

export const createUserApi = async (payload) => {
  const { data } = await api.post('/admin/users', payload);
  return data;
};

export const getDashboardStats = ({
  countryId,
  provinceId,
  districtId,
  constituencyId,
  wardId,
  facilityId,
}) => {
  const params = {};
  if (countryId) params.countryId = countryId;
  if (provinceId) params.provinceId = provinceId;
  if (districtId) params.districtId = districtId;
  if (constituencyId) params.constituencyId = constituencyId;
  if (wardId) params.wardId = wardId;
  if (facilityId) params.facilityId = facilityId;

  return api.get('/admin/dashboard/stats', { params });
};

export const getUsers = async ({
  page = 1,
  limit = 10,
  search = '',
  role = 'USER',
  userStatus,
  lastActiveFrom,
  lastActiveTo,
  activeLast7Days,
  inactiveLast7Days,
  sortBy,
  countryId,
  provinceId,
  districtId,
  constituencyId,
  wardId,
  facilityId,
}) => {
  const API_URL = '/admin/users';

  const params = {
    page,
    limit,
    role,
  };

  if (search) params.search = search;
  if (userStatus) params.userStatus = userStatus;
  if (lastActiveFrom) params.lastActiveFrom = lastActiveFrom;
  if (lastActiveTo) params.lastActiveTo = lastActiveTo;
  if (activeLast7Days !== undefined) params.activeLast7Days = activeLast7Days;
  if (inactiveLast7Days !== undefined) params.inactiveLast7Days = inactiveLast7Days;
  if (sortBy) params.sortBy = sortBy;
  if (countryId) params.countryId = countryId;
  if (provinceId) params.provinceId = provinceId;
  if (districtId) params.districtId = districtId;
  if (constituencyId) params.constituencyId = constituencyId;
  if (wardId) params.wardId = wardId;
  if (facilityId) params.facilityId = facilityId;

  return api.get(API_URL, { params });
};

export const updateUserApi = (id, payload) => {
  return api.patch(`/admin/users/${id}`, payload);
};

export const deleteUserApi = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`, // if auth needed
    },
  });

  return response.data;
};
