// axiosConfig.ts
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:4000', // Replace with your backend URL
});

// Add a request interceptor to attach the token to every request if logged in
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration or other errors
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status === 401) {
      // Handle token expiration or unauthorized access
      // Example: Redirect to login page or clear localStorage
      console.log('Unauthorized access or token expired');
    }
    return Promise.reject(error);
  }
);

export default instance;
