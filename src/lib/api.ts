import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // Should point to your backend base URL
    withCredentials: true, // Required if using cookies or sessions
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
