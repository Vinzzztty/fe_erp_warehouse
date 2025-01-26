"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BusinessPage() {
    const router = useRouter();

    const [companies, setCompanies] = useState([]);
    const [stores, setStores] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [forwarders, setForwarders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [companiesRes, storesRes, suppliersRes, forwardersRes] =
                    await Promise.all([
                        fetch(
                            `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/companies`
                        ),
                        fetch(
                            `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/stores`
                        ),
                        fetch(
                            `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/suppliers`
                        ),
                        fetch(
                            `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/forwarders`
                        ),
                    ]);
                if (
                    !companiesRes.ok ||
                    !storesRes.ok ||
                    !suppliersRes.ok ||
                    !forwardersRes.ok
                ) {
                    throw new Error("Failed to fetch data");
                }

                const [
                    companiesData,
                    storesData,
                    suppliersData,
                    forwardersData,
                ] = await Promise.all([
                    companiesRes.json(),
                    storesRes.json(),
                    suppliersRes.json(),
                    forwardersRes.json(),
                ]);

                setCompanies(companiesData?.data || []);
                setStores(storesData?.data || []);
                setSuppliers(suppliersData?.data || []);
                setForwarders(forwardersData?.data || []);
            } catch (error: any) {
                setErrorMessage(
                    error.message || "An unexpected error occurred."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDelete = async (endpoint: string, id: number) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/${endpoint}/${id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete item.");
            }

            // Refresh the data after deletion
            const fetchData = async () => {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/${endpoint}`
                );
                const data = await res.json();
                return data?.data || [];
            };

            if (endpoint === "companies") setCompanies(await fetchData());
            if (endpoint === "stores") setStores(await fetchData());
            if (endpoint === "suppliers") setSuppliers(await fetchData());
            if (endpoint === "forwarders") setForwarders(await fetchData());
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    return (
        <div className="container mt-4">
            <h1>
                <i className="bi bi-building me-2"></i> Business
            </h1>
            <p>View and manage your business-related data here.</p>
            {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
            )}

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
            {/* Data Tables */}
            {loading ? (
                <p className="text-center mt-5">Loading data.....</p>
            ) : (
                <>
                    {/* Comapanies Table */}
                    <div className="mt-5">
                        <h2>Companies</h2>
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Notes</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
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
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() =>
                                                    router.push(
                                                        `/master/business/company/edit/${company.Code}`
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() =>
                                                    handleDelete(
                                                        "companies",
                                                        company.Code
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-5">
                        <h2>Suppliers</h2>
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Address</th>
                                    <th>City</th>
                                    <th>Province</th>
                                    <th>Country</th>
                                    <th>Notes</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {suppliers.map((supplier: any) => (
                                    <tr key={supplier.Code}>
                                        <td>{supplier.Code}</td>
                                        <td>{supplier.Name}</td>
                                        <td>{supplier.Address}</td>
                                        <td>{supplier.City?.Name || "N/A"}</td>
                                        <td>
                                            {supplier.Province?.Name || "N/A"}
                                        </td>
                                        <td>
                                            {supplier.Country?.Name || "N/A"}
                                        </td>
                                        <td>{supplier.Notes || "N/A"}</td>
                                        <td>{supplier.Status}</td>
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() =>
                                                    router.push(
                                                        `/master/business/supplier/edit/${supplier.Code}`
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() =>
                                                    handleDelete(
                                                        "suppliers",
                                                        supplier.Code
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-5">
                        <h2>Forwarders</h2>
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Notes</th>
                                    <th>Country</th>
                                    <th>Address</th>
                                    <th>Status</th>
                                    <th>Contact Method</th>
                                    <th>Website</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {forwarders.map((forwarder: any) => (
                                    <tr key={forwarder.Code}>
                                        <td>{forwarder.Code}</td>
                                        <td>{forwarder.Name}</td>
                                        <td>{forwarder.Notes || "N/A"}</td>
                                        <td>
                                            {forwarder.Country?.Name || "N/A"}
                                        </td>
                                        <td>
                                            {forwarder.AddressIndonesia ||
                                                "N/A"}
                                        </td>
                                        <td>{forwarder.Status}</td>
                                        <td>{forwarder.ContactMethod}</td>
                                        <td>
                                            <a
                                                href={forwarder.Website}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                {forwarder.Website}
                                            </a>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() =>
                                                    router.push(
                                                        `/master/business/forwarder/edit/${forwarder.Code}`
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() =>
                                                    handleDelete(
                                                        "forwarders",
                                                        forwarder.Code
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-5">
                        <h2>Stores</h2>
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Notes</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
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
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() =>
                                                    router.push(
                                                        `/master/business/store/edit/${store.Code}`
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() =>
                                                    handleDelete(
                                                        "stores",
                                                        store.Code
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
