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
    Code?: string;
}

export default function POPage() {
    const [Invoice, setInvoice] = useState([]);
    const [selectedDetail, setSelectedDetail] = useState<ProformaInvoiceDetail | null>(null);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [errorCompanies, setErrorCompanies] = useState<string | null>(null);
    const [errorDetail, setErrorDetail] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalLoading, setIsModalLoading] = useState(true); // To handle modal loading state
    const router = useRouter();
    const [piCode, setPiCode] = useState<string>(""); // Add a state to store piCode

 

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

    const handleEdit = (code: string) => {
        router.push(`/transaction/pi/editpi?id=${code}`);
    };

    const handleAddDetail = (code: string) => {
        router.push(`/transaction/pi/adddetailpi?id=${code}`);
    };
    const handleEditDetail = (code: string) => {
        router.push(`/transaction/pi/editpidetail?id=${code}`);
    };

    const handleDetails = async (code: string) => {
        setLoadingDetail(true);
        setIsModalLoading(true); // Set the modal to loading state
        setErrorDetail(null);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoice-details/by-proforma-invoice/${code}`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch proforma invoice details.");
            }
            const data = await response.json();
            console.log("Fetched Details:", data);

            if (data.status.code !== 200 || !data.data || data.data.length === 0) {
                setSelectedDetail(null); // Set to null when no details are available
                setSelectedDetail(null); // Set to null when no details are available
                setPiCode(code); // Store piCode in state
                throw new Error("No details available for this Proforma Invoice.");
            } else {
                setSelectedDetail(data.data[0]); // Set the first detail as the selected detail
                setPiCode(code); // Store piCode in state
            }
            setIsModalOpen(true); // Open modal even when there's no data
        } catch (error: any) {
            setErrorDetail(error.message || "An unexpected error occurred.");
            setSelectedDetail(null); // Set to null if there's an error
            setIsModalOpen(true); // Ensure modal opens on error as well
            setPiCode(code); // Store piCode in state
        } finally {
            setLoadingDetail(false);
            setIsModalLoading(false); // Set the modal to data state
            setPiCode(code); // Store piCode in state
        }
    };

    const handleDelete = async (code: string) => {
        const confirmDelete = confirm("Are you sure you want to delete this proforma invoice?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoices/${code}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete purchase order.");
            }

            setInvoice((prev) => prev.filter((purchase: any) => purchase.Code !== code));
            alert("Purchase order deleted successfully.");
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };const handleDeleteDetail = async (code: string) => {
        const confirmDelete = confirm("Are you sure you want to delete this proforma invoice?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoice-details/${code}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete proforma invoice detail.");
            }

            setInvoice((prev) => prev.filter((purchase: any) => purchase.Code !== code));
            alert("Proforma invoice deleted successfully.");
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };


    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="container mt-4">
            <h1>
                <i className="bi bi-building me-2"></i> Proforma Invoice
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
                            <h5 className="card-title mt-3">Proforma Invoice</h5>
                            <p className="card-text">View and edit PI details.</p>
                            <Link href="/transaction/pi/addpi">
                                <button className="btn btn-primary">Go to PI</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-5">
                <h2>Proforma Invoice</h2>
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
                                            className="btn btn-danger btn-sm me-2"
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

            {isModalOpen && (
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
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body">
                                {isModalLoading ? (
                                    <p>Loading details...</p>
                                ) : errorDetail ? (
                                    <p className="text-danger">{errorDetail}</p>
                                ) : selectedDetail ? (
                                    <div>
                                        <p><strong>Product Name:</strong> {selectedDetail.ProductName}</p>
                                        <p><strong>SKU Code:</strong> {selectedDetail.SKUCode}</p>
                                        <p><strong>Variant:</strong> {selectedDetail.Variant || "N/A"}</p>
                                        <p><strong>QTY Ordered:</strong> {selectedDetail.QTYOrdered}</p>
                                        <p><strong>QTY Approved:</strong> {selectedDetail.QTYApproved}</p>
                                        <p><strong>Unit Price Ordered:</strong> {selectedDetail.UnitPriceOrdered}</p>
                                        <p><strong>Unit Price Approved:</strong> {selectedDetail.UnitPriceApproved}</p>
                                        <p><strong>Carton Dimensions (P x L x T):</strong> {selectedDetail.CartonP} x {selectedDetail.CartonL} x {selectedDetail.CartonT}</p>
                                        <p><strong>Carton Quantity:</strong> {selectedDetail.CartonQty}</p>
                                        <p><strong>Price Per Carton:</strong> {selectedDetail.PricePerCarton}</p>
                                        <p><strong>Estimated CBM Total:</strong> {selectedDetail.EstimatedCBMTotal}</p>
                                        <p><strong>Credit:</strong> {selectedDetail.Credit}</p>
                                        <p><strong>Note:</strong> {selectedDetail.Note}</p>
                                        <p><strong>Total:</strong> {selectedDetail.Total}</p>
                                    </div>
                                ) : (
                                    <p>No detail data available for this Proforma Invoice.</p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={handleCloseModal}>
                                    Close
                                </button>
                                <button
                                    className="btn btn-primary"
                                    
                                    onClick={() => {
                                        
                                            handleEditDetail(selectedDetail?.Id?.toString() || '');
                                        
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDeleteDetail(selectedDetail?.Id?.toString() || '')}
                                >
                                    Delete
                                </button>
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleAddDetail(piCode)}
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
