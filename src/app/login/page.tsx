"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api"; // Import the Axios instance

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Make API request
            console.log("Sending request to /auth/login");
            const response = await api.post("/api/auth/login", {
                username,
                password,
            });
            console.log(response);
            console.log("Response:", response.data);

            // Save the token in localStorage
            const { token } = response.data;
            localStorage.setItem("authToken", token);

            // Redirect to the dashboard
            router.push("/");
        } catch (err: any) {
            // Handle errors based on API response
            if (err.response) {
                const status = err.response.status;
                const message = err.response.data.status.message;

                console.log(message);
                console.error("Error:", err);

                if (status === 404) {
                    setError("User not found. Please check your username.");
                } else if (status === 401) {
                    setError("Incorrect password. Please try again.");
                } else {
                    setError(message || "An error occurred during login.");
                }
            } else {
                setError("Unable to connect to the server. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex vh-100 justify-content-center align-items-center">
            <div className="card p-4" style={{ width: "400px" }}>
                <h2 className="text-center mb-3">Login</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}
