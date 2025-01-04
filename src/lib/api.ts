import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // Should point to your backend base URL
    withCredentials: true, // Required if using cookies or sessions
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allow all origins (update for specific domains if required)
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS", // Allowed methods
        "Access-Control-Allow-Headers": "Content-Type, Authorization", // Allowed headers
    },
});

export default api;
