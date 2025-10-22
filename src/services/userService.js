import axios from "axios";

const API_URL = "http://localhost:8081/api"; // backend Spring Boot

// Lấy thông tin user hiện tại từ token
export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");
  const response = await axios.get(`${API_URL}/user/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const registerUser = async (userData) => {
  return axios.post(`${API_URL}/register`, userData);
};
export const loginUser = async (loginData) => {
  return axios.post(`${API_URL}/authenticate`, loginData);
};
// export const loginWithGoogle = async (idToken) => {
//   const response = await axios.post(`${API_URL}/authenticate/google`, {
//     idToken,
//   });
//   localStorage.setItem("token", response.data.data.token);
//   return response.data;
// };