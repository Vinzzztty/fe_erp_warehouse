"use client";

import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
    const [currentTime, setCurrentTime] = useState("");
    const [loading, setLoading] = useState(true);

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
                        {/* Sidebar (Always Open) */}
                        <nav
                            className="bg-dark text-white d-flex flex-column"
                            style={{
                                width: "250px",
                                position: "fixed",
                                height: "100vh",
                                zIndex: 1030,
                            }}
                        >
                            {/* Sidebar Content */}
                            <div className="p-3">
                                <h3 className="d-none d-md-block">
                                    ERP Warehouse
                                </h3>
                                <hr />
                                <ul
                                    className="nav flex-column"
                                    style={{
                                        listStyle: "none",
                                        paddingLeft: 0,
                                        margin: 0,
                                    }}
                                >
                                    <SidebarItem
                                        href="/"
                                        icon="bi-house-fill"
                                        label="Dashboard"
                                    />

                                    <SidebarDropdown
                                        label="Master"
                                        icon="bi-folder"
                                    >
                                        <SidebarItem
                                            href="/master/business"
                                            icon="bi-building"
                                            label="Business"
                                        />
                                        <SidebarItem
                                            href="/master/product_dashboard"
                                            icon="bi-box"
                                            label="Product"
                                        />
                                        <SidebarItem
                                            href="/master/warehouse"
                                            icon="bi-geo-alt"
                                            label="Warehouse"
                                        />
                                        <SidebarItem
                                            href="/master/finance"
                                            icon="bi-wallet2"
                                            label="Finance"
                                        />
                                        <SidebarItem
                                            href="/master/wilayah"
                                            icon="bi-map"
                                            label="Wilayah"
                                        />
                                    </SidebarDropdown>
                                    <hr />

                                    <SidebarDropdown
                                        label="Transaction"
                                        icon="bi-folder"
                                    >
                                        <SidebarItem
                                            href="/transaction/po"
                                            icon="bi-file-earmark-text"
                                            label="Purchase Order"
                                        />
                                        <SidebarItem
                                            href="/transaction/pi"
                                            icon="bi-receipt"
                                            label="Proforma Invoice"
                                        />
                                        <SidebarItem
                                            href="/transaction/pi-payment"
                                            icon="bi-cash-coin"
                                            label="PI Payment"
                                        />
                                        <SidebarItem
                                            href="/transaction/cx-quotaton"
                                            icon="bi-chat-quote"
                                            label="CX Quotation"
                                        />
                                        <SidebarItem
                                            href="/transaction/cx-invoice"
                                            icon="bi-file-earmark-check"
                                            label="CX Invoice"
                                        />
                                        <SidebarItem
                                            href="/transaction/last-mile"
                                            icon="bi-truck"
                                            label="Last Mile"
                                        />
                                        <SidebarItem
                                            href="/transaction/goods-receipt"
                                            icon="bi-receipt-cutoff"
                                            label="Goods Receipt"
                                        />
                                    </SidebarDropdown>
                                    <hr />

                                    <SidebarItem
                                        href="/pricing"
                                        icon="bi-currency-dollar"
                                        label="Product Pricing"
                                    />
                                    <hr />

                                    <SidebarItem
                                        href="/logout"
                                        icon="bi-box-arrow-right"
                                        label="Logout"
                                        onClick={() => {
                                            localStorage.removeItem(
                                                "authToken"
                                            );
                                            router.push("/login");
                                        }}
                                    />
                                    <hr />
                                </ul>
                            </div>
                        </nav>

                        {/* Main Content Area */}
                        <div
                            className="flex-grow-1"
                            style={{
                                marginLeft: "250px", // Always leave space for sidebar
                                transition: "margin-left 0.3s",
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

/** SidebarItem Component */
function SidebarItem({
    href,
    icon,
    label,
    onClick,
}: {
    href: string;
    icon: string;
    label: string;
    onClick?: () => void;
}) {
    const pathname = usePathname(); // Get current page path
    const isActive = pathname === href; // Check if the link is active

    return (
        <li className="nav-item">
            <a
                className={`nav-link d-flex align-items-center sidebar-item ${
                    isActive ? "active-link" : "text-white"
                }`}
                href={href}
                onClick={onClick}
                style={{
                    padding: "10px",
                    borderRadius: "8px",
                    backgroundColor: isActive ? "#0d6efd" : "transparent", // Change background if active
                    color: isActive ? "#ffffff" : "inherit", // Ensure text contrast
                    fontWeight: isActive ? "bold" : "normal", // Make active link bold
                }}
            >
                <i className={`bi ${icon} me-2`}></i>
                <span>{label}</span>
            </a>
        </li>
    );
}

/** SidebarDropdown Component */
function SidebarDropdown({
    label,
    icon,
    children,
}: {
    label: string;
    icon: string;
    children: React.ReactNode;
}) {
    return (
        <li className="nav-item">
            <button
                className="btn btn-dark w-100 text-start d-flex align-items-center sidebar-dropdown"
                style={{ background: "none", border: "none", padding: "10px" }}
            >
                <i className={`bi ${icon} me-2`}></i>
                {label}
            </button>
            <ul className="nav flex-column ms-3">{children}</ul>
        </li>
    );
}
