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
    SKUCode: string;
    ProductName: string;
    Variant: string | null;
    QTYOrdered: string;
    QTYApproved: string;
    UnitPriceOrdered: string;
    UnitPriceApproved: string;
    CartonP: string;
    CartonL: string;
    CartonT: string;
    CartonQty: string;
    PricePerCarton: string;
    EstimatedCBMTotal: string;
    Credit: string | null;
    Note: string;
    Total: string;
    createdAt: string;
    updatedAt: string;
}

export default function POPage() {
    const [Invoice, setInvoice] = useState<PiPayment[]>([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [errorCompanies, setErrorCompanies] = useState<string | null>(null);
    const [selectedDetail, setSelectedDetail] = useState<PiPaymentDetail[]>([]); // Now an array
    const [isModalOpen, setIsModalOpen] = useState(false);
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

            // Update state to remove deleted item
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

            setSelectedDetail(data.data); // Store all details, not just one
            setIsModalOpen(true);
        } catch (error: any) {
            console.error("Error fetching proforma invoice details:", error);
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
                "SKU Code",
                "Product Name",
                "Variant",
                "QTY Ordered",
                "QTY Approved",
                "Unit Price Ordered",
                "Unit Price Approved",
                "Carton Dimensions (P x L x T)",
                "Carton Qty",
                "Price Per Carton",
                "Estimated CBM Total",
                "Credit",
                "Note",
                "Total",
            ];

            const tableData = selectedDetail.map((detail, index) => [
                index + 1,
                detail.SKUCode,
                detail.ProductName,
                detail.Variant || "N/A",
                detail.QTYOrdered,
                detail.QTYApproved,
                detail.UnitPriceOrdered,
                detail.UnitPriceApproved,
                `${detail.CartonP} x ${detail.CartonL} x ${detail.CartonT}`,
                detail.CartonQty,
                detail.PricePerCarton,
                detail.EstimatedCBMTotal,
                detail.Credit || "N/A",
                detail.Note,
                detail.Total,
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
                                                className="btn btn-danger btn-sm"
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
                                                    <th>SKU Code</th>
                                                    <th>Product Name</th>
                                                    <th>Variant</th>
                                                    <th>QTY Ordered</th>
                                                    <th>QTY Approved</th>
                                                    <th>Unit Price Ordered</th>
                                                    <th>Unit Price Approved</th>
                                                    <th>Carton Dimensions (P x L x T)</th>
                                                    <th>Carton Qty</th>
                                                    <th>Price Per Carton</th>
                                                    <th>Estimated CBM Total</th>
                                                    <th>Credit</th>
                                                    <th>Note</th>
                                                    <th>Total</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedDetail.map((detail, index) => (
                                                    <tr key={detail.Id}>
                                                        <td className="fw-bold">{index + 1}</td>
                                                        <td>{detail.SKUCode}</td>
                                                        <td>{detail.ProductName}</td>
                                                        <td>{detail.Variant || "N/A"}</td>
                                                        <td>{detail.QTYOrdered}</td>
                                                        <td>{detail.QTYApproved}</td>
                                                        <td>${detail.UnitPriceOrdered}</td>
                                                        <td>${detail.UnitPriceApproved}</td>
                                                        <td>{detail.CartonP} x {detail.CartonL} x {detail.CartonT}</td>
                                                        <td>{detail.CartonQty}</td>
                                                        <td>${detail.PricePerCarton}</td>
                                                        <td>{detail.EstimatedCBMTotal}</td>
                                                        <td>{detail.Credit || "N/A"}</td>
                                                        <td>{detail.Note}</td>
                                                        <td>${detail.Total}</td>
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
                                    onClick={() => handleAddDetail(selectedDetail[0]?.PiPaymentId.toString() || "")}
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