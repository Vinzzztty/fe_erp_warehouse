"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CXInvoice() {
    const [CxInvoice, setCxInvoice] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [errorCompanies, setErrorCompanies] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Fetch Companies
        const fetchCx = async () => {
            setLoadingCompanies(true);
            setErrorCompanies(null);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-invoices`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch CX invoices.");
                }
                const data = await response.json();
                if (data.status.code !== 200) {
                    throw new Error(
                        data.status.message || "Failed to fetch CX Invoices."
                    );
                }
                setCxInvoice(data.data);
                console.log("Fetched CX Invoices:", data.data);
            } catch (error: any) {
                setErrorCompanies(
                    error.message || "An unexpected error occurred."
                );
            } finally {
                setLoadingCompanies(false);
            }
        };

        // Fetch Stores

        fetchCx();
    }, []);
    const handleEdit = (id: string) => {
        router.push(`/transaction/cx-invoice/editcxinvoice?id=${id}`);
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = confirm(
            "Are you sure you want to delete this CX Invoice?"
        );
        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-invoices/${id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to delete CX Invoices."
                );
            }

            // Update state to remove deleted item
            setCxInvoice((prev) =>
                prev.filter((purchase: any) => purchase.Code !== id)
            );
            alert("CX invoices deleted successfully.");
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    return (
        <div className="container-fluid mt-4">
            <div className="text-center card shadow-lg p-4 rounded">
                <h1>
                    <i className="bi bi-building me-2"></i> CX-invoice
                </h1>
                <p>View and manage your cx invoice here.</p>
                <Link href="/transaction/cx-invoice/addcxinvoice">
                    <button className="btn btn-dark">Add Cx-invoice</button>
                </Link>
            </div>

            <div className="card shadow-lg p-4 rounded mt-4">
                <p className="mb-4 fw-bold">CX-invoice</p>
                {loadingCompanies && <p>Loading CX-Invoices...</p>}
                {errorCompanies && (
                    <p className="text-danger">{errorCompanies}</p>
                )}
                {!loadingCompanies &&
                    !errorCompanies &&
                    CxInvoice.length === 0 && <p>No CX-Quotations found.</p>}
                {!loadingCompanies &&
                    !errorCompanies &&
                    CxInvoice.length > 0 && (
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover align-middle text-center">
                                <thead className="table-dark">
                                    <tr>
                                        <th>No</th>
                                        <th>Date</th>
                                        <th>Forwarder ID</th>
                                        <th>Notes</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {CxInvoice.map(
                                        (purchase: any, index: number) => (
                                            <tr key={purchase.Code}>
                                                <td className="fw-bold">
                                                    {index + 1}
                                                </td>

                                                <td>{purchase.Date}</td>

                                                <td>
                                                    {purchase.Forwarder.Name}
                                                </td>
                                                <td>
                                                    {purchase.Notes || "N/A"}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge ${
                                                            [
                                                                "Completed",
                                                                "Paid",
                                                                "Arrived",
                                                                "Shipped",
                                                            ].includes(
                                                                purchase.Status
                                                            )
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
                                                            handleEdit(
                                                                purchase.Code
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
                                                                purchase.Code
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
                    )}
            </div>
        </div>
    );
}
