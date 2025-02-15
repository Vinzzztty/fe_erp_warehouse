"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api"; // Import the Axios instance

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Make API request
            console.log("Sending request to /auth/login", username, password);
            const response = await api.post("auth/login", {
                username,
                password,
            });
            console.log("Response:", response.data);

            // Save the token in localStorage
            const { token } = response.data;
            localStorage.setItem("authToken", token);

            // Redirect to the dashboard
            router.push("/");
        } catch (err: any) {
            // Handle errors based on API response
            if (err.response) {
                const status = err.response.status || "Unknown status";
                const message =
                    err.response.data?.status?.message ||
                    err.response.data?.message || // Use `message` if it's directly in `data`
                    "An error occurred";

                console.error("API Error:", err.response.data);

                if (status === 404) {
                    setError("User not found. Please check your username.");
                } else if (status === 401) {
                    setError("Incorrect password. Please try again.");
                } else {
                    setError(message);
                }
            } else {
                console.error("Unexpected error:", err);
                setError("Unable to connect to the server. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
            <div
                className="card p-4 shadow-lg"
                style={{ width: "400px", borderRadius: "10px" }}
            >
                <h2 className="text-center mb-3">Login</h2>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-danger text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    {/* Username Field */}
                    <div className="mb-3">
                        <label
                            htmlFor="username"
                            className="form-label fw-bold"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            className="form-control"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password Field with Toggle */}
                    <div className="mb-3">
                        <label
                            htmlFor="password"
                            className="form-label fw-bold"
                        >
                            Password
                        </label>
                        <div className="input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i
                                    className={`bi ${
                                        showPassword ? "bi-eye-slash" : "bi-eye"
                                    }`}
                                ></i>
                            </button>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Logging in...
                            </>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
