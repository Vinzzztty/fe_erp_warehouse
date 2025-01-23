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
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/last-mile`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch last-mile.");
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
        router.push(`/transaction/cx-invoice/last-mile?id=${id}`);
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = confirm("Are you sure you want to delete this last-mile?");
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
            setCxInvoice((prev) => prev.filter((purchase: any) => purchase.Code !== id));
            alert("CX invoices deleted successfully.");
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };
    
    
    

    return (
        <div className="container mt-4">
            <h1>
                <i className="bi bi-building me-2"></i> Last-mile
            </h1>
            <p>View and manage your last-mile here.</p>

            <div className="row mt-4">

                {/* Company */}
                <div className="col-md-3">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <i
                                className="bi bi-building"
                                style={{ fontSize: "2rem", color: "#6c757d" }}
                            ></i>
                            <h5 className="card-title mt-3">CX-Invoices</h5>
                            <p className="card-text">
                                View and edit cx-invoice details.
                            </p>
                            <Link href="/transaction/cx-invoice/addcxinvoice">
                                <button className="btn btn-primary">
                                    Add Cx-invoice
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

               
            </div>

            <div className="mt-5">
                <h2>CX-Invoice</h2>
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
                                {CxInvoice.map((purchase: any) => (
                                    <tr key={purchase.Code}>
                                        <td>{purchase.Code}</td>
                                  
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