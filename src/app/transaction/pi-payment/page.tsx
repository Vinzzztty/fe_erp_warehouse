"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Supplier {
    Code: number;
    Name: string;
    Address: string;
    CityId: number;
    ProvinceId: number;
    CountryId: number;
    PostalCode: number;
    Notes: string;
    Status: string;
    Department: string;
    ContactMethod: string;
    Description: string;
    BankId: number;
    AccountNumber: number;
    Website: string;
    Wechat: string;
    ShippingMark: string;
    createdAt: string;
    updatedAt: string;
}

interface PiPayment {
    Code: number;
    Date: string;
    SupplierId: number;
    Notes: string;
    Status: string;
    createdAt: string;
    updatedAt: string;
    Supplier: Supplier;
}

interface PiPaymentDetail {
    Id: number;
    PiPaymentId: number;
    PICode: number; // Updated to match new data structure
    Rate: string; // Updated to match new data structure
    ProductPriceRupiah: string; // Updated to match new data structure
    ProductPriceRMB: string; // Added to match new data structure
    FirstMileCostRupiah: string; // Updated to match new data structure
    FirstMileRMB: string; // Added to match new data structure
    SubtotalToBePaidRupiah: string; // Added to match new data structure
    SubtotalToBePaidRMB: string; // Added to match new data structure
    PaymentRupiah: string; // Updated to match new data structure
    PaymentRMB: string | null; // Added to match new data structure
    RemainingPaymentRupiah: string; // Added to match new data structure
    RemainingPaymentRMB: string | null; // Added to match new data structure
    TotalPaymentRupiah: string; // Added to match new data structure
    TotalPaymentRMB: string; // Added to match new data structure
    createdAt: string; // Added to display creation date
    updatedAt: string; // Added to display update date
}

