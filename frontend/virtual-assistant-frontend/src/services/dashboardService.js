import api from "./api";

export const getLocations = async ({ type, parentId }) => {
  const { data } = await api.get("/admin/locations", {
    params: {
      type,
      ...(parentId && { parentId }),
    },
  });

  return data || [];
};

export const createUserApi = async (payload) => {
  const { data } = await api.post("/admin/users", payload);
  return data;
};

export const getDashboardStats = () => {
  return api.get("/admin/dashboard/stats");
};

export const getUsers = async ({
  page = 1,
  limit = 10,
  search = "",
  role = "USER",
  isActive,
}) => {
  const API_URL = "/admin/users";
  const params = {
    page,
    limit,
    role,
  };

  if (search) params.search = search;
  if (isActive !== undefined) params.isActive = isActive;

  return api.get(API_URL, { params });
};

export const updateUserApi = (id, payload) => {
  return api.patch(
    `/admin/users/${id}`,
    payload
  );
};

export const deleteUserApi = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`, // if auth needed
    },
  });

  return response.data;
};