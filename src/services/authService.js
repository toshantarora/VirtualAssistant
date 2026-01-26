import api from "./api";

export const loginApi = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const signupApi = async (data) => {
  const response = await api.post("/auth/signup", data);
  return response.data;
};

export const forgotPasswordApi = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};