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
    const [masterOpen, setMasterOpen] = useState(false);
    const [transactionOpen, setTransactionOpen] = useState(false);
    const [productPricingOpen, setProductPricingOpen] = useState(false);

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
                            className="bg-dark text-white d-flex flex-column"
                            style={{
                                width: isSidebarOpen ? "250px" : "60px",
                                position: "fixed",
                                height: "100vh",
                                zIndex: 1030,
                            }}
                        >
                            <div className="p-3">
                                <h3
                                    className={`${
                                        isSidebarOpen ? "" : "d-none"
                                    } d-none d-md-block`}
                                >
                                    ERP Warehouse
                                </h3>
                                <ul className="nav flex-column">
                                    {/* Dashboard */}
                                    <SidebarItem
                                        href="/"
                                        icon="bi-house-fill"
                                        label="Dashboard"
                                        isSidebarOpen={isSidebarOpen}
                                    />

                                    {/* Master Section */}
                                    <SidebarDropdown
                                        label="Master"
                                        icon="bi-folder"
                                        isOpen={masterOpen}
                                        toggleOpen={() =>
                                            setMasterOpen(!masterOpen)
                                        }
                                        isSidebarOpen={isSidebarOpen}
                                    >
                                        <SidebarItem
                                            href="/master/business"
                                            icon="bi-building"
                                            label="Business"
                                            isSidebarOpen={isSidebarOpen}
                                        />
                                        <SidebarItem
                                            href="/master/product_dashboard"
                                            icon="bi-box"
                                            label="Product"
                                            isSidebarOpen={isSidebarOpen}
                                        />
                                        <SidebarItem
                                            href="/master/warehouse"
                                            icon="bi-geo-alt"
                                            label="Warehouse"
                                            isSidebarOpen={isSidebarOpen}
                                        />
                                        <SidebarItem
                                            href="/master/finance"
                                            icon="bi-wallet2"
                                            label="Finance"
                                            isSidebarOpen={isSidebarOpen}
                                        />
                                        <SidebarItem
                                            href="/master/wilayah"
                                            icon="bi-map"
                                            label="Wilayah"
                                            isSidebarOpen={isSidebarOpen}
                                        />
                                    </SidebarDropdown>

                                    {/* Transaction Section */}
                                    <SidebarDropdown
                                        label="Transaction"
                                        icon="bi-folder"
                                        isOpen={transactionOpen}
                                        toggleOpen={() =>
                                            setTransactionOpen(!transactionOpen)
                                        }
                                        isSidebarOpen={isSidebarOpen}
                                    >
                                        <SidebarItem
                                            href="/transaction/po"
                                            icon="bi-file-earmark-text"
                                            label="Purchase Order"
                                            isSidebarOpen={isSidebarOpen}
                                        />
                                        <SidebarItem
                                            href="/transaction/pi"
                                            icon="bi-receipt"
                                            label="Proforma Invoice"
                                            isSidebarOpen={isSidebarOpen}
                                        />
                                        <SidebarItem
                                            href="/transaction/pi-payment"
                                            icon="bi-cash-coin"
                                            label="PI Payment"
                                            isSidebarOpen={isSidebarOpen}
                                        />
                                        <SidebarItem
                                            href="/transaction/cx-quotation"
                                            icon="bi-chat-quote"
                                            label="CX Quotation"
                                            isSidebarOpen={isSidebarOpen}
                                        />
                                        <SidebarItem
                                            href="/transaction/cx-invoice"
                                            icon="bi-file-earmark-check"
                                            label="CX Invoice"
                                            isSidebarOpen={isSidebarOpen}
                                        />
                                        <SidebarItem
                                            href="/transaction/last-mile"
                                            icon="bi-truck"
                                            label="Last Mile"
                                            isSidebarOpen={isSidebarOpen}
                                        />
                                        <SidebarItem
                                            href="/transaction/goods-receipt"
                                            icon="bi-receipt-cutoff"
                                            label="Goods Receipt"
                                            isSidebarOpen={isSidebarOpen}
                                        />
                                    </SidebarDropdown>

                                    {/* Product Pricing Section */}
                                    <SidebarDropdown
                                        label="Product Pricing"
                                        icon="bi-folder"
                                        isOpen={productPricingOpen}
                                        toggleOpen={() =>
                                            setProductPricingOpen(
                                                !productPricingOpen
                                            )
                                        }
                                        isSidebarOpen={isSidebarOpen}
                                    >
                                        <SidebarItem
                                            href="/pricing/buying-price"
                                            icon="bi-currency-dollar"
                                            label="Buying Price"
                                            isSidebarOpen={isSidebarOpen}
                                        />
                                        <SidebarItem
                                            href="/pricing/setting-price"
                                            icon="bi-tags"
                                            label="Setting Price"
                                            isSidebarOpen={isSidebarOpen}
                                        />
                                    </SidebarDropdown>

                                    {/* Logout */}
                                    <SidebarItem
                                        href="/logout"
                                        icon="bi-box-arrow-right"
                                        label="Logout"
                                        isSidebarOpen={isSidebarOpen}
                                        onClick={() => {
                                            localStorage.removeItem(
                                                "authToken"
                                            );
                                            router.push("/login");
                                        }}
                                    />
                                </ul>
                            </div>

                            {/* Toggle Sidebar Button */}
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
                                marginLeft: isSidebarOpen ? "250px" : "60px",
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
    isSidebarOpen,
    onClick,
}: {
    href: string;
    icon: string;
    label: string;
    isSidebarOpen: boolean;
    onClick?: () => void;
}) {
    return (
        <li className="nav-item">
            <a
                className="nav-link text-white d-flex align-items-center sidebar-item"
                href={href}
                onClick={onClick}
                style={{
                    padding: "10px",
                    borderRadius: "8px",
                }}
            >
                <i className={`bi ${icon} me-2`}></i>
                {isSidebarOpen && <span>{label}</span>}
            </a>
        </li>
    );
}

/** SidebarDropdown Component */
function SidebarDropdown({
    label,
    icon,
    isOpen,
    toggleOpen,
    isSidebarOpen,
    children,
}: {
    label: string;
    icon: string;
    isOpen: boolean;
    toggleOpen: () => void;
    isSidebarOpen: boolean;
    children: React.ReactNode;
}) {
    return (
        <li className="nav-item">
            <button
                className="btn btn-dark w-100 text-start d-flex align-items-center sidebar-dropdown"
                style={{
                    background: "none",
                    border: "none",
                    padding: "10px",
                    borderRadius: "8px",
                }}
                onClick={toggleOpen}
            >
                <i className={`bi ${icon} me-2`}></i>
                {isSidebarOpen && label}
                <i
                    className={`ms-auto bi ${
                        isOpen ? "bi-chevron-down" : "bi-chevron-right"
                    }`}
                />
            </button>
            {isOpen && (
                <ul
                    className="nav flex-column ms-3"
                    style={{
                        marginTop: "5px",
                    }}
                >
                    {children}
                </ul>
            )}
        </li>
    );
}
