import axios from "axios";

export const axiosClient = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || "").replace(/\/+$/, ""),
    withCredentials: true,
});

let isLoggingOut = false;

axiosClient.interceptors.request.use(
    (config) => {
        const apikey = import.meta.env.VITE_API_KEY;
        if (apikey) {
            config.headers['x-api-key'] = apikey;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);



axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const isAuthError = error.response &&
            (error.response.status === 401 || error.response.status === 403);


        const pathname = window.location.pathname;
        const hash = window.location.hash;

        const isOnLoginPage = pathname === "/" && (hash === "" || hash === "#/");


        // console.log('[Axios Debug]', {
        //     pathname,
        //     hash,
        //     isOnLoginPage,
        //     isAuthError,
        //     isLoggingOut,
        //     status: error.response?.status
        // });

        if (isAuthError && !isOnLoginPage && !isLoggingOut) {
            // Set flag to prevent duplicate logout attempts
            isLoggingOut = true;

            // console.log(`[Auth Error] ${error.response.status} - Initiating logout flow`);

            try {
                localStorage.removeItem("id");
                window.location.replace("/login");
            }
            catch (err) {
                console.error("[Logout Error]", err);
                isLoggingOut = false;
                window.location.replace("/");
            }
        }
        return Promise.reject(error);
    }
);


// Request interceptor: cookie automatically browser send karta hai (withCredentials: true)
// Koi manual token injection needed nahi hai
// axiosClient.interceptors.request.use(
//     (config) => config,
//     (error) => Promise.reject(error)
// );

// Response interceptor: 401 aaye toh logout karo
// axiosClient.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             // Token expired ya invalid — clean up aur login pe redirect
//             // localStorage.removeItem("token");
//             localStorage.removeItem("id");
//             window.location.href = "/login";
//         }
//         return Promise.reject(error);
//     }
// );

export default axiosClient;