import axios from "axios";

const API_URL = "http://localhost:8081/api"; // backend Spring Boot

// Tạo axios instance với token
const apiClient = axios.create({
  baseURL: API_URL,
});

// Interceptor để tự động thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const registerUser = async (userData) => {
  return axios.post(`${API_URL}/register`, userData);
};

export const loginUser = async (loginData) => {
  const response = await axios.post(`${API_URL}/authenticate`, loginData);
  
  // Chỉ return response, không tự động lưu vào localStorage
  // AuthContext sẽ handle việc lưu trữ
  return response;
};

// Lấy thông tin user từ API
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/user/me');
    
    if (response.data && response.data.data) {
      // Cập nhật localStorage với thông tin mới nhất
      localStorage.setItem("user", JSON.stringify(response.data.data));
      return response.data.data;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Cập nhật thông tin user
export const updateUserProfile = async (userData) => {
  try {
    const response = await apiClient.put('/user/me', userData);
    
    if (response.data && response.data.data) {
      // Cập nhật localStorage với thông tin mới
      localStorage.setItem("user", JSON.stringify(response.data.data));
      return response.data.data;
    }
    
    return null;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Lấy thông tin user từ localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }
  return null;
};

// Xóa thông tin user khi logout
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// export const loginWithGoogle = async (idToken) => {
//   const response = await axios.post(`${API_URL}/authenticate/google`, {
//     idToken,
//   });
//   localStorage.setItem("token", response.data.data.token);
//   return response.data;
// };