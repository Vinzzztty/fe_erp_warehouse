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
        router.push(`/transaction/pi/editpi?id=${id}`);
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = confirm("Are you sure you want to delete this proforma invoice?");
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
            setInvoice((prev) => prev.filter((purchase: any) => purchase.Code !== id));
            alert("Purchase order deleted successfully.");
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };
    
    
    

    return (
        <div className="container mt-4">
            <h1>
                <i className="bi bi-building me-2"></i> Purchase Order
            </h1>
            <p>View and manage your orders here.</p>

            <div className="row mt-4">

                {/* Company */}
                <div className="col-md-3">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <i
                                className="bi bi-building"
                                style={{ fontSize: "2rem", color: "#6c757d" }}
                            ></i>
                            <h5 className="card-title mt-3">Purchase Orders</h5>
                            <p className="card-text">
                                View and edit PO details.
                            </p>
                            <Link href="/transaction/pi/addpi">
                                <button className="btn btn-primary">
                                    Go to PO
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Store */}
                <div className="col-md-3">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <i
                                className="bi bi-shop"
                                style={{ fontSize: "2rem", color: "#6c757d" }}
                            ></i>
                            <h5 className="card-title mt-3">Store</h5>
                            <p className="card-text">
                                Manage your stores and locations.
                            </p>
                            <Link href="/master/business/store">
                                <button className="btn btn-primary">
                                    Go to Store
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-5">
                <h2>Purchase Orders</h2>
                {loadingCompanies && <p>Loading POs...</p>}
                {errorCompanies && (
                    <p className="text-danger">{errorCompanies}</p>
                )}
                {!loadingCompanies &&
                    !errorCompanies &&
                  Invoice.length === 0 && <p>No POs found.</p>}
                {!loadingCompanies &&
                    !errorCompanies &&
                    Invoice.length > 0 && (
                        <table className="table table-bordered mt-3">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Date</th>
                                    <th>Supplier Id</th>
                                    <th>Notes</th>
                                    <th>Created At</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Invoice.map((purchase: any) => (
                                    <tr key={purchase.Code}>
                                        <td>{purchase.Code}</td>
                                        <td>{purchase.Date}</td>
                                        <td>{purchase.SupplierId}</td>
                                        <td>{purchase.Notes || "N/A"}</td>
                                        <td>{purchase.Status}</td>
                                        
                                        <td>
                                            {new Date(
                                                purchase.CreatedAt
                                            ).toLocaleString()}
                                        </td>
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