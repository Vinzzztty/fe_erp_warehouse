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
        <div className="container-fluid mt-4">
            <div className="text-center card shadow-lg p-4 rounded">
                <h1>
                    <i className="bi bi-building me-2"></i> Business
                </h1>
                <p>View and manage your business-related data here.</p>
                {errorMessage && (
                    <div className="alert alert-danger">{errorMessage}</div>
                )}
            </div>

            <div className="row mt-4">
                {[
                    {
                        title: "Supplier",
                        icon: "bi-people",
                        link: "/master/business/supplier",
                        description:
                            "Manage your suppliers and related details.",
                    },
                    {
                        title: "Forwarder",
                        icon: "bi-truck",
                        link: "/master/business/forwarder",
                        description: "Manage your forwarders for shipments.",
                    },
                    {
                        title: "Company",
                        icon: "bi-building",
                        link: "/master/business/company",
                        description: "View and edit company details.",
                    },
                    {
                        title: "Store",
                        icon: "bi-shop",
                        link: "/master/business/store",
                        description: "Manage your stores and locations.",
                    },
                ].map((item, index) => (
                    <div key={index} className="col-md-3">
                        <div className="card text-center shadow-sm p-3">
                            <div className="card-body">
                                <i
                                    className={`bi ${item.icon}`}
                                    style={{
                                        fontSize: "2rem",
                                        color: "#fffff",
                                    }}
                                ></i>
                                <h5 className="card-title mt-3">
                                    {item.title}
                                </h5>
                                <p className="card-text text-muted">
                                    {item.description}
                                </p>
                                <Link href={item.link}>
                                    <button className="btn btn-dark shadow">
                                        Go to {item.title}
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Data Tables */}
            {loading ? (
                <p className="text-center mt-5">Loading data.....</p>
            ) : (
                <>
                    {/* Comapanies Table */}
                    <div className="card shadow-lg p-4 rounded mt-4">
                        <p className="mb-4 fw-bold">Company</p>
                        {errorMessage && (
                            <div className="alert alert-danger">
                                {errorMessage}
                            </div>
                        )}

                        {loading ? (
                            <p className="text-center mt-5">
                                Loading company data...
                            </p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered table-hover align-middle text-center">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>No</th>
                                            <th>Name</th>
                                            <th>Notes</th>
                                            <th>Status</th>
                                            <th>Created At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {companies.map(
                                            (company: any, index: number) => (
                                                <tr
                                                    key={company.Code}
                                                    className="bg-white shadow-sm"
                                                >
                                                    <td className="fw-bold">
                                                        {index + 1}
                                                    </td>
                                                    <td>{company.Name}</td>
                                                    <td>
                                                        {company.Notes || "N/A"}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                company.Status ===
                                                                "Active"
                                                                    ? "bg-success"
                                                                    : "bg-secondary"
                                                            }`}
                                                        >
                                                            {company.Status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {new Date(
                                                            company.createdAt
                                                        ).toLocaleString()}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex justify-content-center gap-2">
                                                            <button
                                                                className="btn btn-warning btn-sm me-2"
                                                                onClick={() =>
                                                                    router.push(
                                                                        `/master/business/company/edit/${company.Code}`
                                                                    )
                                                                }
                                                            >
                                                                <i className="bi bi-pencil-square"></i>{" "}
                                                                Edit
                                                            </button>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() =>
                                                                    console.log(
                                                                        "Delete",
                                                                        company.Code
                                                                    )
                                                                }
                                                            >
                                                                <i className="bi bi-trash"></i>{" "}
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="card shadow-lg p-4 rounded mt-4">
                        <p className="mb-4 fw-bold">Supplier</p>

                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover align-middle text-center">
                                <thead className="table-dark">
                                    <tr>
                                        <th>No</th>
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
                                    {suppliers.map(
                                        (supplier: any, index: number) => (
                                            <tr key={supplier.Code}>
                                                <td className="fw-bold">
                                                    {index + 1}
                                                </td>
                                                <td>{supplier.Name}</td>
                                                <td>{supplier.Address}</td>
                                                <td>
                                                    {supplier.City?.Name ||
                                                        "N/A"}
                                                </td>
                                                <td>
                                                    {supplier.Province?.Name ||
                                                        "N/A"}
                                                </td>
                                                <td>
                                                    {supplier.Country?.Name ||
                                                        "N/A"}
                                                </td>
                                                <td>
                                                    {supplier.Notes || "N/A"}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge ${
                                                            supplier.Status ===
                                                            "Active"
                                                                ? "bg-success"
                                                                : "bg-secondary"
                                                        }`}
                                                    >
                                                        {supplier.Status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-warning btn-sm me-2"
                                                        onClick={() =>
                                                            router.push(
                                                                `/master/business/supplier/edit/${supplier.Code}`
                                                            )
                                                        }
                                                    >
                                                        <i className="bi bi-pencil-square"></i>{" "}
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
                                                        <i className="bi bi-trash"></i>{" "}
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="card shadow-lg p-4 rounded mt-4">
                        <p className="mb-4 fw-bold">Forwarders</p>
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover align-middle text-center">
                                <thead className="table-dark">
                                    <tr>
                                        <th>No</th>
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
                                    {forwarders.map(
                                        (forwarder: any, index: number) => (
                                            <tr key={forwarder.Code}>
                                                <td className="fw-bold">
                                                    {index + 1}
                                                </td>
                                                <td>{forwarder.Name}</td>
                                                <td>
                                                    {forwarder.Notes || "N/A"}
                                                </td>
                                                <td>
                                                    {forwarder.Country?.Name ||
                                                        "N/A"}
                                                </td>
                                                <td>
                                                    {forwarder.AddressIndonesia ||
                                                        "N/A"}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge ${
                                                            forwarder.Status ===
                                                            "Active"
                                                                ? "bg-success"
                                                                : "bg-secondary"
                                                        }`}
                                                    >
                                                        {forwarder.Status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {forwarder.ContactMethod}
                                                </td>
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
                                                        <i className="bi bi-pencil-square"></i>{" "}
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
                                                        <i className="bi bi-trash"></i>{" "}
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="card shadow-lg p-4 rounded mt-4">
                        <p className="mb-4 fw-bold">Stores</p>
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover align-middle text-center">
                                <thead className="table-dark">
                                    <tr>
                                        <th>No</th>
                                        <th>Name</th>
                                        <th>Notes</th>
                                        <th>Status</th>
                                        <th>Created At</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stores.map((store: any, index: number) => (
                                        <tr key={store.Code}>
                                            <td className="fw-bold">
                                                {index + 1}
                                            </td>
                                            <td>{store.Name}</td>
                                            <td>{store.Notes || "N/A"}</td>
                                            <td>
                                                <span
                                                    className={`badge ${
                                                        store.Status ===
                                                        "Active"
                                                            ? "bg-success"
                                                            : "bg-secondary"
                                                    }`}
                                                >
                                                    {store.Status}
                                                </span>
                                            </td>
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
                                                    <i className="bi bi-pencil-square"></i>{" "}
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
                                                    <i className="bi bi-trash"></i>{" "}
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
