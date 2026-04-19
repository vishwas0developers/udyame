import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5012/api/v1";

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // for HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to inject the JWT token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        const { access_token } = response.data;
        
        localStorage.setItem("auth_token", access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem("auth_token");
        if (typeof window !== "undefined") {
          window.location.href = "/?auth=login";
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
