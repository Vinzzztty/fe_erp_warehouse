"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WarehousePage() {
    const router = useRouter();

    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
                setWarehouses(data.data);
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
        } catch (error: any) {
            alert(error.message || "Failed to delete warehouse.");
        }
    };

    if (loading) {
        return <p>Loading warehouses...</p>;
    }

    if (errorMessage) {
        return <div className="alert alert-danger">{errorMessage}</div>;
    }

    return (
        <div className="container mt-4">
            <h1>Warehouse Dashboard</h1>
            <p>Manage your warehouses below.</p>

            {/* Add Warehouse Button */}
            <div className="mb-4">
                <button
                    className="btn btn-primary"
                    onClick={() => router.push("/master/warehouse/add")}
                >
                    Add Warehouse
                </button>
            </div>

            <div className="row">
                {warehouses.length === 0 && <p>No warehouses available.</p>}
                {warehouses.map((warehouse: any) => (
                    <div className="col-md-4 mb-4" key={warehouse.Code}>
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">{warehouse.Name}</h5>
                                <p className="card-text">
                                    <strong>Address:</strong>{" "}
                                    {warehouse.Address}
                                </p>
                                <p className="card-text">
                                    <strong>Notes:</strong>{" "}
                                    {warehouse.Notes || "N/A"}
                                </p>
                                <p className="card-text">
                                    <strong>Status:</strong> {warehouse.Status}
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
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() =>
                                            handleDelete(warehouse.Code)
                                        }
                                    >
                                        Delete
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
