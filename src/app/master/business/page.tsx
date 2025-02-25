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
    const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<
        string | null
    >(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{
        endpoint: string;
        id: number;
    } | null>(null);
    const [loadingDelete, setLoadingDelete] = useState(false); // Track deletion loading state

    const [supplierStartIndex, setSupplierStartIndex] = useState(0);
    const supplierPerPage = 5;
    const [ForwarderStartIndex, setForwarderStartIndex] = useState(0);
    const ForwarderItemsPerPage = 5;
    const [companyStartIndex, setcompanyStartIndex] = useState(0);
    const companyItemsPerPage = 5;
    const [storeStartIndex, setstoreStartIndex] = useState(0);
    const storeitemsPerPage = 5;

    // Get the current slice of Suppliers
    const displayedSuppliers = suppliers.slice(
        supplierStartIndex,
        supplierStartIndex + supplierPerPage
    );

    // Get the current slice of forwarders
    const displayedForwarders = forwarders.slice(
        ForwarderStartIndex,
        ForwarderStartIndex + ForwarderItemsPerPage
    );

    // Get the current slice of companies
    const displayedCompanies = companies.slice(
        companyStartIndex,
        companyStartIndex + companyItemsPerPage
    );

    // Get the current slice of stores
    const displayStores = stores.slice(
        storeStartIndex,
        storeStartIndex + storeitemsPerPage
    );

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

                setCompanies(
                    (companiesData?.data || []).sort((a: any, b: any) =>
                        a.Status.localeCompare(b.Status)
                    )
                );
                setStores(
                    (storesData?.data || []).sort((a: any, b: any) =>
                        a.Status.localeCompare(b.Status)
                    )
                );
                setSuppliers(
                    (suppliersData?.data || []).sort((a: any, b: any) =>
                        a.Status.localeCompare(b.Status)
                    )
                );
                setForwarders(
                    (forwardersData?.data || []).sort((a: any, b: any) =>
                        a.Status.localeCompare(b.Status)
                    )
                );
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

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return; // Ensure there is an item selected for deletion
        setLoadingDelete(true); // Show loading state

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/${itemToDelete.endpoint}/${itemToDelete.id}`,
                { method: "DELETE" }
            );

            console.log(response);

            if (!response.ok) {
                throw new Error("Failed to delete item.");
            }

            // Show success message inside modal
            setDeleteSuccessMessage("Item deleted successfully!");

            // Wait 3 seconds before reloading the page
            setTimeout(() => {
                window.location.reload(); // Reload the browser
            }, 2000);
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        } finally {
            setLoadingDelete(false); // Remove loading state
            setShowDeleteModal(false); // Hide modal
            setItemToDelete(null);
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
                {deleteSuccessMessage && (
                    <div className="alert alert-success text-center">
                        {deleteSuccessMessage}
                    </div>
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
                                        Add {item.title}
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
                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && (
                        <div
                            className="modal show d-block"
                            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                        >
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">
                                            Confirm Delete
                                        </h5>
                                        <button
                                            className="btn-close"
                                            onClick={() =>
                                                setShowDeleteModal(false)
                                            }
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        {deleteSuccessMessage ? (
                                            <div className="alert alert-success text-center">
                                                {deleteSuccessMessage}
                                            </div>
                                        ) : (
                                            <p>
                                                Are you sure you want to delete
                                                this item?
                                            </p>
                                        )}
                                    </div>
                                    <div className="modal-footer">
                                        {!deleteSuccessMessage && (
                                            <>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() =>
                                                        setShowDeleteModal(
                                                            false
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={
                                                        handleConfirmDelete
                                                    }
                                                    disabled={loadingDelete}
                                                >
                                                    {loadingDelete ? (
                                                        <span className="spinner-border spinner-border-sm"></span>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-trash"></i>{" "}
                                                            Confirm Delete
                                                        </>
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Supplier Table */}
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
                                    {displayedSuppliers.map(
                                        (supplier: any, index: number) => (
                                            <tr key={supplier.Code}>
                                                <td className="fw-bold">
                                                    {supplierStartIndex +
                                                        index +
                                                        1}
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
                                                        onClick={() => {
                                                            setItemToDelete({
                                                                endpoint:
                                                                    "suppliers",
                                                                id: supplier.Code,
                                                            });
                                                            setShowDeleteModal(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        <i className="bi bi-trash"></i>{" "}
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )}

                                    {/* Fill empty rows to maintain table structure */}
                                    {displayedSuppliers.length <
                                        supplierPerPage &&
                                        [
                                            ...Array(
                                                supplierPerPage -
                                                    displayedSuppliers.length
                                            ),
                                        ].map((_, i) => (
                                            <tr
                                                key={`empty-supplier-${i}`}
                                                style={{ height: "60px" }}
                                            >
                                                <td colSpan={9}></td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <button
                                className="btn btn-outline-dark"
                                disabled={supplierStartIndex === 0}
                                onClick={() =>
                                    setSupplierStartIndex((prev) =>
                                        Math.max(prev - supplierPerPage, 0)
                                    )
                                }
                            >
                                <i className="bi bi-arrow-left"></i> Previous
                            </button>

                            <span className="fw-bold">
                                Page{" "}
                                {Math.floor(
                                    supplierStartIndex / supplierPerPage
                                ) + 1}{" "}
                                of{" "}
                                {Math.ceil(suppliers.length / supplierPerPage)}
                            </span>

                            <button
                                className="btn btn-outline-dark"
                                disabled={
                                    supplierStartIndex + supplierPerPage >=
                                    suppliers.length
                                }
                                onClick={() =>
                                    setSupplierStartIndex(
                                        (prev) => prev + supplierPerPage
                                    )
                                }
                            >
                                Next <i className="bi bi-arrow-right"></i>
                            </button>
                        </div>
                    </div>

                    {/* Forwarders Table */}
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
                                    {displayedForwarders.map(
                                        (forwarder: any, index: number) => (
                                            <tr key={forwarder.Code}>
                                                <td className="fw-bold">
                                                    {ForwarderStartIndex +
                                                        index +
                                                        1}
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
                                                        onClick={() => {
                                                            setItemToDelete({
                                                                endpoint:
                                                                    "forwarders",
                                                                id: forwarder.Code,
                                                            });
                                                            setShowDeleteModal(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        <i className="bi bi-trash"></i>{" "}
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )}

                                    {/* Fill empty rows to maintain table structure */}
                                    {displayedForwarders.length <
                                        ForwarderItemsPerPage &&
                                        [
                                            ...Array(
                                                ForwarderItemsPerPage -
                                                    displayedForwarders.length
                                            ),
                                        ].map((_, i) => (
                                            <tr
                                                key={`empty-forwarder-${i}`}
                                                style={{ height: "60px" }}
                                            >
                                                <td colSpan={9}></td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <button
                                className="btn btn-outline-dark"
                                disabled={ForwarderStartIndex === 0}
                                onClick={() =>
                                    setForwarderStartIndex((prev) =>
                                        Math.max(
                                            prev - ForwarderItemsPerPage,
                                            0
                                        )
                                    )
                                }
                            >
                                <i className="bi bi-arrow-left"></i> Previous
                            </button>

                            <span className="fw-bold">
                                Page{" "}
                                {Math.floor(
                                    ForwarderStartIndex / ForwarderItemsPerPage
                                ) + 1}{" "}
                                of{" "}
                                {Math.ceil(
                                    forwarders.length / ForwarderItemsPerPage
                                )}
                            </span>

                            <button
                                className="btn btn-outline-dark"
                                disabled={
                                    ForwarderStartIndex +
                                        ForwarderItemsPerPage >=
                                    forwarders.length
                                }
                                onClick={() =>
                                    setForwarderStartIndex(
                                        (prev) => prev + ForwarderItemsPerPage
                                    )
                                }
                            >
                                Next <i className="bi bi-arrow-right"></i>
                            </button>
                        </div>
                    </div>

                    {/* Companies Table */}
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
                            <>
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
                                            {displayedCompanies.map(
                                                (
                                                    company: any,
                                                    index: number
                                                ) => (
                                                    <tr
                                                        key={company.Code}
                                                        className="bg-white shadow-sm"
                                                    >
                                                        <td className="fw-bold">
                                                            {companyStartIndex +
                                                                index +
                                                                1}
                                                        </td>
                                                        <td>{company.Name}</td>
                                                        <td>
                                                            {company.Notes ||
                                                                "N/A"}
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
                                                                    onClick={() => {
                                                                        setItemToDelete(
                                                                            {
                                                                                endpoint:
                                                                                    "companies",
                                                                                id: company.Code,
                                                                            }
                                                                        );
                                                                        setShowDeleteModal(
                                                                            true
                                                                        );
                                                                    }}
                                                                >
                                                                    <i className="bi bi-trash"></i>{" "}
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            )}

                                            {/* Fill empty rows to maintain table structure */}
                                            {displayedCompanies.length <
                                                companyItemsPerPage &&
                                                [
                                                    ...Array(
                                                        companyItemsPerPage -
                                                            displayedCompanies.length
                                                    ),
                                                ].map((_, i) => (
                                                    <tr
                                                        key={`empty-company-${i}`}
                                                        style={{
                                                            height: "60px",
                                                        }}
                                                    >
                                                        <td colSpan={6}></td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Controls */}
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <button
                                        className="btn btn-outline-dark"
                                        disabled={companyStartIndex === 0}
                                        onClick={() =>
                                            setcompanyStartIndex((prev) =>
                                                Math.max(
                                                    prev - companyItemsPerPage,
                                                    0
                                                )
                                            )
                                        }
                                    >
                                        <i className="bi bi-arrow-left"></i>{" "}
                                        Previous
                                    </button>

                                    <span className="fw-bold">
                                        Page{" "}
                                        {Math.floor(
                                            companyStartIndex /
                                                companyItemsPerPage
                                        ) + 1}{" "}
                                        of{" "}
                                        {Math.ceil(
                                            companies.length /
                                                companyItemsPerPage
                                        )}
                                    </span>

                                    <button
                                        className="btn btn-outline-dark"
                                        disabled={
                                            companyStartIndex +
                                                companyItemsPerPage >=
                                            companies.length
                                        }
                                        onClick={() =>
                                            setcompanyStartIndex(
                                                (prev) =>
                                                    prev + companyItemsPerPage
                                            )
                                        }
                                    >
                                        Next{" "}
                                        <i className="bi bi-arrow-right"></i>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Stores */}
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
                                    {displayStores.map(
                                        (store: any, index: number) => (
                                            <tr key={store.Code}>
                                                <td className="fw-bold">
                                                    {storeStartIndex +
                                                        index +
                                                        1}
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
                                                        onClick={() => {
                                                            setItemToDelete({
                                                                endpoint:
                                                                    "stores",
                                                                id: store.Code,
                                                            });
                                                            setShowDeleteModal(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        <i className="bi bi-trash"></i>{" "}
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )}

                                    {/* Fill empty rows to maintain table structure */}
                                    {displayStores.length < storeitemsPerPage &&
                                        [
                                            ...Array(
                                                storeitemsPerPage -
                                                    displayStores.length
                                            ),
                                        ].map((_, i) => (
                                            <tr
                                                key={`empty-store-${i}`}
                                                style={{
                                                    height: "60px",
                                                }}
                                            >
                                                <td colSpan={6}></td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <button
                                className="btn btn-outline-dark"
                                disabled={storeStartIndex === 0}
                                onClick={() =>
                                    setstoreStartIndex((prev) =>
                                        Math.max(prev - storeitemsPerPage, 0)
                                    )
                                }
                            >
                                <i className="bi bi-arrow-left"></i> Previous
                            </button>

                            <span className="fw-bold">
                                Page{" "}
                                {Math.floor(
                                    storeStartIndex / storeitemsPerPage
                                ) + 1}{" "}
                                of{" "}
                                {Math.ceil(stores.length / storeitemsPerPage)}
                            </span>

                            <button
                                className="btn btn-outline-dark"
                                disabled={
                                    storeStartIndex + storeitemsPerPage >=
                                    stores.length
                                }
                                onClick={() =>
                                    setstoreStartIndex(
                                        (prev) => prev + storeitemsPerPage
                                    )
                                }
                            >
                                Next <i className="bi bi-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
