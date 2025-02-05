"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CXQuo() {
    const [CXQuo, setCXQuo] = useState([]);
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
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-quotations`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch PI.");
                }
                const data = await response.json();
                if (data.status.code !== 200) {
                    throw new Error(
                        data.status.message || "Failed to fetch CX Quotations."
                    );
                }
                setCXQuo(data.data);
                console.log("Fetched CX Quotations:", data.data);
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
        router.push(`/transaction/cx-quotaton/editcxquo?id=${id}`);
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = confirm(
            "Are you sure you want to delete this CX Quotation?"
        );
        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-quotations/${id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to delete CX Quotation."
                );
            }

            // Update state to remove deleted item
            setCXQuo((prev) =>
                prev.filter((purchase: any) => purchase.Code !== id)
            );
            alert("CX Quotation deleted successfully.");
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    return (
        <div className="container-fluid mt-4">
            <div className="text-center card shadow-lg p-4 rounded">
                <h1>
                    <i className="bi bi-building me-2"></i> CX-Quotations
                </h1>
                <p>View and manage your cx quotation here.</p>
                <Link href="/transaction/cx-quotaton/addcxquo">
                    <button className="btn btn-dark">Add Cx-quotation</button>
                </Link>
            </div>

            <div className="card shadow-lg p-4 rounded mt-4">
                <p className="mb-4 fw-bold">CX-Quotation</p>
                {loadingCompanies && <p>Loading CX-Qs...</p>}
                {errorCompanies && (
                    <p className="text-danger">{errorCompanies}</p>
                )}
                {!loadingCompanies && !errorCompanies && CXQuo.length === 0 && (
                    <p>No CX-Quotations found.</p>
                )}
                {!loadingCompanies && !errorCompanies && CXQuo.length > 0 && (
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered table-hover align-middle text-center">
                            <thead className="table-dark">
                                <tr>
                                    <th>No</th>
                                    <th>Date</th>
                                    <th>Forwarder ID</th>
                                    <th>Notes</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {CXQuo.map((purchase: any, index: number) => (
                                    <tr key={purchase.Code}>
                                        <td className="fw-bold">{index + 1}</td>

                                        <td>{purchase.Date}</td>

                                        <td>{purchase.Forwarder.Name}</td>
                                        <td>{purchase.Notes || "N/A"}</td>

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
