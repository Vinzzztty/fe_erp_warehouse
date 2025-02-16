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
    const [selectedDetail, setSelectedDetail] = useState<CxQuotationDetail | null>(null); // Single detail object
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
        router.push(`/transaction/cx-quotation/editcxquo?id=${id}`);
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

    const handleDetails = async (id: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-quotation-details/by-cx-quotation/${id}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch CX Quotation details.");
            }

            const data = await response.json();
            console.log(JSON.stringify(data));
            if (data.status.code !== 200) {
                throw new Error(data.status.message || "No details found.");
            }

            setSelectedDetail(data.data); // Set the single detail object
        } catch (error: any) {
            console.error("Error fetching CX Quotation details:", error);
            setSelectedDetail(null);
        } finally {
            setIsModalOpen(true);
        }
    };

    const handleAddDetail = (id: string) => {
        // Redirect to the add detail page
        router.push(`/transaction/cx-quotation/addcxquodetail?id=${id}`);
    };

    const handlePrintDetail = () => {
        if (selectedDetail) {
            const doc = new jsPDF("portrait", "mm", "a4");
            doc.setFontSize(18);
            doc.text("CX Quotation Detail", 14, 22);
            doc.setFontSize(12);
            doc.text(`Product Name: ${selectedDetail.ProductName}`, 14, 40);
            doc.text(`Quantity: ${selectedDetail.QTY}`, 14, 50);
            doc.text(`Carton Dimensions: ${selectedDetail.CartonP} x ${selectedDetail.CartonL} x ${selectedDetail.CartonT}`, 14, 60);
            doc.text(`Cross Border Fee: ${selectedDetail.CrossBorderFee}`, 14, 70);
            doc.text(`Import Duties: ${selectedDetail.ImportDuties}`, 14, 80);
            doc.text(`Discount and Fees: ${selectedDetail.DiscountAndFees}`, 14, 90);
            doc.text(`CX Cost: ${selectedDetail.CXCost}`, 14, 100);
            doc.text(`Total CX Cost: ${selectedDetail.TotalCXCost}`, 14, 110);
            doc.save(`cx-quotation-detail-${selectedDetail.Id}.pdf`);
        } else {
            alert("No detail available to print.");
        }
    };

    return (
        <div className="container-fluid mt-4">
            <div className="text-center card shadow-lg p-4 rounded">
                <h1>
                    <i className="bi bi-building me-2"></i> CX Quotations
                </h1>
                <p>View and manage your CX quotations here.</p>
                <Link href="/transaction/cx-quotation/addcxquo">
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
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr key={selectedDetail.Id}>
                                                    <td className="fw-bold">1</td>
                                                    <td>{selectedDetail.ProductName}</td>
                                                    <td>{selectedDetail.Variant || "N/A"}</td>
                                                    <td>{selectedDetail.QTY}</td>
                                                    <td>{`${selectedDetail.CartonP} x ${selectedDetail.CartonL} x ${selectedDetail.CartonT}`}</td>
                                                    <td>{selectedDetail.CartonQty}</td>
                                                    <td>{selectedDetail.EstimatedCBMTotal}</td>
                                                    <td>{selectedDetail.CrossBorderFee}</td>
                                                    <td>{selectedDetail.ImportDuties}</td>
                                                    <td>{selectedDetail.DiscountAndFees}</td>
                                                    <td>{selectedDetail.CXCost}</td>
                                                    <td>{selectedDetail.TotalCXCost}</td>
                                                    <td>{new Date(selectedDetail.createdAt).toLocaleString()}</td>
                                                    <td>{new Date(selectedDetail.updatedAt).toLocaleString()}</td>
                                                </tr>
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