export default function POPage() {
    const [Invoice, setInvoice] = useState<PiPayment[]>([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [errorCompanies, setErrorCompanies] = useState<string | null>(null);
    const [selectedDetail, setSelectedDetail] = useState<PiPaymentDetail[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentDetail, setCurrentDetail] = useState<PiPaymentDetail | null>(null);
    const [piCode, setPiCode] = useState<string>("");
    const router = useRouter();

    useEffect(() => {
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
        router.push(`/transaction/pi-payment/editpipayment?id=${id}`);
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
                throw new Error(errorData.message || "Failed to delete proforma invoice.");
            }

            setInvoice((prev) => prev.filter((purchase: any) => purchase.Code !== id));
            alert("Proforma invoice deleted successfully.");
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    const handleDetails = async (id: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/pi-payment-details/by-pi-payment/${id}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch proforma invoice details.");
            }

            const data = await response.json();
            console.log("Fetched Proforma Invoice Details:", data);

            if (data.status.code !== 200) {
                throw new Error(data.status.message || "No details found.");
            }
            
            setPiCode(id);
            setSelectedDetail(data.data);
            setIsModalOpen(true);
        } catch (error: any) {
            console.error("Error fetching proforma invoice details:", error);
            setIsModalOpen(true);
            setPiCode(id);
        }
    };

    const handleAddDetail = async (piPaymentId: string) => {
        // Redirect to add detail page
        router.push(`/transaction/pi-payment/addpipaymentdetails?id=${piPaymentId}`);
    };

    const handleEditDetail = (detail: number) => {
        router.push(`/transaction/pi-payment/editpipaymentdetails?id=${detail}`);
    };

    const handleDeleteDetail = async (detailId: number) => {
        const confirmDelete = confirm("Are you sure you want to delete this detail?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/pi-payment-details/${detailId}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete detail.");
            }

            alert("Detail deleted successfully.");
            // Optionally, refresh the details or update the state
            setSelectedDetail((prev) => prev.filter(detail => detail.Id !== detailId));
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    const handleUpdateDetail = async () => {
        if (!currentDetail) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/pi-payment-details/${currentDetail.Id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(currentDetail),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update detail.");
            }

            alert("Detail updated successfully.");
            setIsDetailModalOpen(false);
            // Refresh the details or update the state
            const updatedDetails = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/pi-payment-details/by-pi-payment/${currentDetail.PiPaymentId}`
            );
            const data = await updatedDetails.json();
            setSelectedDetail(data.data);
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    const generatePDF = () => {
        if (selectedDetail.length > 0) {
            const doc = new jsPDF("landscape", "mm", "a4");

            // Page width for positioning
            const pageWidth = doc.internal.pageSize.getWidth();
            const rightAlignX = pageWidth - 20;

            // --- Proforma Invoice Title (Top Right) ---
            doc.setFontSize(18);
            doc.text("Proforma Invoice Payment Details", rightAlignX, 20, { align: "right" });

            doc.setFontSize(12);
            let yOffset = 40;

            // --- Table with Proforma Invoice Payment Details ---
            const headers = [
                "No",
                "PICode",
                "Rate",
                "Product Price (Rupiah)",
                "First Mile Cost (Rupiah)",
                "Payment (Rupiah)",
                "Total Payment (Rupiah)",
             
            ];

            const tableData = selectedDetail.map((detail, index) => [
                index + 1,
                detail.PICode,
                detail.Rate,
                detail.ProductPriceRupiah || "N/A",
                detail.FirstMileCostRupiah,
                detail.PaymentRupiah,
                detail.TotalPaymentRupiah,
                
            ]);

            autoTable(doc, {
                startY: yOffset,
                head: [headers],
                body: tableData,
                theme: "grid",
                margin: { left: 20 },
                styles: {
                    fontSize: 10,
                    cellPadding: 3,
                    lineColor: [0, 0, 0],
                    textColor: [0, 0, 0],
                },
                headStyles: {
                    fillColor: [0, 0, 0],
                    textColor: [255, 255, 255],
                    fontStyle: "bold",
                },
            });

            // Save PDF
            doc.save(`proforma-invoice-payment-${new Date().toISOString().split("T")[0]}.pdf`);
        } else {
            console.error("No proforma invoice details available.");
        }
    };

    return (
        <div className="container-fluid mt-4">
            <div className="text-center card shadow-lg p-4 rounded">
                <h1>
                    <i className="bi bi-building me-2"></i> Proforma Invoice Payment
                </h1>
                <p>View and manage your orders here.</p>
                <Link href="/transaction/pi-payment/addpipayment">
                    <button className="btn btn-dark">Go to PI-Payment</button>
                </Link>
            </div>

            <div className="card shadow-lg p-4 rounded mt-4">
                <h2>Proforma Invoice Payment</h2>
                {loadingCompanies && <p>Loading PI-Payments...</p>}
                {errorCompanies && <p className="text-danger">{errorCompanies}</p>}
                {!loadingCompanies && !errorCompanies && Invoice.length === 0 && <p>No PIs found.</p>}
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
                                                onClick={() => handleEdit(purchase.Code)}
                                            >
                                                <i className="bi bi-pencil-square"></i> Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm me-2"
                                                onClick={() => handleDelete(purchase.Code)}
                                            >
                                                <i className="bi bi-trash"></i> Delete
                                            </button>
                                            <button
                                                className="btn btn-info btn-sm"
                                                onClick={() => handleDetails(purchase.Code)}
                                            >
                                                <i className="bi bi-search"></i> View Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div
                    className="modal show d-flex align-items-center justify-content-center"
                    style={{
                        display: "block",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                    }}
                >
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header bg-dark text-white">
                                <h5 className="modal-title">Proforma Invoice Details</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setIsModalOpen(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {selectedDetail.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped align-middle text-center">
                                            <thead className="table-dark">
                                                <tr>
                                                <th>No</th>
                                                <th>PICode</th>
                                                <th>Rate</th>
                                                <th>Product Price (Rupiah)</th>
                                                <th>Product Price (RMB)</th>
                                                <th>First Mile Cost (Rupiah)</th>
                                                <th>First Mile Cost (RMB)</th>
                                                <th>Subtotal To Be Paid (Rupiah)</th>
                                                <th>Subtotal To Be Paid (RMB)</th>
                                                <th>Payment (Rupiah)</th>
                                                <th>Payment (RMB)</th>
                                                <th>Remaining Payment (Rupiah)</th>
                                                <th>Remaining Payment (RMB)</th>
                                                <th>Total Payment (Rupiah)</th>
                                                <th>Total Payment (RMB)</th>
                                                <th>Created At</th>
                                                <th>Updated At</th>
                                                <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedDetail.map((detail, index) => (
                                                    <tr key={detail.Id}>
                                                        <td className="fw-bold">{index + 1}</td>
                                                        <td>{detail.PICode}</td>
                                                        <td>{detail.Rate}</td>
                                                        <td>{detail.ProductPriceRupiah}</td>
                                                        <td>{detail.ProductPriceRMB}</td>
                                                        <td>{detail.FirstMileCostRupiah}</td>
                                                        <td>{detail.FirstMileRMB}</td>
                                                        <td>{detail.SubtotalToBePaidRupiah}</td>
                                                        <td>{detail.SubtotalToBePaidRMB}</td>
                                                        <td>{detail.PaymentRupiah}</td>
                                                        <td>{detail.PaymentRMB}</td>
                                                        <td>{detail.RemainingPaymentRupiah}</td>
                                                        <td>{detail.RemainingPaymentRMB}</td>
                                                        <td>{detail.TotalPaymentRupiah}</td>
                                                        <td>{detail.TotalPaymentRMB}</td>
                                                        <td>{new Date(detail.createdAt).toLocaleString()}</td>
                                                        <td>{new Date(detail.updatedAt).toLocaleString()}</td>
                                                        <td>
                                                            <button
                                                                className="btn btn-primary btn-sm me-2"
                                                                onClick={() => handleEditDetail(detail.Id)}
                                                            >
                                                                <i className="bi bi-pencil-square me-1"></i> Edit
                                                            </button>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleDeleteDetail(detail.Id)}
                                                            >
                                                                <i className="bi bi-trash me-1"></i> Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p>No details available for this Proforma Invoice.</p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-success me-2"
                                    onClick={() => handleAddDetail(piCode)}
                                >
                                    <i className="bi bi-plus-square me-2"></i> Add Detail
                                </button>
                                <button
                                    className="btn btn-info"
                                    onClick={generatePDF}
                                >
                                    <i className="bi bi-file-earmark-pdf me-2"></i> Generate PDF
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    <i className="bi bi-x-lg me-2"></i> Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            
        </div>
    );
}