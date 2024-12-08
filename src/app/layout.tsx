"use client";

import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
    const [currentTime, setCurrentTime] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const isLoginPage = pathname === "/login";

    useEffect(() => {
        const userLoggedIn = localStorage.getItem("authToken");
        if (!userLoggedIn && !isLoginPage) {
            router.push("/login");
        } else {
            setLoading(false);
        }
    }, [router, isLoginPage]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(
                `${now.getHours().toString().padStart(2, "0")}:${now
                    .getMinutes()
                    .toString()
                    .padStart(2, "0")} ${now
                    .getDate()
                    .toString()
                    .padStart(2, "0")}/${(now.getMonth() + 1)
                    .toString()
                    .padStart(2, "0")}/${now.getFullYear()}`
            );
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !isLoginPage) {
        return (
            <html lang="en">
                <body>
                    <div className="d-flex vh-100 justify-content-center align-items-center">
                        <h3>Loading...</h3>
                    </div>
                </body>
            </html>
        );
    }

    return (
        <html lang="en">
            <body>
                {isLoginPage ? (
                    children
                ) : (
                    <div className="d-flex vh-100">
                        {/* Sidebar */}
                        <nav
                            className={`bg-dark text-white d-flex flex-column`}
                            style={{
                                width: isSidebarOpen ? "250px" : "60px",
                                position: "fixed",
                                height: "100vh",
                                zIndex: 1030, // Ensure it overlays the content
                            }}
                        >
                            <div className="p-3">
                                <h3
                                    className={`${
                                        isSidebarOpen ? "" : "d-none"
                                    } d-none d-md-block`} // Hide title on small screens
                                >
                                    ERP Warehouse
                                </h3>
                                <ul className="nav flex-column">
                                    <li className="nav-item">
                                        <a
                                            className="nav-link text-white d-flex align-items-center"
                                            href="/"
                                        >
                                            <i className="bi bi-house-fill me-2"></i>
                                            <span
                                                className={`d-none d-md-block`}
                                            >
                                                {isSidebarOpen && "Dashboard"}
                                            </span>
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a
                                            className="nav-link text-white d-flex align-items-center"
                                            href="/inventory"
                                        >
                                            <i className="bi bi-box-seam me-2"></i>
                                            <span
                                                className={`d-none d-md-block`}
                                            >
                                                {isSidebarOpen && "Inventory"}
                                            </span>
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a
                                            className="nav-link text-white d-flex align-items-center"
                                            href="/orders"
                                        >
                                            <i className="bi bi-card-checklist me-2"></i>
                                            <span
                                                className={`d-none d-md-block`}
                                            >
                                                {isSidebarOpen && "Orders"}
                                            </span>
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a
                                            className="nav-link text-white d-flex align-items-center"
                                            href="/logout"
                                            onClick={() => {
                                                localStorage.removeItem(
                                                    "authToken"
                                                );
                                                router.push("/login");
                                            }}
                                        >
                                            <i className="bi bi-box-arrow-right me-2"></i>
                                            <span
                                                className={`d-none d-md-block`}
                                            >
                                                {isSidebarOpen && "Logout"}
                                            </span>
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Toggle Button */}
                            <button
                                className="btn btn-dark w-100 mt-auto"
                                onClick={() => setSidebarOpen(!isSidebarOpen)}
                                style={{
                                    zIndex: 1000,
                                    height: "50px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <i
                                    className={`bi ${
                                        isSidebarOpen
                                            ? "bi-chevron-left"
                                            : "bi-chevron-right"
                                    }`}
                                />
                            </button>
                        </nav>

                        {/* Main Content Area */}
                        <div
                            className={`flex-grow-1`}
                            style={{
                                marginLeft: isSidebarOpen ? "250px" : "60px", // Adjust content position based on sidebar state
                                transition: "margin-left 0.3s", // Smooth transition for responsiveness
                            }}
                        >
                            {/* Top Navbar */}
                            <nav className="navbar navbar-light bg-light px-3 d-flex justify-content-between">
                                <div className="navbar-brand mb-0">
                                    Hello, <strong>Admin</strong>
                                </div>
                                <div className="d-flex align-items-center">
                                    <span className="me-3">{currentTime}</span>
                                    <a
                                        href="/profile"
                                        className="btn btn-outline-primary btn-sm"
                                    >
                                        Profile
                                    </a>
                                </div>
                            </nav>
                            <main className="p-4">{children}</main>
                        </div>
                    </div>
                )}
            </body>
        </html>
    );
}
