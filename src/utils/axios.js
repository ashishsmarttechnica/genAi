import axios from "axios";

const axiosInstance = axios.create({
    // baseURL: import.meta.env.VITE_API_URL,
    // Vite proxy /api → backend forward karega (no CORS!)
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'x-api-key': import.meta.env.VITE_API_KEY,
        "Content-Type": "application/json",
    },
});

// Request interceptor: cookie automatically browser send karta hai (withCredentials: true)
// Koi manual token injection needed nahi hai
axiosInstance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

// Response interceptor: 401 aaye toh logout karo
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired ya invalid — clean up aur login pe redirect
            // localStorage.removeItem("token");
            localStorage.removeItem("id");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;