"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CxInvoice {
    Code: number;
    Date: string;
    ForwarderId: number;
    Notes: string;
    Status: string;
    createdAt: string;
    updatedAt: string;
}

interface CxInvoiceDetail {
    Id: number;
    TransaksiCxInvoiceId: number;
    CXCode: number;
    AWB: string;
    FreightCode: string;
    Rate: number;
    CXCostRupiah: number;
    CXCostRMB: number;
    FinalCBM: number;
    PaymentRupiah: number;
    PaymentRMB: number | null;
    RemainingPaymentRupiah: number;
    RemainingPaymentRMB: number;
    TotalPaymentRupiah: number;
    createdAt: string;
    updatedAt: string;
}

export default function CXInvoice() {
    const [cxInvoices, setCxInvoices] = useState<CxInvoice[]>([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [errorCompanies, setErrorCompanies] = useState<string | null>(null);
    const [selectedDetail, setSelectedDetail] = useState<CxInvoiceDetail[]>([]); // Single detail object
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const [cxCode, setCxCode] = useState<string>("");

    useEffect(() => {
        const fetchCxInvoices = async () => {
            setLoadingCompanies(true);
            setErrorCompanies(null);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-invoices`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch CX invoices.");
                }
                const data = await response.json();
                if (data.status.code !== 200) {
                    throw new Error(data.status.message || "Failed to fetch CX Invoices.");
                }
                setCxInvoices(data.data);
                console.log("Fetched CX Invoices:", data.data);
            } catch (error: any) {
                setErrorCompanies(error.message || "An unexpected error occurred.");
            } finally {
                setLoadingCompanies(false);
            }
        };

        fetchCxInvoices();
    }, []);

    const handleEdit = (id: string) => {
        router.push(`/transaction/cx-invoice/editcxinvoice?id=${id}`);
    };
    const handleEditDetail = (id: string) => {
        router.push(`/transaction/cx-invoice/editcxinvoicedetail?id=${id}`);
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = confirm("Are you sure you want to delete this CX Invoice?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-invoices/${id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete CX Invoice.");
            }

            // Update state to remove deleted item
            setCxInvoices((prev) => prev.filter((invoice) => invoice.Code !== Number(id)));
            alert("CX Invoice deleted successfully.");
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };
    const handleDeleteDetail = async (id: string) => {
        const confirmDelete = confirm("Are you sure you want to delete this CX Quotation?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-invoice-details/${id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete CX Quotation.");
            }

            setCxInvoices((prev) => prev.filter((quotation) => quotation.Code !== Number(id)));
            alert("CX Invoice deleted successfully.");
            router.push(`/transaction/cx-invoice/`);
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };
    const handleAddDetail = (id: string) => {
        // Redirect to the add detail page
        router.push(`/transaction/cx-invoice/addcxinvoicedetail?id=${id}`);
    };

    const handleDetails = async (id: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-invoice-details/by-transaksi-cx-invoice/${id}`
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
            console.log("ID:", cxCode.toString());
        } catch (error: any) {
            console.error("Error fetching CX Quotation details:", error);
            setSelectedDetail([]);
            setCxCode(id.toString());
            console.log("ID:", cxCode.toString());
        } finally {
            setIsModalOpen(true);
            setCxCode(id.toString());
            console.log("ID:", cxCode.toString());
        }
    };
    const handlePrintDetail = () => {
        const doc = new jsPDF("landscape", "mm", "a4");
        doc.setFontSize(18);
        doc.text("CX Invoice Details", 14, 22);
        doc.setFontSize(12);
        doc.text(`Invoice Code: ${selectedDetail[0]?.TransaksiCxInvoiceId}`, 14, 40);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 50);
    
        const headers = [
            "CX Code",
            "AWB",
            "Freight Code",
            "Rate",
            "Final CBM",
            "CX Cost (Rupiah)",
            "CX Cost (RMB)",
            "Payment (Rupiah)",
            "Payment (RMB)",
            "Remaining Payment (Rupiah)",
            "Remaining Payment (RMB)",
            "Total Payment (Rupiah)",
            
        ];
    
        const tableData = selectedDetail.map((detail) => [
            detail.CXCode,
            detail.AWB,
            detail.FreightCode,
            detail.Rate,
            detail.FinalCBM || "N/A", // Handle null values
            detail.CXCostRupiah,
            detail.CXCostRMB,
            detail.PaymentRupiah,
            detail.PaymentRMB || "N/A", // Handle null values
            detail.RemainingPaymentRupiah,
            detail.RemainingPaymentRMB || "N/A",
            detail.TotalPaymentRupiah, // Handle null values
            
        ]);
    
        autoTable(doc, {
            startY: 60,
            head: [headers],
            body: tableData,
            theme: "grid",
            margin: { left: 14 },
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
    
        // Calculate total payment
        const totalPayment = selectedDetail.reduce((total, detail) => {
            return total + detail.TotalPaymentRupiah;
        }, 0);
    
        // Add total payment text at the bottom right corner
        const pageHeight = doc.internal.pageSize.height;
        const totalPaymentText = `Total Payment (Rupiah): ${totalPayment.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}`;
        const textWidth = doc.getTextWidth(totalPaymentText);
        const xPosition = doc.internal.pageSize.width - textWidth - 14; // 14 is the left margin
        const yPosition = pageHeight - 80; // Adjust as needed
    
        doc.text(totalPaymentText, xPosition, yPosition);
    
        // Save PDF
        doc.save(`cx-invoice-detail-${selectedDetail[0]?.TransaksiCxInvoiceId}.pdf`);
    };

    return (
        <div className="container-fluid mt-4">
            <div className="text-center card shadow-lg p-4 rounded">
                <h1>
                    <i className="bi bi-building me-2"></i> CX Invoice
                </h1>
                <p>View and manage your CX invoices here.</p>
                <Link href="/transaction/cx-invoice/addcxinvoice">
                    <button className="btn btn-dark">Add CX Invoice</button>
                </Link>
            </div>

            <div className="card shadow-lg p-4 rounded mt-4">
                <p className="mb-4 fw-bold">CX Invoices</p>
                {loadingCompanies && <p>Loading CX Invoices...</p>}
                {errorCompanies && <p className="text-danger">{errorCompanies}</p>}
                {!loadingCompanies && !errorCompanies && cxInvoices.length === 0 && <p>No CX Invoices found.</p>}
                {!loadingCompanies && !errorCompanies && cxInvoices.length > 0 && (
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered table-hover align-middle text-center">
                            <thead className="table-dark">
                                <tr>
                                    <th>No</th>
                                    <th>Date</th>
                                    <th>Forwarder ID</th>
                                    <th>Notes</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cxInvoices.map((invoice, index) => (
                                    <tr key={invoice.Code}>
                                        <td className="fw-bold">{index + 1}</td>
                                        <td>{invoice.Date}</td>
                                        <td>{invoice.ForwarderId}</td>
                                        <td>{invoice.Notes || "N/A"}</td>
                                        <td>
                                            <span className={`badge ${invoice.Status === "Paid" ? "bg-success" : "bg-secondary"}`}>
                                                {invoice.Status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() => handleEdit(invoice.Code.toString())}
                                            >
                                                <i className="bi bi-pencil-square"></i> Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm me-2"
                                                onClick={() => handleDelete(invoice.Code.toString())}
                                            >
                                                <i className="bi bi-trash"></i> Delete
                                            </button>
                                            <button
                                                className="btn btn-info btn-sm"
                                                onClick={() => handleDetails(invoice.Code.toString())}
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
                                <h5 className="modal-title">CX Invoice Details</h5>
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
                                                    <th>Transaksi CX Invoice ID</th>
                                                    <th>CX Code</th>
                                                    <th>AWB</th>
                                                    <th>Freight Code</th>
                                                    <th>FinalCBM</th>
                                                    <th>Rate</th>
                                                    <th>CX Cost (Rupiah)</th>
                                                    <th>CX Cost (RMB)</th>
                                                    <th>Payment (Rupiah)</th>
                                                    <th>Payment (RMB)</th>
                                                    <th>Remaining Payment (Rupiah)</th>
                                                    <th>Remaining Payment(RMB)</th>
                                                    <th>Total Payment</th>
                                                    <th>Action</th> {/* New Action Column */}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                    {selectedDetail.length > 0 ? (
                                                        selectedDetail.map((detail, index) => (
                                                            <tr key={detail.Id}>
                                                                <td className="fw-bold">{index + 1}</td>
                                                                <td>{detail.TransaksiCxInvoiceId}</td>
                                                                <td>{detail.CXCode || "N/A"}</td>
                                                                <td>{detail.AWB}</td>
                                                                <td>{detail.FreightCode}</td>
                                                                <td>{detail.FinalCBM}</td>
                                                                <td>{detail.Rate}</td>
                                                                <td>{detail.CXCostRupiah}</td>
                                                                <td>{detail.CXCostRMB}</td>
                                                                <td>{detail.PaymentRupiah}</td>
                                                                <td>{detail.PaymentRMB}</td>
                                                                <td>{detail.RemainingPaymentRupiah}</td>
                                                                <td>{detail.RemainingPaymentRMB}</td>
                                                                <td>{detail.TotalPaymentRupiah}</td>
                                                             
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
                                    <p>No details available for this CX Invoice.</p>
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