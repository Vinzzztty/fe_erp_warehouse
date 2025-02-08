"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
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
    const [POList, setPOList] = useState<PurchaseOrderDetail[]>([]);
    const [selectedDetail, setSelectedDetail] = useState<PurchaseOrderDetail[]>(
        []
    ); // Now an array
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
                if (!response.ok)
                    throw new Error("Failed to fetch Purchase Orders.");

                const data = await response.json();
                if (data.status.code !== 200)
                    throw new Error(data.status.message);

                setPOList(data.data);
            } catch (error: any) {
                setErrorPO(error.message);
            } finally {
                setLoadingPO(false);
            }
        };

        fetchPOs();
    }, []);

    const handleEdit = (code: string) => {
        router.push(`/transaction/po/editpo?id=${code}`);
    };

    const handleAddDetail = (code: string) => {
        router.push(`/transaction/po/addpodetail?id=${code}`);
    };

    const handleEditDetail = (code: string) => {
        router.push(`/transaction/po/editpodetail?id=${code}`);
    };

    const handleDelete = async (code: string) => {
        if (!confirm("Are you sure you want to delete this Purchase Order?"))
            return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/purchase-orders/${code}`,
                { method: "DELETE" }
            );
            if (!response.ok)
                throw new Error("Failed to delete Purchase Order.");

            setPOList((prev) => prev.filter((po: any) => po.Code !== code));
            alert("Purchase Order deleted successfully.");
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleDeleteDetail = async (code: string) => {
        if (
            !confirm(
                "Are you sure you want to delete this Purchase Order detail?"
            )
        )
            return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/purchase-order-details/${code}`,
                { method: "DELETE" }
            );
            if (!response.ok)
                throw new Error("Failed to delete Purchase Order detail.");

            alert("Purchase Order detail deleted successfully.");
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleDetails = async (code: string) => {
        setLoadingDetail(true);
        setIsModalLoading(true);
        setErrorDetail(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/purchase-order-details/by-purchase-order/${code}`
            );

            if (!response.ok)
                throw new Error("Failed to fetch Purchase Order details.");

            const data = await response.json();
            if (
                data.status.code !== 200 ||
                !data.data ||
                data.data.length === 0
            ) {
                throw new Error(
                    "No details available for this Purchase Order."
                );
            }

            setSelectedDetail(data.data); // Store all details, not just one
            setPoCode(code);
        } catch (error: any) {
            setErrorDetail(error.message);
            setSelectedDetail([]); // Empty array instead of null to avoid undefined issues
            setPoCode(code);
        } finally {
            setLoadingDetail(false);
            setIsModalLoading(false);
            setIsModalOpen(true);
        }
    };
    const generatePDF = () => {
        if (selectedDetail.length > 0) {
            const doc = new jsPDF("landscape", "mm", [250, 550]); // A3 landscape
            const pageWidth = doc.internal.pageSize.getWidth();
            const centerX = pageWidth / 2;
            let yOffset = 20;

            // --- Invoice Header ---
            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.text("PURCHASE ORDER DETAILS", centerX, yOffset, {
                align: "center",
            });

            // --- Table with Purchase Order Details ---
            yOffset += 15;
            const tableHeaders = [
                "No",
                "Product Name",
                "SKU",
                "Variant",
                "Qty",
                "Unit Price",
                "Carton P x L x T",
                "Carton Qty",
                "Price/Carton",
                "Est. CBM",
                "Weight",
                "Marking No",
                "Credit",
                "Note",
            ];

            const tableData = selectedDetail.map((detail, index) => [
                index + 1,
                detail.ProductName,
                detail.SKUCode,
                detail.Variant || "-",
                detail.QTY,
                `$${Number(detail.UnitPrice || 0).toFixed(2)}`, // Ensures a number
                `${detail.CartonP} x ${detail.CartonL} x ${detail.CartonT}`,
                detail.CartonQty,
                `$${Number(detail.PricePerCarton || 0).toFixed(2)}`, // Ensures a number
                Number(detail.EstimatedCBMTotal || 0).toFixed(3), // Ensures a number
                detail.CartonWeight || "-",
                detail.MarkingNumber || "-",
                detail.Credit || "-",
                detail.Note || "-",
            ]);

            autoTable(doc, {
                startY: yOffset,
                head: [tableHeaders],
                body: tableData,
                theme: "striped",
                margin: { left: 20, right: 20 },
                styles: { fontSize: 10, cellPadding: 3, lineColor: [0, 0, 0] },
                headStyles: {
                    fillColor: [0, 0, 0],
                    textColor: [255, 255, 255],
                    fontStyle: "bold",
                },
                alternateRowStyles: { fillColor: [240, 240, 240] }, // Alternating row colors
                columnStyles: {
                    0: { cellWidth: 10 }, // No
                    1: { cellWidth: 50 }, // Product Name
                    2: { cellWidth: 40 }, // SKU
                    3: { cellWidth: 25 }, // Variant
                    4: { cellWidth: 20 }, // Qty
                    5: { cellWidth: 25 }, // Unit Price
                    6: { cellWidth: 40 }, // Carton Dimensions
                    7: { cellWidth: 25 }, // Carton Qty
                    8: { cellWidth: 30 }, // Price/Carton
                    9: { cellWidth: 30 }, // Estimated CBM
                    10: { cellWidth: 25 }, // Weight
                    11: { cellWidth: 25 }, // Marking No
                    12: { cellWidth: 25 }, // Credit
                    13: { cellWidth: 35 }, // Note
                },
            });

            // Fix: Get correct Y position after autoTable
            yOffset = (doc as any).lastAutoTable.finalY + 10;

            // --- Total Amount Calculation ---
            let totalAmount = selectedDetail.reduce(
                (sum, detail) =>
                    sum +
                    Number(detail.UnitPrice || 0) * Number(detail.QTY || 0),
                0
            );

            // --- Footer Section ---
            yOffset += 15;
            doc.setFontSize(10);
            doc.text(
                `Total Amount: $${totalAmount.toFixed(2)}`,
                centerX,
                yOffset,
                {
                    align: "center",
                }
            );

            // Save the PDF
            doc.save(
                `purchase-order-${new Date().toISOString().split("T")[0]}.pdf`
            );
        } else {
            console.error("No purchase order details available.");
        }
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsModalOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="container-fluid mt-4">
            <div className="text-center card shadow-lg p-4 rounded">
                <h1>
                    <i className="bi bi-cart me-2"></i> Purchase Order
                </h1>
                <p>View and manage your purchase orders here.</p>
                <Link href="/transaction/po/addpo">
                    <button className="btn btn-dark">Add Purchase Order</button>
                </Link>
            </div>
            <div className="card shadow-lg p-4 rounded mt-4">
                <p className="mb-4 fw-bold">Purchase Orders</p>
                {loadingPO && <p>Loading Purchase Orders...</p>}
                {errorPO && <p className="text-danger">{errorPO}</p>}
                {!loadingPO && !errorPO && POList.length === 0 && (
                    <p>No Purchase Orders found.</p>
                )}
                {!loadingPO && !errorPO && POList.length > 0 && (
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered table-hover align-middle text-center">
                            <thead className="table-dark">
                                <tr>
                                    <th>No</th>
                                    <th>Date</th>
                                    <th>Supplier</th>
                                    <th>Notes</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {POList.map((po: any, index: number) => (
                                    <tr key={po.Code}>
                                        <td className="fw-bold">{index + 1}</td>
                                        <td>{po.Date}</td>
                                        <td>{po.Supplier.Name}</td>
                                        <td>{po.Notes}</td>
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() =>
                                                    handleEdit(po.Code)
                                                }
                                            >
                                                <i className="bi bi-pencil-square"></i>{" "}
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm me-2"
                                                onClick={() =>
                                                    handleDelete(po.Code)
                                                }
                                            >
                                                <i className="bi bi-trash"></i>{" "}
                                                Delete
                                            </button>
                                            <button
                                                className="btn btn-info btn-sm"
                                                onClick={() =>
                                                    handleDetails(po.Code)
                                                }
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
                    className="modal show d-flex align-items-center justify-content-center"
                    style={{
                        display: "block",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                    }}
                >
                    <div className="modal-dialog modal-xl">
                        {" "}
                        {/* Increased size */}
                        <div className="modal-content">
                            <div className="modal-header bg-dark text-white">
                                <h5 className="modal-title">
                                    Purchase Order Details
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setIsModalOpen(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {isModalLoading ? (
                                    <p className="text-center">
                                        Loading details...
                                    </p>
                                ) : selectedDetail.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped align-middle text-center">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>No</th>
                                                    <th>Product</th>
                                                    <th>SKU</th>
                                                    <th>Variant</th>
                                                    <th>Quantity</th>
                                                    <th>Unit Price</th>
                                                    <th>
                                                        Carton Dimension (P x L
                                                        x T)
                                                    </th>
                                                    <th>Carton QTY</th>
                                                    <th>Price/Carton</th>
                                                    <th>Estimated CBM</th>
                                                    <th>Carton Weight</th>
                                                    <th>Marking Number</th>
                                                    <th>Credit</th>
                                                    <th>Note</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedDetail.map(
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
                                                                {detail.Variant ||
                                                                    "-"}
                                                            </td>
                                                            <td>
                                                                {detail.QTY}
                                                            </td>
                                                            <td>
                                                                $
                                                                {Number(
                                                                    detail.UnitPrice ||
                                                                        0
                                                                ).toFixed(2)}
                                                            </td>
                                                            <td>
                                                                {detail.CartonP}{" "}
                                                                x{" "}
                                                                {detail.CartonL}{" "}
                                                                x{" "}
                                                                {detail.CartonT}
                                                            </td>
                                                            <td>
                                                                {
                                                                    detail.CartonQty
                                                                }
                                                            </td>
                                                            <td>
                                                                $
                                                                {Number(
                                                                    detail.PricePerCarton ||
                                                                        0
                                                                ).toFixed(2)}
                                                            </td>
                                                            <td>
                                                                {Number(
                                                                    detail.EstimatedCBMTotal ||
                                                                        0
                                                                ).toFixed(2)}
                                                            </td>
                                                            <td>
                                                                {detail.CartonWeight ??
                                                                    "-"}
                                                            </td>
                                                            <td>
                                                                {detail.MarkingNumber ??
                                                                    "-"}
                                                            </td>
                                                            <td>
                                                                {detail.Credit ??
                                                                    "-"}
                                                            </td>
                                                            <td>
                                                                {detail.Note}
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-primary btn-sm me-2"
                                                                    onClick={() =>
                                                                        handleEditDetail(
                                                                            detail.Id.toString()
                                                                        )
                                                                    }
                                                                >
                                                                    <i className="bi bi-pencil-square me-1"></i>{" "}
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger btn-sm"
                                                                    onClick={() =>
                                                                        handleDeleteDetail(
                                                                            detail.Id.toString()
                                                                        )
                                                                    }
                                                                >
                                                                    <i className="bi bi-trash me-1"></i>{" "}
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-center">
                                        No details available.
                                    </p>
                                )}
                            </div>
                            <div className="modal-footer d-flex justify-content-between">
                                <div>
                                    <button
                                        className="btn btn-success me-2"
                                        onClick={() => handleAddDetail(poCode)}
                                    >
                                        <i className="bi bi-plus-square me-2"></i>{" "}
                                        Add Detail
                                    </button>
                                    <button
                                        className="btn btn-info"
                                        onClick={generatePDF}
                                    >
                                        <i className="bi bi-file-earmark-pdf me-2"></i>{" "}
                                        Generate PDF
                                    </button>
                                </div>
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
