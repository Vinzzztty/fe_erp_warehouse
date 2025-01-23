"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function goodsReceipt() {
    const [gr, setGr] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [errorCompanies, setErrorCompanies] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Fetch Companies
        const fetchGr= async () => {
            setLoadingCompanies(true);
            setErrorCompanies(null);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/goods-receipts`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch good-receipts.");
                }
                const data = await response.json();
                if (data.status.code !== 200) {
                    throw new Error(
                        data.status.message || "Failed to fetch good-receipts."
                    );
                }
                setGr(data.data);
                console.log("Fetched GRs:", data.data);

            } catch (error: any) {
                setErrorCompanies(
                    error.message || "An unexpected error occurred."
                );
            } finally {
                setLoadingCompanies(false);
            }
        };

        // Fetch Stores
        
        fetchGr();
    }, []);
    const handleEdit = (id: string) => {
        router.push(`/transaction/goods-receipt/editgood?id=${id}`);
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = confirm("Are you sure you want to delete this good-receipt?");
        if (!confirmDelete) return;
    
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/goods-receipts/${id}`,
                {
                    method: "DELETE",
                }
            );
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to delete good-receipt."
                );
            }
    
            // Update state to remove deleted item
            setGr((prev) => prev.filter((purchase: any) => purchase.Code !== id));
            alert("good-receipt deleted successfully.");
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };
    
    
    

    return (
        <div className="container mt-4">
            <h1>
                <i className="bi bi-building me-2"></i> Good-receipt
            </h1>
            <p>View and manage Good-receipt here.</p>

            <div className="row mt-4">

                {/* Company */}
                <div className="col-md-3">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <i
                                className="bi bi-building"
                                style={{ fontSize: "2rem", color: "#6c757d" }}
                            ></i>
                            <h5 className="card-title mt-3">Good-receipts</h5>
                            <p className="card-text">
                                View and edit Good-receipt details.
                            </p>
                            <Link href="/transaction/goods-receipt/addgood">
                                <button className="btn btn-primary">
                                    Add good-receipt
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

               
            </div>

            <div className="mt-5">
                <h2>Good-receipt</h2>
                {loadingCompanies && <p>Loading Good-receipt...</p>}
                {errorCompanies && (
                    <p className="text-danger">{errorCompanies}</p>
                )}
                {!loadingCompanies &&
                    !errorCompanies &&
                  gr.length === 0 && <p>No  found.</p>}
                {!loadingCompanies &&
                    !errorCompanies &&
                    gr.length > 0 && (
                        <table className="table table-bordered mt-3">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Date</th>
                                    <th>Forwarder ID</th>
                                    <th>Last-mile's Code</th>
                                    <th>Warehouse Id</th>
                                    <th>Notes</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gr.map((purchase: any) => (
                                    <tr key={purchase.Code}>
                                        <td>{purchase.Code}</td>
                                  
                                        <td>{purchase.Date}</td>
                                   
                                        <td>{purchase.ForwarderId}</td>
                                        <td>{purchase.LMCode}</td>
                                        <td>{purchase.WarehouseId}</td>
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