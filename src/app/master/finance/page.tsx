"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function FinancePage() {
    const router = useRouter();

    // States for each entity
    const [banks, setBanks] = useState<any[]>([]);
    const [currencies, setCurrencies] = useState<any[]>([]);
    const [ppnSettings, setPpnSettings] = useState<any[]>([]);
    const [costs, setCosts] = useState<any[]>([]);
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

    // Fetch data for banks, currencies, ppn-settings, and costs
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [banksRes, currenciesRes, ppnRes, costsRes] =
                    await Promise.all([
                        fetch(
                            `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/banks`
                        ),
                        fetch(
                            `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/currencies`
                        ),
                        fetch(
                            `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/ppn-settings`
                        ),
                        fetch(
                            `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/costs`
                        ),
                    ]);

                if (
                    !banksRes.ok ||
                    !currenciesRes.ok ||
                    !ppnRes.ok ||
                    !costsRes.ok
                ) {
                    throw new Error("Failed to fetch data.");
                }

                const [banksData, currenciesData, ppnData, costsData] =
                    await Promise.all([
                        banksRes.json(),
                        currenciesRes.json(),
                        ppnRes.json(),
                        costsRes.json(),
                    ]);

                setBanks(
                    (banksData?.data || []).sort((a: any, b: any) =>
                        a.Status.localeCompare(b.Status)
                    )
                );
                setCurrencies(
                    (currenciesData?.data || []).sort((a: any, b: any) =>
                        a.Status.localeCompare(b.Status)
                    )
                );
                setPpnSettings(
                    (ppnData?.data || []).sort((a: any, b: any) =>
                        a.Status.localeCompare(b.Status)
                    )
                );
                setCosts(
                    (costsData?.data || []).sort((a: any, b: any) =>
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
            }, 1000);
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
                    <i className="bi bi-cash-stack me-2"></i> Finance
                </h1>
                <p>View and manage your finance-related data here.</p>
                {errorMessage && (
                    <div className="alert alert-danger">{errorMessage}</div>
                )}
                {deleteSuccessMessage && (
                    <div className="alert alert-success text-center">
                        {deleteSuccessMessage}
                    </div>
                )}
            </div>

            {/* Cards */}
            <div className="row mt-4">
                {[
                    {
                        title: "Bank",
                        icon: "bi-bank",
                        link: "/master/finance/bank",
                    },
                    {
                        title: "Currency",
                        icon: "bi-currency-exchange",
                        link: "/master/finance/currency",
                    },
                    {
                        title: "PPN Setting",
                        icon: "bi-file-text",
                        link: "/master/finance/ppn-setting",
                    },
                    {
                        title: "Cost",
                        icon: "bi-wallet",
                        link: "/master/finance/cost",
                    },
                ].map((item, idx) => (
                    <div className="col-md-3" key={idx}>
                        <div className="card text-center shadow-sm">
                            <div className="card-body">
                                <i
                                    className={`bi ${item.icon}`}
                                    style={{
                                        fontSize: "2rem",
                                        color: "#6c757d",
                                    }}
                                ></i>
                                <h5 className="card-title mt-3">
                                    {item.title}
                                </h5>
                                <Link href={item.link}>
                                    <button className="btn btn-dark">
                                        Add {item.title}
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Tables */}
            {loading ? (
                <p className="text-center mt-5">Loading data...</p>
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
                    {/* Banks Table */}
                    <div className="card shadow-lg p-4 rounded mt-4">
                        <p className="mb-4 fw-bold">Banks</p>
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover align-middle text-center">
                                <thead className="table-dark">
                                    <tr>
                                        <th>No</th>
                                        <th>Name</th>
                                        <th>Notes</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {banks.length > 0 ? (
                                        banks.map(
                                            (item: any, index: number) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.Name}</td>
                                                    <td>
                                                        {item.Notes || "N/A"}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                item.Status ===
                                                                "Active"
                                                                    ? "bg-success"
                                                                    : "bg-secondary"
                                                            }`}
                                                        >
                                                            {item.Status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-warning btn-sm me-2"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/master/finance/bank/edit/${item.Code}`
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
                                                                            "banks",
                                                                        id: item.Code,
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
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td colSpan={3}>
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Currencies Table */}
                    <div className="card shadow-lg p-4 rounded mt-4">
                        <p className="mb-4 fw-bold">Currencies</p>
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover align-middle text-center">
                                <thead className="table-dark">
                                    <tr>
                                        <th>No</th>
                                        <th>Name</th>
                                        <th>Notes</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currencies.length > 0 ? (
                                        currencies.map(
                                            (item: any, index: number) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.Name}</td>
                                                    <td>
                                                        {item.Notes || "N/A"}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                item.Status ===
                                                                "Active"
                                                                    ? "bg-success"
                                                                    : "bg-secondary"
                                                            }`}
                                                        >
                                                            {item.Status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-warning btn-sm me-2"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/master/finance/currency/edit/${item.Code}`
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
                                                                            "currencies",
                                                                        id: item.Code,
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
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td colSpan={3}>
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* PPN Settings Table */}
                    <div className="card shadow-lg p-4 rounded mt-4">
                        <p className="mb-4 fw-bold">PPN Settings</p>
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover align-middle text-center">
                                <thead className="table-dark">
                                    <tr>
                                        <th>No</th>
                                        <th>Name</th>
                                        <th>Rate</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ppnSettings.length > 0 ? (
                                        ppnSettings.map(
                                            (item: any, index: number) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.Name}</td>
                                                    <td>{item.Rate}</td>
                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                item.Status ===
                                                                "Active"
                                                                    ? "bg-success"
                                                                    : "bg-secondary"
                                                            }`}
                                                        >
                                                            {item.Status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-warning btn-sm me-2"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/master/finance/ppn-setting/edit/${item.id}`
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
                                                                            "ppn-settings",
                                                                        id: item.id,
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
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td colSpan={3}>
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Costs Table */}
                    <div className="card shadow-lg p-4 rounded mt-4">
                        <p className="mb-4 fw-bold">Costs</p>
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover align-middle text-center">
                                <thead className="table-dark">
                                    <tr>
                                        <th>No</th>
                                        <th>Name</th>
                                        <th>Percentage</th>
                                        <th>Notes</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {costs.length > 0 ? (
                                        costs.map(
                                            (item: any, index: number) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.Name}</td>
                                                    <td>{item.Percentage}</td>
                                                    <td>
                                                        {item.Notes || "N/A"}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                item.Status ===
                                                                "Active"
                                                                    ? "bg-success"
                                                                    : "bg-secondary"
                                                            }`}
                                                        >
                                                            {item.Status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-warning btn-sm me-2"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/master/finance/cost/edit/${item.Code}`
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
                                                                            "costs",
                                                                        id: item.Code,
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
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td colSpan={3}>
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
