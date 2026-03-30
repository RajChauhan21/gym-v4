import axios from "axios";

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
                    "http://localhost:8180/owner/refresh",
                    {},
                    { withCredentials: true }
                );
                console.log("Token refreshed successfully, retrying original request...");
                return constant(originalRequest);

            } catch (refreshError) {

                console.log("Refresh token expired");

                // window.location.href = "http://localhost:8180/oauth2/authorization/google";
            }
        }

        return Promise.reject(error);
    }
);

export default constant;