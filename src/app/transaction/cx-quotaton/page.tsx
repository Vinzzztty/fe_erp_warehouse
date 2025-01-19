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
        router.push(`/transaction/cx-quotation/edicxquo?id=${id}`);
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = confirm("Are you sure you want to delete this CX Quotation?");
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
            setCXQuo((prev) => prev.filter((purchase: any) => purchase.Code !== id));
            alert("CX Quotation deleted successfully.");
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };
    
    
    

    return (
        <div className="container mt-4">
            <h1>
                <i className="bi bi-building me-2"></i> CX-Quotations
            </h1>
            <p>View and manage your cx quotation here.</p>

            <div className="row mt-4">

                {/* Company */}
                <div className="col-md-3">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <i
                                className="bi bi-building"
                                style={{ fontSize: "2rem", color: "#6c757d" }}
                            ></i>
                            <h5 className="card-title mt-3">CX-Quotations</h5>
                            <p className="card-text">
                                View and edit cx-Q details.
                            </p>
                            <Link href="/transaction/cx-quotaton/addcxquo">
                                <button className="btn btn-primary">
                                    Add Cx-quotation
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

               
            </div>

            <div className="mt-5">
                <h2>CX-Quotation</h2>
                {loadingCompanies && <p>Loading CX-Qs...</p>}
                {errorCompanies && (
                    <p className="text-danger">{errorCompanies}</p>
                )}
                {!loadingCompanies &&
                    !errorCompanies &&
                  CXQuo.length === 0 && <p>No CX-Quotations found.</p>}
                {!loadingCompanies &&
                    !errorCompanies &&
                    CXQuo.length > 0 && (
                        <table className="table table-bordered mt-3">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Date</th>
                                    <th>Forwarder ID</th>
                                    <th>Notes</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {CXQuo.map((purchase: any) => (
                                    <tr key={purchase.Code}>
                                  
                                        <td>{purchase.Date}</td>
                                   
                                        <td>{purchase.ForwarderId}</td>
                                        <td>{purchase.Notes}</td>
                                    
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() =>
                                                    handleEdit(purchase.Code)
                                                }
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() =>
                                                    handleDelete(purchase.Code)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
            </div>
        </div>
    );
}