import axios from "axios";

const API_URL = "http://localhost:8081/api"; // backend Spring Boot

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