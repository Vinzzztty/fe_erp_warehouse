"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BusinessPage() {
    const [companies, setCompanies] = useState([]);
    const [stores, setStores] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [loadingStores, setLoadingStores] = useState(false);
    const [errorCompanies, setErrorCompanies] = useState<string | null>(null);
    const [errorStores, setErrorStores] = useState<string | null>(null);

    useEffect(() => {
        // Fetch Companies
        const fetchCompanies = async () => {
            setLoadingCompanies(true);
            setErrorCompanies(null);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/companies`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch companies.");
                }
                const data = await response.json();
                if (data.status.code !== 200) {
                    throw new Error(
                        data.status.message || "Failed to fetch companies."
                    );
                }
                setCompanies(data.data);
            } catch (error: any) {
                setErrorCompanies(
                    error.message || "An unexpected error occurred."
                );
            } finally {
                setLoadingCompanies(false);
            }
        };

        // Fetch Stores
        const fetchStores = async () => {
            setLoadingStores(true);
            setErrorStores(null);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/stores`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch stores.");
                }
                const data = await response.json();
                if (data.status.code !== 200) {
                    throw new Error(
                        data.status.message || "Failed to fetch stores."
                    );
                }
                setStores(data.data);
            } catch (error: any) {
                setErrorStores(
                    error.message || "An unexpected error occurred."
                );
            } finally {
                setLoadingStores(false);
            }
        };

        fetchCompanies();
        fetchStores();
    }, []);

    return (
        <div className="container mt-4">
            <h1>
                <i className="bi bi-building me-2"></i> Business
            </h1>
            <p>View and manage your business-related data here.</p>

            <div className="row mt-4">
                {/* Supplier */}
                <div className="col-md-3">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <i
                                className="bi bi-people"
                                style={{ fontSize: "2rem", color: "#6c757d" }}
                            ></i>
                            <h5 className="card-title mt-3">Supplier</h5>
                            <p className="card-text">
                                Manage your suppliers and related details.
                            </p>
                            <Link href="/master/business/supplier">
                                <button className="btn btn-primary">
                                    Go to Supplier
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Forwarder */}
                <div className="col-md-3">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <i
                                className="bi bi-truck"
                                style={{ fontSize: "2rem", color: "#6c757d" }}
                            ></i>
                            <h5 className="card-title mt-3">Forwarder</h5>
                            <p className="card-text">
                                Manage your forwarders for shipments.
                            </p>
                            <Link href="/master/business/forwarder">
                                <button className="btn btn-primary">
                                    Go to Forwarder
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Company */}
                <div className="col-md-3">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <i
                                className="bi bi-building"
                                style={{ fontSize: "2rem", color: "#6c757d" }}
                            ></i>
                            <h5 className="card-title mt-3">Company</h5>
                            <p className="card-text">
                                View and edit company details.
                            </p>
                            <Link href="/master/business/company">
                                <button className="btn btn-primary">
                                    Go to Company
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Store */}
                <div className="col-md-3">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <i
                                className="bi bi-shop"
                                style={{ fontSize: "2rem", color: "#6c757d" }}
                            ></i>
                            <h5 className="card-title mt-3">Store</h5>
                            <p className="card-text">
                                Manage your stores and locations.
                            </p>
                            <Link href="/master/business/store">
                                <button className="btn btn-primary">
                                    Go to Store
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Companies List */}
            <div className="mt-5">
                <h2>Companies</h2>
                {loadingCompanies && <p>Loading companies...</p>}
                {errorCompanies && (
                    <p className="text-danger">{errorCompanies}</p>
                )}
                {!loadingCompanies &&
                    !errorCompanies &&
                    companies.length === 0 && <p>No companies found.</p>}
                {!loadingCompanies &&
                    !errorCompanies &&
                    companies.length > 0 && (
                        <table className="table table-bordered mt-3">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Notes</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.map((company: any) => (
                                    <tr key={company.Code}>
                                        <td>{company.Code}</td>
                                        <td>{company.Name}</td>
                                        <td>{company.Notes || "N/A"}</td>
                                        <td>{company.Status}</td>
                                        <td>
                                            {new Date(
                                                company.createdAt
                                            ).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
            </div>

            {/* Stores List */}
            <div className="mt-5">
                <h2>Stores</h2>
                {loadingStores && <p>Loading stores...</p>}
                {errorStores && <p className="text-danger">{errorStores}</p>}
                {!loadingStores && !errorStores && stores.length === 0 && (
                    <p>No stores found.</p>
                )}
                {!loadingStores && !errorStores && stores.length > 0 && (
                    <table className="table table-bordered mt-3">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Notes</th>
                                <th>Status</th>
                                <th>Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stores.map((store: any) => (
                                <tr key={store.Code}>
                                    <td>{store.Code}</td>
                                    <td>{store.Name}</td>
                                    <td>{store.Notes || "N/A"}</td>
                                    <td>{store.Status}</td>
                                    <td>
                                        {new Date(
                                            store.createdAt
                                        ).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
