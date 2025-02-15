"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WarehousePage() {
    const router = useRouter();

    const [warehouses, setWarehouses] = useState([]);
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
    // Fetch warehouses
    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/warehouses`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch warehouses.");
                }
                const data = await response.json();
                setWarehouses(
                    data.data.sort((a: any, b: any) =>
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

        fetchWarehouses();
    }, []);

    // Delete a warehouse
    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/warehouses/${id}`,
                {
                    method: "DELETE",
                }
            );
            if (!response.ok) {
                throw new Error("Failed to delete warehouse.");
            }

            // Refresh warehouses after deletion
            setWarehouses((prev) =>
                prev.filter((warehouse: any) => warehouse.Code !== id)
            );

            // Show success message
            setDeleteSuccessMessage("Item deleted successfully!");

            // Hide the message after 3 seconds
            setTimeout(() => setDeleteSuccessMessage(null), 3000);
        } catch (error: any) {
            alert(error.message || "Failed to delete warehouse.");
        }
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return; // Ensure there is an item selected for deletion
        setLoadingDelete(true); // Show loading state

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/${itemToDelete.endpoint}/${itemToDelete.id}`,
                { method: "DELETE" }
            );

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

    if (loading) {
        return <p>Loading warehouses...</p>;
    }

    if (errorMessage) {
        return <div className="alert alert-danger">{errorMessage}</div>;
    }

    return (
        <div className="container-fluid mt-4">
            <div className="text-center card shadow-lg p-4 rounded">
                <h1>
                    <i className="bi-geo-alt me-2"></i> Warehouse Dashboard
                </h1>
                <p>Manage your warehouses below.</p>
                {errorMessage && (
                    <div className="alert alert-danger">{errorMessage}</div>
                )}
                {deleteSuccessMessage && (
                    <div className="alert alert-success text-center">
                        {deleteSuccessMessage}
                    </div>
                )}
                {/* Add Warehouse Button */}
                <div className="mb-4">
                    <button
                        className="btn btn-dark"
                        onClick={() => router.push("/master/warehouse/add")}
                    >
                        Add Warehouse
                    </button>
                </div>
            </div>

            <div className="row mt-4">
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
                                            Are you sure you want to delete this
                                            item?
                                        </p>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    {!deleteSuccessMessage && (
                                        <>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() =>
                                                    setShowDeleteModal(false)
                                                }
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                onClick={handleConfirmDelete}
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
                {warehouses.length === 0 && <p>No warehouses available.</p>}
                {warehouses.map((warehouse: any) => (
                    <div className="col-md-4 mb-4" key={warehouse.Code}>
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">
                                    <i className="bi bi-truck me-2"></i>
                                    {warehouse.Name}
                                </h5>
                                <p className="card-text">
                                    <strong>Address:</strong>{" "}
                                    {warehouse.Address}
                                </p>
                                <p className="card-text">
                                    <strong>Notes:</strong>{" "}
                                    {warehouse.Notes || "N/A"}
                                </p>
                                <p className="card-text">
                                    <strong>Status:</strong>{" "}
                                    <span
                                        className={`badge ${
                                            warehouse.Status === "Active"
                                                ? "bg-success"
                                                : "bg-secondary"
                                        }`}
                                    >
                                        {warehouse.Status}
                                    </span>
                                </p>
                                <div className="d-flex justify-content-between">
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() =>
                                            router.push(
                                                `/master/warehouse/edit/${warehouse.Code}`
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
                                                endpoint: "warehouses",
                                                id: warehouse.Code,
                                            });
                                            setShowDeleteModal(true);
                                        }}
                                    >
                                        <i className="bi bi-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
