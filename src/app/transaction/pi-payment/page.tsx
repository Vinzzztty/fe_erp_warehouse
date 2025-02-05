"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function POPage() {
    const [Invoice, setInvoice] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [errorCompanies, setErrorCompanies] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Fetch Companies
        const fetchCompanies = async () => {
            setLoadingCompanies(true);
            setErrorCompanies(null);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/pi-payments`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch PI.");
                }
                const data = await response.json();
                if (data.status.code !== 200) {
                    throw new Error(
                        data.status.message || "Failed to fetch PI."
                    );
                }
                setInvoice(data.data);
                console.log("Fetched Proforma Invoice:", data.data);
            } catch (error: any) {
                setErrorCompanies(
                    error.message || "An unexpected error occurred."
                );
            } finally {
                setLoadingCompanies(false);
            }
        };

        // Fetch Stores

        fetchCompanies();
    }, []);
    const handleEdit = (id: string) => {
        router.push(`/transaction/pi-payment/editpipayment?id=${id}`);
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = confirm(
            "Are you sure you want to delete this proforma invoice?"
        );
        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/pi-payments/${id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to delete purchase order."
                );
            }

            // Update state to remove deleted item
            setInvoice((prev) =>
                prev.filter((purchase: any) => purchase.Code !== id)
            );
            alert("Purchase order deleted successfully.");
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    return (
        <div className="container-fluid mt-4">
            <div className="text-center card shadow-lg p-4 rounded">
                <h1>
                    <i className="bi bi-building me-2"></i> Proformal Invoice
                    Payment
                </h1>
                <p>View and manage your orders here.</p>
                <Link href="/transaction/pi-payment/addpipayment">
                    <button className="btn btn-dark">Go to PI-Payment</button>
                </Link>
            </div>

            <div className="card shadow-lg p-4 rounded mt-4">
                <h2>Proforma Invoice Payment</h2>
                {loadingCompanies && <p>Loading PI-Payments...</p>}
                {errorCompanies && (
                    <p className="text-danger">{errorCompanies}</p>
                )}
                {!loadingCompanies &&
                    !errorCompanies &&
                    Invoice.length === 0 && <p>No PIs found.</p>}
                {!loadingCompanies && !errorCompanies && Invoice.length > 0 && (
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered table-hover align-middle text-center">
                            <thead className="table-dark">
                                <tr>
                                    <th>No</th>
                                    <th>Date</th>
                                    <th>Supplier Id</th>
                                    <th>Notes</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Invoice.map((purchase: any, index: number) => (
                                    <tr key={purchase.Code}>
                                        <td className="fw-bold">{index + 1}</td>
                                        <td>{purchase.Date}</td>
                                        <td>{purchase.Supplier.Name}</td>
                                        <td>{purchase.Notes || "N/A"}</td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    [
                                                        "Completed",
                                                        "Paid",
                                                        "Arrived",
                                                        "Shipped",
                                                    ].includes(purchase.Status)
                                                        ? "bg-success"
                                                        : "bg-secondary"
                                                }`}
                                            >
                                                {purchase.Status}
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() =>
                                                    handleEdit(purchase.Code)
                                                }
                                            >
                                                <i className="bi bi-pencil-square"></i>{" "}
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() =>
                                                    handleDelete(purchase.Code)
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
                )}
            </div>
        </div>
    );
}
