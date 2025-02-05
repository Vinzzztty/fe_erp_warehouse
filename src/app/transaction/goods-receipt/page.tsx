"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf"; // Import jsPDF


interface GoodsReceipt {
    Code: number;
    Date: string;
    ForwarderId: number;
    LMCode: number;
    WarehouseId: number;
    Note: string | null;
    createdAt: string;
    updatedAt: string;
}

interface GoodsReceiptDetail {
    Id: number;
    GoodsReceiptId: number;
    CXCode: number;
    PICode: number;
    SKUCode: string;
    ProductName: string;
    LastMileTracking: string | null;
    FreightCode: string | null;
    OrderedQty: string;
    ReceivedQty: string;
    RemainQty: string;
    Condition: string;
    Notes: string;
    createdAt: string;
    updatedAt: string;
    GoodsReceipt: GoodsReceipt; // Added GoodsReceipt object
}


export default function GoodsReceiptPage() {
    const [goodsReceipts, setGoodsReceipts] = useState([]);
    const [selectedDetail, setSelectedDetail] = useState<GoodsReceiptDetail | null>(null);
    const [loadingGR, setLoadingGR] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [errorGR, setErrorGR] = useState<string | null>(null);
    const [errorDetail, setErrorDetail] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalLoading, setIsModalLoading] = useState(true);
    const [grCode, setGrCode] = useState<string>("");
    const router = useRouter();

    useEffect(() => {
        const fetchGoodsReceipts = async () => {
            setLoadingGR(true);
            setErrorGR(null);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/goods-receipts`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch Goods Receipts.");
                }
                const data = await response.json();
                if (data.status.code !== 200) {
                    throw new Error(data.status.message || "Failed to fetch Goods Receipts.");
                }
                setGoodsReceipts(data.data);
            } catch (error: any) {
                setErrorGR(error.message || "An unexpected error occurred.");
            } finally {
                setLoadingGR(false);
            }
        };

        fetchGoodsReceipts();
    }, []);

    const handleEdit = (code: string) => {
        router.push(`/transaction/goods-receipt/editgood?id=${code}`);
    };

    const handleDeleteDetail = async (code: string) => {
        const confirmDelete = confirm("Are you sure you want to delete this GR detail ?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/goods-receipts/${code}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete goods-receipt detail.");
            }

            setGoodsReceipts((prev) => prev.filter((purchase: any) => purchase.Code !== code));
            alert("Proforma invoice deleted successfully.");
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    const handleDelete = async (code: string) => {
        const confirmDelete = confirm("Are you sure you want to delete this goods receipt?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/goods-receipts/${code}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete goods receipt.");
            }

            setGoodsReceipts((prev) => prev.filter((gr: any) => gr.Code !== code));
            alert("Goods receipt deleted successfully.");
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    const handleDetails = async (code: string) => {
        setLoadingDetail(true);
        setIsModalLoading(true);
        setErrorDetail(null);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/goods-receipt-detils/by-goods-receipt/${code}`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch goods receipt details.");
            }
            const data = await response.json();
            console.log(data);

            if (data.status.code !== 200 || !data.data || data.data.length === 0) {
                setSelectedDetail(null);
                setGrCode(code);
                throw new Error("No details available for this Goods Receipt.");
            } else {
                setSelectedDetail(data.data[0]);
                setGrCode(code);
            }
            setIsModalOpen(true);
        } catch (error: any) {
            setErrorDetail(error.message || "An unexpected error occurred.");
            setSelectedDetail(null);
            setIsModalOpen(true);
            setGrCode(code);
        } finally {
            setLoadingDetail(false);
            setIsModalLoading(false);
        }
    };

    // Function to generate PDF
    const generatePDF = () => {
        if (selectedDetail) {
            const doc = new jsPDF("landscape", "mm", "a4"); // Landscape orientation
    
            // Title
            doc.setFontSize(18);
            doc.text("Goods Receipt Invoice", 150, 20, );
    
            // Goods Receipt Information
            doc.setFontSize(12);
            const gr = selectedDetail.GoodsReceipt;
    
            doc.text(`Goods Receipt Code: ${gr.Code}`, 20, 40);
            doc.text(`Date: ${gr.Date}`, 20, 50);
            doc.text(`Forwarder ID: ${gr.ForwarderId}`, 20, 60);
            doc.text(`Warehouse ID: ${gr.WarehouseId}`, 20, 70);
            doc.text(`Note: ${gr.Note || "N/A"}`, 20, 80);
    
            // Goods Receipt Detail
            doc.text(`Product Name: ${selectedDetail.ProductName}`, 120, 40);
            doc.text(`SKU Code: ${selectedDetail.SKUCode}`, 120, 50);
            doc.text(`Ordered Qty: ${selectedDetail.OrderedQty}`, 120, 60);
            doc.text(`Received Qty: ${selectedDetail.ReceivedQty}`, 120, 70);
            doc.text(`Remaining Qty: ${selectedDetail.RemainQty}`, 120, 80);
            doc.text(`Condition: ${selectedDetail.Condition}`, 120, 90);
            doc.text(`Notes: ${selectedDetail.Notes}`, 120, 100);
    
            // Additional Info
            doc.text(`Last Mile Tracking: ${selectedDetail.LastMileTracking || "N/A"}`, 20, 120);
            doc.text(`Freight Code: ${selectedDetail.FreightCode || "N/A"}`, 20, 130);
            doc.text(`Created At: ${new Date(selectedDetail.createdAt).toLocaleString()}`, 120, 120);
            doc.text(`Updated At: ${new Date(selectedDetail.updatedAt).toLocaleString()}`, 120, 130);
    
            // Footer
            doc.setFontSize(10);
            
            doc.text(`Goods Receipt ID: ${selectedDetail.GoodsReceiptId}`, 20, 210);
    
            // Save the PDF
            doc.save(`goods-receipt-invoice-${selectedDetail.SKUCode}.pdf`);
        }
    };
    

    return (
        <div className="container mt-4">
            <h1>
                <i className="bi bi-box me-2"></i> Goods Receipt
            </h1>
            <p>View and manage your goods receipt here.</p>

            <div className="row mt-4">
                <div className="col-md-3">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <i
                                className="bi bi-box"
                                style={{ fontSize: "2rem", color: "#6c757d" }}
                            ></i>
                            <h5 className="card-title mt-3">Goods Receipt</h5>
                            <p className="card-text">
                                View and edit goods receipt details.
                            </p>
                            <Link href="/transaction/goods-receipt/addgood">
                                <button className="btn btn-primary">Add Goods Receipt</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-5">
                <h2>Goods Receipts</h2>
                {loadingGR && <p>Loading Goods Receipts...</p>}
                {errorGR && <p className="text-danger">{errorGR}</p>}
                {!loadingGR && !errorGR && goodsReceipts.length === 0 && <p>No goods receipts found.</p>}
                {!loadingGR && !errorGR && goodsReceipts.length > 0 && (
                    <table className="table table-bordered mt-3">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Date</th>
                                <th>Forwarder ID</th>
                                <th>Warehouse ID</th>
                                <th>Notes</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {goodsReceipts.map((gr: any) => (
                                <tr key={gr.Code}>
                                    <td>{gr.Code}</td>
                                    <td>{gr.Date}</td>
                                    <td>{gr.ForwarderId}</td>
                                    <td>{gr.WarehouseId}</td>
                                    <td>{gr.Notes}</td>
                                    <td>
                                        <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={() => handleEdit(gr.Code)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm me-2"
                                            onClick={() => handleDelete(gr.Code)}
                                        >
                                            Delete
                                        </button>
                                        <button
                                            className="btn btn-info btn-sm"
                                            onClick={() => handleDetails(gr.Code)}
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
                                <h5 className="modal-title">Goods Receipt Detail</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setIsModalOpen(false)}
                                ></button>
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
                                        <p><strong>Ordered Qty:</strong> {selectedDetail.OrderedQty}</p>
                                        <p><strong>Received Qty:</strong> {selectedDetail.ReceivedQty}</p>
                                        <p><strong>Remaining Qty:</strong> {selectedDetail.RemainQty}</p>
                                        <p><strong>Condition:</strong> {selectedDetail.Condition}</p>
                                        <p><strong>Notes:</strong> {selectedDetail.Notes}</p>
                                    </div>
                                ) : (
                                    <p>No detail data available for this Goods Receipt.</p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                                    Close
                                </button>
                                <button
                                    className="btn btn-warning"
                                    onClick={() =>
                                        router.push(`/transaction/goods-receipt/editgooddetail?id=${selectedDetail?.Id}`)
                                    }
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDeleteDetail(selectedDetail?.Id?.toString() || "")}
                                >
                                    Delete
                                </button>
                                <Link href={`/transaction/goods-receipt/addgooddetail?id=${grCode}`}>
                                    <button className="btn btn-primary">Add Detail</button>
                                </Link>
                                {/* Print Invoice Button */}
                                <button className="btn btn-success" onClick={generatePDF}>
                                    Print Invoice
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
