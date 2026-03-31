import axios from "axios";
import { toast } from "sonner";

const constant = axios.create({
    baseURL: "http://localhost:8180",
    withCredentials: true
});


constant.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status == 401 && !originalRequest._retry) {

            originalRequest._retry = true;

            try {

                await axios.post(
                    "http://localhost:8180/owner/auth/refresh",
                    {},
                    { withCredentials: true }
                );
                console.log("Token refreshed successfully, retrying original request...");
                return constant(originalRequest);

            } catch (refreshError) {

                console.log("Refresh token expired");

                // If refresh fails, call the failure callback (which will redirect to landing)
                localStorage.removeItem("isLoggedIn");
                if (window.location.pathname !== "/") {
                    window.location.href = "/";
                }
                toast.error("Session expired. Please log in again.");

                // window.location.href = "http://localhost:8180/oauth2/authorization/google";
            }
        }

        return Promise.reject(error);
    }
);

export default constant;