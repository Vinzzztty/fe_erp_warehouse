"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProformaInvoiceDetail {
    Id: number;
    ProformaInvoiceId: number;
    SKUCode: string;
    ProductName: string;
    Variant: string | null;
    ProductImage: string | null;
    QTYOrdered: string;
    QTYApproved: string;
    UnitPriceOrdered: string;
    UnitPriceApproved: string;
    FirstMile: string | null;
    CartonP: string;
    CartonL: string;
    CartonT: string;
    CartonQty: string;
    PricePerCarton: string;
    EstimatedCBMTotal: string;
    CartonWeight: string | null;
    MarkingNumber: string | null;
    Credit: string;
    Note: string;
    Total: string;
    createdAt: string;
    updatedAt: string;
}

export default function POPage() {
    const [Invoice, setInvoice] = useState([]);
    const [selectedDetail, setSelectedDetail] = useState<ProformaInvoiceDetail | null>(null);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [errorCompanies, setErrorCompanies] = useState<string | null>(null);
    const [errorDetail, setErrorDetail] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchCompanies = async () => {
            setLoadingCompanies(true);
            setErrorCompanies(null);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoices`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch PI.");
                }
                const data = await response.json();
                if (data.status.code !== 200) {
                    throw new Error(data.status.message || "Failed to fetch PI.");
                }
                setInvoice(data.data);
                console.log("Fetched Proforma Invoice:", data.data);
            } catch (error: any) {
                setErrorCompanies(error.message || "An unexpected error occurred.");
            } finally {
                setLoadingCompanies(false);
            }
        };

        fetchCompanies();
    }, []);

    const handleEdit = (id: string) => {
        router.push(`/transaction/pi/editpi?id=${id}`);
    };

    const handleDetails = async (id: string) => {
        setLoadingDetail(true);
        setErrorDetail(null);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoices/${id}`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch proforma invoice details.");
            }
            const data = await response.json();
            if (data.status.code !== 200) {
                throw new Error(data.status.message || "Failed to fetch details.");
            }
            setSelectedDetail(data.data);
            setIsModalOpen(true);
        } catch (error: any) {
            setErrorDetail(error.message || "An unexpected error occurred.");
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = confirm("Are you sure you want to delete this proforma invoice?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoices/${id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete purchase order.");
            }

            setInvoice((prev) => prev.filter((purchase: any) => purchase.Code !== id));
            alert("Purchase order deleted successfully.");
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    const handleAddDetail = (id: string) => {
        router.push(`/transaction/pi/adddetailpi?id=${id}`);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="container mt-4">
            <h1>
                <i className="bi bi-building me-2"></i> Proformal Invoice
            </h1>
            <p>View and manage your orders here.</p>

            <div className="row mt-4">
                <div className="col-md-3">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <i
                                className="bi bi-building"
                                style={{ fontSize: "2rem", color: "#6c757d" }}
                            ></i>
                            <h5 className="card-title mt-3">Proformal Invoice</h5>
                            <p className="card-text">
                                View and edit PI details.
                            </p>
                            <Link href="/transaction/pi/addpi">
                                <button className="btn btn-primary">Go to PI</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-5">
                <h2>Proformal Invoice</h2>
                {loadingCompanies && <p>Loading PIs...</p>}
                {errorCompanies && <p className="text-danger">{errorCompanies}</p>}
                {!loadingCompanies && !errorCompanies && Invoice.length === 0 && <p>No PIs found.</p>}
                {!loadingCompanies && !errorCompanies && Invoice.length > 0 && (
                    <table className="table table-bordered mt-3">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Date</th>
                                <th>PO Number</th>
                                <th>Supplier Id</th>
                                <th>Notes</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Invoice.map((purchase: any) => (
                                <tr key={purchase.Code}>
                                    <td>{purchase.Code}</td>
                                    <td>{purchase.Date}</td>
                                    <td>{purchase.PONumber}</td>
                                    <td>{purchase.SuppplierId}</td>
                                    <td>{purchase.Notes}</td>
                                    <td>
                                        <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={() => handleEdit(purchase.Code)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(purchase.Code)}
                                        >
                                            Delete
                                        </button>
                                        <button
                                            className="btn btn-info btn-sm"
                                            onClick={() => handleDetails(purchase.Code)}
                                        >
                                            View Detail
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {isModalOpen && selectedDetail && (
                <div
                    className="modal show"
                    style={{
                        display: "block",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                    }}
                >
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Proforma Invoice Detail</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCloseModal}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {loadingDetail ? (
                                    <p>Loading details...</p>
                                ) : errorDetail ? (
                                    <p className="text-danger">{errorDetail}</p>
                                ) : (
                                    <div>
                                        <p>
                                            <strong>Product Name:</strong> {selectedDetail.ProductName}
                                        </p>
                                        <p>
                                            <strong>QTY Ordered:</strong> {selectedDetail.QTYOrdered}
                                        </p>
                                        <p>
                                            <strong>Unit Price Ordered:</strong>{" "}
                                            {selectedDetail.UnitPriceOrdered}
                                        </p>
                                        <p>
                                            <strong>Total:</strong> {selectedDetail.Total}
                                        </p>
                                        <p>
                                            <strong>Note:</strong> {selectedDetail.Note}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
    <button
        className="btn btn-secondary"
        onClick={handleCloseModal}
    >
        Close
    </button>
    <button
        className="btn btn-primary"
        onClick={() => {
            if (selectedDetail?.ProformaInvoiceId) {
                handleEdit(selectedDetail.ProformaInvoiceId.toString());
            } else {
                console.error("ProformaInvoiceId is undefined.");
                alert("Cannot edit: Proforma Invoice ID is missing.");
            }
        }}
    >
        Edit
    </button>
    <button
        className="btn btn-danger"
        onClick={() => {
            if (selectedDetail?.ProformaInvoiceId) {
                handleDelete(selectedDetail.ProformaInvoiceId.toString());
            } else {
                console.error("ProformaInvoiceId is undefined.");
                alert("Cannot delete: Proforma Invoice ID is missing.");
            }
        }}
    >
        Delete
    </button>
    <button
        className="btn btn-success"
        onClick={() => {
            if (selectedDetail?.ProformaInvoiceId) {
                handleAddDetail(selectedDetail.ProformaInvoiceId.toString());
            } else {
                console.error("ProformaInvoiceId is undefined.");
                alert("Cannot add detail: Proforma Invoice ID is missing.");
            }
        }}
    >
        Add Detail
    </button>
</div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
