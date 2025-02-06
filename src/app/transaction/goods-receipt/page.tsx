"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Forwarder {
    Id: number;
    Name: string;
}

interface Warehouse {
    Id: number;
    Name: string;
}

interface GoodsReceipt {
    Code: number;
    Date: string;
    Forwarder: Forwarder; // Change from ForwarderId to Forwarder object
    LMCode: number;
    Warehouse: Warehouse; // Change from WarehouseId to Warehouse object
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
    GoodsReceipt: GoodsReceipt; // Now GoodsReceipt contains Forwarder & Warehouse
}

export default function GoodsReceiptPage() {
    const [goodsReceipts, setGoodsReceipts] = useState([]);
    const [selectedDetails, setSelectedDetails] = useState<
        GoodsReceiptDetail[]
    >([]); // Updated to array
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
                    throw new Error(
                        data.status.message || "Failed to fetch Goods Receipts."
                    );
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
        const confirmDelete = confirm(
            "Are you sure you want to delete this GR detail?"
        );
        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/goods-receipt-detils/${code}`,
                {
                    method: "DELETE",
                }
            );

            const responseData = await response.json();
            console.log("DELETE Response:", responseData);

            if (!response.ok) {
                throw new Error(
                    responseData.message ||
                        "Failed to delete goods-receipt detail."
                );
            }

            setGoodsReceipts((prev) =>
                prev.filter((purchase: any) => purchase.Code !== code)
            );
            alert("Goods Receipt detail deleted successfully.");
            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Error deleting:", error);
            alert(error.message || "An unexpected error occurred.");
        }
    };

    const handleDelete = async (code: string) => {
        const confirmDelete = confirm(
            "Are you sure you want to delete this goods receipt?"
        );
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
                throw new Error(
                    errorData.message || "Failed to delete goods receipt."
                );
            }

            setGoodsReceipts((prev) =>
                prev.filter((gr: any) => gr.Code !== code)
            );
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
        setGrCode(code);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/goods-receipt-detils/by-goods-receipt/${code}`
            );

            if (!response.ok) {
                const errorData = await response.json();

                // Handle 404 case (No details found)
                if (errorData.status.code === 404) {
                    setSelectedDetails([]); // Store empty array
                    setErrorDetail("No details found for this Goods Receipt.");
                    setIsModalOpen(true);
                    return;
                }

                throw new Error(
                    errorData.status.message ||
                        "Failed to fetch goods receipt details."
                );
            }

            const data: { data: GoodsReceiptDetail[] } = await response.json(); // Ensure TypeScript knows it's an array

            if (!data.data || data.data.length === 0) {
                setSelectedDetails([]); // Empty array
                setErrorDetail("No details available for this Goods Receipt.");
            } else {
                setSelectedDetails(data.data); // Store all details in an array
            }

            setIsModalOpen(true);
        } catch (error: any) {
            setErrorDetail(error.message || "An unexpected error occurred.");
            setSelectedDetails([]); // Ensure empty array on error
            setIsModalOpen(true);
        } finally {
            setLoadingDetail(false);
            setIsModalLoading(false);
        }
    };

    // Function to generate PDF
    const generatePDF = () => {
        if (selectedDetails.length > 0) {
            const doc = new jsPDF("landscape", "mm", "a4");

            // Get first detail for general GR information
            const firstDetail = selectedDetails[0];
            const gr = firstDetail.GoodsReceipt;

            // Page Width for Positioning
            const pageWidth = doc.internal.pageSize.getWidth();
            const rightAlignX = pageWidth - 20; // Align text to the right margin
            const centerAlignX = pageWidth / 2; // Center position

            // --- Invoice Title (Right-Aligned) ---
            doc.setFontSize(18);
            doc.text("Goods Receipt Invoice", rightAlignX, 20, {
                align: "right",
            });

            // Set font size for the content
            doc.setFontSize(12);
            let yOffset = 40;

            // --- Left Section: Goods Receipt General Information ---
            doc.text(`Goods Receipt Code: ${gr.Code}`, 20, yOffset);
            doc.text(`Date: ${gr.Date}`, 20, yOffset + 10);
            doc.text(
                `Forwarder: ${gr.Forwarder?.Name || "N/A"}`,
                20,
                yOffset + 20
            );
            doc.text(
                `Warehouse: ${gr.Warehouse?.Name || "N/A"}`,
                20,
                yOffset + 30
            );
            doc.text(`Note: ${gr.Note || "N/A"}`, 20, yOffset + 40);

            // --- Right Section: Additional Info ---
            doc.text(
                `Last Mile Tracking: ${firstDetail.LastMileTracking || "N/A"}`,
                centerAlignX,
                yOffset
            );
            doc.text(
                `Freight Code: ${firstDetail.FreightCode || "N/A"}`,
                centerAlignX,
                yOffset + 10
            );
            doc.text(
                `Created At: ${new Date(
                    firstDetail.createdAt
                ).toLocaleString()}`,
                centerAlignX,
                yOffset + 20
            );
            doc.text(
                `Updated At: ${new Date(
                    firstDetail.updatedAt
                ).toLocaleString()}`,
                centerAlignX,
                yOffset + 30
            );

            yOffset += 60;

            // --- Table with Multiple GR Details ---
            const tableHeaders = [
                "Product Name",
                "SKU Code",
                "Ordered Qty",
                "Received Qty",
                "Remaining Qty",
                "Condition",
                "Notes",
            ];

            // Mapping multiple details into the table
            const tableData = selectedDetails.map((detail) => [
                detail.ProductName,
                detail.SKUCode,
                detail.OrderedQty,
                detail.ReceivedQty,
                detail.RemainQty,
                detail.Condition,
                detail.Notes || "N/A",
            ]);

            // Generate the table
            autoTable(doc, {
                startY: yOffset,
                head: [tableHeaders],
                body: tableData,
                theme: "grid",
                margin: { left: 20 },
                tableWidth: "auto",
                styles: {
                    fontSize: 10,
                    cellPadding: 3,
                    lineColor: [0, 0, 0], // Border tabel hitam
                    textColor: [0, 0, 0], // Teks dalam tabel tetap hitam
                },
                headStyles: {
                    fillColor: [0, 0, 0], // Header tabel warna hitam
                    textColor: [255, 255, 255], // Teks header warna putih
                    fontStyle: "bold",
                },
            });

            // Simpan PDF
            doc.save(`goods-receipt-invoice-${gr.Code}.pdf`);
        }
    };

    return (
        <div className="container-fluid mt-4">
            <div className="text-center card shadow-lg p-4 rounded">
                <h1>
                    <i className="bi bi-box me-2"></i> Goods Receipt
                </h1>
                <p>View and manage your goods receipt here.</p>
                <Link href="/transaction/goods-receipt/addgood">
                    <button className="btn btn-dark">Add Goods Receipt</button>
                </Link>
            </div>

            <div className="card shadow-lg p-4 rounded mt-4">
                <p className="mb-4 fw-bold">Goods Receipts</p>
                {loadingGR && <p>Loading Goods Receipts...</p>}
                {errorGR && <p className="text-danger">{errorGR}</p>}
                {!loadingGR && !errorGR && goodsReceipts.length === 0 && (
                    <p>No goods receipts found.</p>
                )}
                {!loadingGR && !errorGR && goodsReceipts.length > 0 && (
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered table-hover align-middle text-center">
                            <thead className="table-dark">
                                <tr>
                                    <th>No</th>
                                    <th>Date</th>
                                    <th>Forwarder ID</th>
                                    <th>Warehouse ID</th>
                                    <th>Notes</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {goodsReceipts.map((gr: any, index: number) => (
                                    <tr key={gr.Code}>
                                        <td className="fw-bold">{index + 1}</td>
                                        <td>{gr.Date}</td>
                                        <td>{gr.Forwarder.Name}</td>
                                        <td>{gr.Warehouse.Name}</td>
                                        <td>{gr.Notes || "N/A"}</td>
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() =>
                                                    handleEdit(gr.Code)
                                                }
                                            >
                                                <i className="bi bi-pencil-square"></i>{" "}
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm me-2"
                                                onClick={() =>
                                                    handleDelete(gr.Code)
                                                }
                                            >
                                                <i className="bi bi-trash"></i>{" "}
                                                Delete
                                            </button>
                                            <button
                                                className="btn btn-info btn-sm"
                                                onClick={() =>
                                                    handleDetails(gr.Code)
                                                }
                                                aria-label="View details for goods receipt"
                                            >
                                                <i className="bi bi-search"></i>{" "}
                                                View Detail
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
                    className="modal fade show d-flex align-items-center justify-content-center"
                    style={{
                        display: "block",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                    }}
                    onClick={() => setIsModalOpen(false)} // Close modal when clicking outside
                >
                    <div
                        className="modal-dialog modal-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Goods Receipt Detail
                                </h5>
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
                                ) : selectedDetails.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped align-middle text-center">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>No</th>
                                                    <th>Product Name</th>
                                                    <th>SKU Code</th>
                                                    <th>Ordered Qty</th>
                                                    <th>Received Qty</th>
                                                    <th>Remaining Qty</th>
                                                    <th>Condition</th>
                                                    <th>Notes</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedDetails.map(
                                                    (detail, index: number) => (
                                                        <tr key={detail.Id}>
                                                            <td className="fw-bold">
                                                                {index + 1}
                                                            </td>
                                                            <td>
                                                                {
                                                                    detail.ProductName
                                                                }
                                                            </td>
                                                            <td>
                                                                {detail.SKUCode}
                                                            </td>
                                                            <td>
                                                                {
                                                                    detail.OrderedQty
                                                                }
                                                            </td>
                                                            <td>
                                                                {
                                                                    detail.ReceivedQty
                                                                }
                                                            </td>
                                                            <td>
                                                                {
                                                                    detail.RemainQty
                                                                }
                                                            </td>
                                                            <td>
                                                                {
                                                                    detail.Condition
                                                                }
                                                            </td>
                                                            <td>
                                                                {detail.Notes ||
                                                                    "N/A"}
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-warning btn-sm me-2"
                                                                    onClick={() =>
                                                                        router.push(
                                                                            `/transaction/goods-receipt/editgooddetail?id=${detail.Id}`
                                                                        )
                                                                    }
                                                                >
                                                                    <i className="bi bi-pencil-square"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger btn-sm"
                                                                    onClick={() =>
                                                                        handleDeleteDetail(
                                                                            detail.Id.toString()
                                                                        )
                                                                    }
                                                                >
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p>
                                        No details found for this Goods Receipt.
                                    </p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <Link
                                    href={`/transaction/goods-receipt/addgooddetail?id=${grCode}`}
                                >
                                    <button className="btn btn-primary">
                                        <i className="bi bi-plus-square me-2"></i>{" "}
                                        Add Detail
                                    </button>
                                </Link>

                                {selectedDetails.length > 0 && (
                                    <button
                                        className="btn btn-success"
                                        onClick={generatePDF}
                                    >
                                        <i className="bi bi-printer-fill me-2"></i>{" "}
                                        Print Invoice
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
