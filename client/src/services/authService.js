import api from "../utils/axios";

export const loginSchool = async (data) => {
  return await api.post("/api/auth/school-login", data);
};

export const loginParent = async (data) => {
  return await api.post("/api/auth/parent-login", data);
};

export const registerSchool = async (data) => {
  return await api.post("/api/auth/register-school", data);
};
