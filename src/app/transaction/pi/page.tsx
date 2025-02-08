"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PurchaseOrderDetail {
    Id: number;
    PurchaseOrderId: number;
    SKUCode: string;
    ProductName: string;
    Variant: string | null;
    ProductImage: string | null;
    QTY: string;
    UnitPrice: string;
    FirstMile: string | null;
    CartonP: string;
    CartonL: string;
    CartonT: string;
    CartonQty: string;
    PricePerCarton: string;
    EstimatedCBMTotal: string;
    CartonWeight: string | null;
    MarkingNumber: string | null;
    Credit: string | null;
    Note: string;
    createdAt: string;
    updatedAt: string;
    Code?: string;
}

export default function POPage() {
    const [POList, setPOList] = useState([]);
    const [selectedDetail, setSelectedDetail] = useState<PurchaseOrderDetail | null>(null);
    const [loadingPO, setLoadingPO] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [errorPO, setErrorPO] = useState<string | null>(null);
    const [errorDetail, setErrorDetail] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalLoading, setIsModalLoading] = useState(true);
    const [poCode, setPoCode] = useState<string>("");

    const router = useRouter();

    useEffect(() => {
        const fetchPOs = async () => {
            setLoadingPO(true);
            setErrorPO(null);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/purchase-orders`
                );
                if (!response.ok) throw new Error("Failed to fetch Purchase Orders.");

                const data = await response.json();
                if (data.status.code !== 200) throw new Error(data.status.message);

                setPOList(data.data);
            } catch (error: any) {
                setErrorPO(error.message);
            } finally {
                setLoadingPO(false);
            }
        };

        fetchPOs();
    }, []);

    const handleDetails = async (code: string) => {
        setLoadingDetail(true);
        setIsModalLoading(true);
        setErrorDetail(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/purchase-order-details/by-purchase-order/${code}`
            );
            if (!response.ok) throw new Error("Failed to fetch Purchase Order details.");

            const data = await response.json();
            if (data.status.code !== 200 || !data.data || data.data.length === 0) {
                throw new Error("No details available for this Purchase Order.");
            }

            setSelectedDetail(data.data[0]);
            setPoCode(code);
        } catch (error: any) {
            setErrorDetail(error.message);
            setSelectedDetail(null);
            setPoCode(code);
        } finally {
            setLoadingDetail(false);
            setIsModalLoading(false);
            setIsModalOpen(true);
        }
    };

    const generatePDF = () => {
        if (selectedDetail) {
            const doc = new jsPDF("landscape", "mm", "a4");

            // Page Width for Positioning
            const pageWidth = doc.internal.pageSize.getWidth();
            const rightAlignX = pageWidth - 20; // Align text to the right margin
            const centerAlignX = pageWidth / 2; // Center position

            // --- Invoice Title (Right-Aligned) ---
            doc.setFontSize(18);
            doc.text("Purchase Order Detail", rightAlignX, 20, { align: "right" });

            // Set font size for the content
            doc.setFontSize(12);
            let yOffset = 40;

            // --- General Information ---
            doc.text(`Product Name: ${selectedDetail.ProductName}`, 20, yOffset);
            doc.text(`SKU Code: ${selectedDetail.SKUCode}`, 20, yOffset + 10);
            doc.text(`Quantity: ${selectedDetail.QTY}`, 20, yOffset + 20);
            doc.text(`Unit Price: $${selectedDetail.UnitPrice}`, 20, yOffset + 30);
            doc.text(`Note: ${selectedDetail.Note}`, 20, yOffset + 40);

            yOffset += 60;

            // --- Table with Purchase Order Details ---
            const tableHeaders = [
                "Product Name",
                "SKU Code",
                "Quantity",
                "Unit Price",
                "Note",
            ];

            const tableData = [
                [
                    selectedDetail.ProductName,
                    selectedDetail.SKUCode,
                    selectedDetail.QTY,
                    `$${selectedDetail.UnitPrice}`,
                    selectedDetail.Note,
                ],
            ];

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
            doc.save(`purchase-order-detail-${selectedDetail.Id}.pdf`);
        }
    };

    return (
        <div className="container-fluid mt-4">
            {/* ... other components ... */}
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
                            <div className="modal-header">
                                <h5 className="modal-title">Purchase Order Detail</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setIsModalOpen(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {isModalLoading ? (
                                    <p>Loading details...</p>
                                ) : selectedDetail ? (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped align-middle text-center">
                                            <thead className="table-primary">
                                                <tr>
                                                    <th>Product</th>
                                                    <th>SKU</th>
                                                    <th>Quantity</th>
                                                    <th>Unit Price</th>
                                                    <th>Note</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>{selectedDetail.ProductName}</td>
                                                    <td>{selectedDetail.SKUCode}</td>
                                                    <td>{selectedDetail.QTY}</td>
                                                    <td>${selectedDetail.UnitPrice}</td>
                                                    <td>{selectedDetail.Note}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p>No details available.</p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        // Edit detail logic
                                    }}
                                >
                                    <i className="bi bi-pencil-square me-2"></i> Edit
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => {
                                        // Delete detail logic
                                    }}
                                >
                                    <i className="bi bi-trash me-2"></i> Delete
                                </button>
                                <button
                                    className="btn btn-success"
                                    onClick={generatePDF}
                                >
                                    <i className="bi bi-file-earmark-pdf me-2"></i> Print PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}