"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CxQuotation {
    Code: number;
    Date: string;
    ForwarderId: number;
    Notes: string;
    createdAt: string;
    updatedAt: string;
}

interface CxQuotationDetail {
    Id: number;
    CxQuotationId: number;
    PICode: number;
    ProductName: string;
    Variant: string | null;
    ProductImage: string | null;
    QTY: string;
    CartonP: string;
    CartonL: string;
    CartonT: string;
    CartonQty: string;
    TotalPriceInPI: string | null;
    EstimatedCBMTotal: string;
    RatePerCBM: string | null;
    MarkingNumber: string | null;
    CrossBorderFee: string;
    ImportDuties: string;
    DiscountAndFees: string;
    CXCost: string;
    TotalCXCost: string;
    createdAt: string;
    updatedAt: string;
}

export default function CXQuotations() {
    const [cxQuotations, setCxQuotations] = useState<CxQuotation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDetail, setSelectedDetail] = useState<CxQuotationDetail[]>([]); // Ubah jadi array

    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const [cxCode, setCxCode] = useState<string>("");

    useEffect(() => {
        const fetchCxQuotations = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-quotations`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch CX Quotations.");
                }
                const data = await response.json();
                if (data.status.code !== 200) {
                    throw new Error(data.status.message || "Failed to fetch CX Quotations.");
                }
                setCxQuotations(data.data);
            } catch (error: any) {
                setError(error.message || "An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchCxQuotations();
    }, []);

    const handleEdit = (id: string) => {
        router.push(`/transaction/cx-quotaton/editcxquo?id=${id}`);
    };

    const handleEditDetail = (id: string) => {
        router.push(`/transaction/cx-quotaton/editcxquodetail?id=${id}`);
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
                throw new Error(errorData.message || "Failed to delete CX Quotation.");
            }

            setCxQuotations((prev) => prev.filter((quotation) => quotation.Code !== Number(id)));
            alert("CX Quotation deleted successfully.");
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    const handleDeleteDetail = async (id: string) => {
        const confirmDelete = confirm("Are you sure you want to delete this CX Quotation?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-quotation-details/${id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete CX Quotation.");
            }

            setCxQuotations((prev) => prev.filter((quotation) => quotation.Code !== Number(id)));
            alert("CX Quotation deleted successfully.");
            router.push(`/transaction/cx-quotaton/`);
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    const handleDetails = async (id: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-quotation-details/by-cx-quotation/${id}`
            );
    
            if (!response.ok) {
                throw new Error("Failed to fetch CX Quotation details.");
            }
    
            const data = await response.json();
            console.log("Fetched data:", data); // Log the fetched data untuk debugging
            if (data.status.code !== 200 || !Array.isArray(data.data) || data.data.length === 0) {
                throw new Error(data.status.message || "No details found.");
            }
    
            setSelectedDetail(data.data); // Pastikan data disimpan sebagai array
            setCxCode(id.toString());
        } catch (error: any) {
            console.error("Error fetching CX Quotation details:", error);
            setSelectedDetail([]);
            setCxCode(id.toString());
        } finally {
            setIsModalOpen(true);
            setCxCode(id.toString());
        }
    };
    

    const handleAddDetail = (id: string) => {
        // Redirect to the add detail page
        router.push(`/transaction/cx-quotaton/addcxquodetail?id=${id}`);
    };

    const handlePrintDetail = () => {
        if (selectedDetail && Array.isArray(selectedDetail) && selectedDetail.length > 0) {
            const doc = new jsPDF("landscape", "mm", "a4");
    
            // Page width untuk positioning
            const pageWidth = doc.internal.pageSize.getWidth();
            const rightAlignX = pageWidth - 20;
    
            // --- Judul di pojok kanan atas ---
            doc.setFontSize(18);
            doc.text("CX Quotation Details", rightAlignX, 20, { align: "right" });
    
            doc.setFontSize(12);
            let yOffset = 40;
    
            // --- Judul tabel ---
            doc.setFontSize(14);
            doc.text("CX Quotation Detail", 20, yOffset);
            yOffset += 10;
    
            const headers = [
                "No",
                "Product Name",
                "Variant",
                "Quantity",
                "Carton (P x L x T)",
                "Carton Qty",
                "Estimated CBM Total",
                "Cross Border Fee",
                "Import Duties",
                "Discount & Fees",
                "CX Cost",
                "Total CX Cost",
                "Created At",
                "Updated At",
            ];
    
            const tableData = selectedDetail.map((detail, index) => [
                index + 1,
                detail.ProductName,
                detail.Variant || "N/A",
                detail.QTY,
                `${detail.CartonP} x ${detail.CartonL} x ${detail.CartonT}`,
                detail.CartonQty,
                detail.EstimatedCBMTotal,
                detail.CrossBorderFee,
                detail.ImportDuties,
                detail.DiscountAndFees,
                detail.CXCost,
                detail.TotalCXCost,
                new Date(detail.createdAt).toLocaleString(),
                new Date(detail.updatedAt).toLocaleString(),
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
    
            // Simpan PDF
            doc.save(`cx-quotation-details-${cxCode}.pdf`);
        } else {
            alert("No CX Quotation details available to print.");
        }
    };
    

    return (
        <div className="container-fluid mt-4">
            <div className="text-center card shadow-lg p-4 rounded">
                <h1>
                    <i className="bi bi-building me-2"></i> CX Quotations
                </h1>
                <p>View and manage your CX quotations here.</p>
                <Link href="/transaction/cx-quotaton/addcxquo">
                    <button className="btn btn-dark">Add CX Quotation</button>
                </Link>
            </div>

            <div className="card shadow-lg p-4 rounded mt-4">
                <p className="mb-4 fw-bold">CX Quotations</p>
                {loading && <p>Loading CX Quotations...</p>}
                {error && <p className="text-danger">{error}</p>}
                {!loading && !error && cxQuotations.length === 0 && <p>No CX Quotations found.</p>}
                {!loading && !error && cxQuotations.length > 0 && (
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
                                {cxQuotations.map((quotation, index) => (
                                    <tr key={quotation.Code}>
                                        <td className="fw-bold">{index + 1}</td>
                                        <td>{quotation.Date}</td>
                                        <td>{quotation.ForwarderId}</td>
                                        <td>{quotation.Notes || "N/A"}</td>
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() => handleEdit(quotation.Code.toString())}
                                            >
                                                <i className="bi bi-pencil-square"></i> Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm me-2"
                                                onClick={() => handleDelete(quotation.Code.toString())}
                                            >
                                                <i className="bi bi-trash"></i> Delete
                                            </button>
                                            <button
                                                className="btn btn-info btn-sm"
                                                onClick={() => handleDetails(quotation.Code.toString())}
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
                                <h5 className="modal-title">CX Quotation Details</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setIsModalOpen(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {selectedDetail ? (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped align-middle text-center">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>No</th>
                                                    <th>Product Name</th>
                                                    <th>Variant</th>
                                                    <th>Quantity</th>
                                                    <th>Carton Dimensions (P x L x T)</th>
                                                    <th>Carton Quantity</th>
                                                    <th>Estimated CBM Total</th>
                                                    <th>Cross Border Fee</th>
                                                    <th>Import Duties</th>
                                                    <th>Discount and Fees</th>
                                                    <th>CX Cost</th>
                                                    <th>Total CX Cost</th>
                                                    <th>Created At</th>
                                                    <th>Updated At</th>
                                                    <th>Action</th> {/* New Action Column */}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                    {selectedDetail.length > 0 ? (
                                                        selectedDetail.map((detail, index) => (
                                                            <tr key={detail.Id}>
                                                                <td className="fw-bold">{index + 1}</td>
                                                                <td>{detail.ProductName}</td>
                                                                <td>{detail.Variant || "N/A"}</td>
                                                                <td>{detail.QTY}</td>
                                                                <td>{`${detail.CartonP} x ${detail.CartonL} x ${detail.CartonT}`}</td>
                                                                <td>{detail.CartonQty}</td>
                                                                <td>{detail.EstimatedCBMTotal}</td>
                                                                <td>{detail.CrossBorderFee}</td>
                                                                <td>{detail.ImportDuties}</td>
                                                                <td>{detail.DiscountAndFees}</td>
                                                                <td>{detail.CXCost}</td>
                                                                <td>{detail.TotalCXCost}</td>
                                                                <td>{new Date(detail.createdAt).toLocaleString()}</td>
                                                                <td>{new Date(detail.updatedAt).toLocaleString()}</td>
                                                                <td>
                                                                    <button
                                                                        className="btn btn-warning btn-sm me-2"
                                                                        onClick={() => handleEditDetail(detail.Id.toString())}
                                                                    >
                                                                        <i className="bi bi-pencil-square"></i> Edit
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-danger btn-sm"
                                                                        onClick={() => handleDeleteDetail(detail.Id.toString())}
                                                                    >
                                                                        <i className="bi bi-trash"></i> Delete
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td >No details available for this CX Quotation.</td>
                                                        </tr>
                                                    )}
                                                </tbody>

                                        </table>
                                    </div>
                                ) : (
                                    <p>No details available for this CX Quotation.</p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-success me-2"
                                    onClick={() => handleAddDetail(cxCode)}
                                >
                                    <i className="bi bi-plus-square me-2"></i> Add Detail
                                </button>
                                <button
                                    className="btn btn-info"
                                    onClick={handlePrintDetail}
                                >
                                    <i className="bi bi-printer me-2"></i> Print Detail
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