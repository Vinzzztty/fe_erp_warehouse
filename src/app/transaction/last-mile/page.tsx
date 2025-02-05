"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Lastmile() {
    const [Lm, setLm] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [errorCompanies, setErrorCompanies] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Fetch Companies
        const fetchLm = async () => {
            setLoadingCompanies(true);
            setErrorCompanies(null);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/last-mile`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch last-mile.");
                }
                const data = await response.json();
                if (data.status.code !== 200) {
                    throw new Error(
                        data.status.message || "Failed to fetch Last-miles."
                    );
                }
                setLm(data.data);
                console.log("Fetched Lms:", data.data);
            } catch (error: any) {
                setErrorCompanies(
                    error.message || "An unexpected error occurred."
                );
            } finally {
                setLoadingCompanies(false);
            }
        };

        // Fetch Stores

        fetchLm();
    }, []);
    const handleEdit = (id: string) => {
        router.push(`/transaction/last-mile/editlastmile?id=${id}`);
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = confirm(
            "Are you sure you want to delete this last-mile?"
        );
        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/last-mile/${id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to delete last-mile."
                );
            }

            // Update state to remove deleted item
            setLm((prev) =>
                prev.filter((purchase: any) => purchase.Code !== id)
            );
            alert("last-mile deleted successfully.");
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    return (
        <div className="container-fluid mt-4">
            <div className="text-center card shadow-lg p-4 rounded">
                <h1>
                    <i className="bi bi-truck me-2"></i> Last-mile
                </h1>
                <p>View and manage your last-mile here.</p>
                <Link href="/transaction/last-mile/addlastmile">
                    <button className="btn btn-dark">Add last mile</button>
                </Link>
            </div>

            <div className="card shadow-lg p-4 rounded mt-4">
                <p className="mb-4 fw-bold">Last-miles</p>
                {loadingCompanies && <p>Loading Last-miles...</p>}
                {errorCompanies && (
                    <p className="text-danger">{errorCompanies}</p>
                )}
                {!loadingCompanies && !errorCompanies && Lm.length === 0 && (
                    <p>No found.</p>
                )}
                {!loadingCompanies && !errorCompanies && Lm.length > 0 && (
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
                                {Lm.map((purchase: any, index: number) => (
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
