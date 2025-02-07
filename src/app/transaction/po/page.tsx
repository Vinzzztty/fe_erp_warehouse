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
    const [POList, setPOList] = useState([]);
    const [selectedDetail, setSelectedDetail] =
        useState<PurchaseOrderDetail | null>(null);
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
            setPoCode(code);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const generatePDF = () => {
        if (selectedDetail) {
            // Create a PDF document with a wider page size (e.g., A3 landscape)
            const doc = new jsPDF("landscape", "mm", [250, 550]); // A3 landscape
    
            // Page Width for Positioning
            const pageWidth = doc.internal.pageSize.getWidth();
            const rightAlignX = pageWidth - 20; // Align text to the right margin
    
            // --- Invoice Title (Right-Aligned) ---
            doc.setFontSize(18);
            doc.text("Purchase Order Detail", rightAlignX, 20, { align: "right" });
    
            // Set font size for the content
            doc.setFontSize(12);
            let yOffset = 40;
    
            // --- Detail Information ---
            doc.text(`SKU Code: ${selectedDetail.SKUCode}`, 20, yOffset);
            doc.text(`Product Name: ${selectedDetail.ProductName}`, 20, yOffset + 10);
            doc.text(`Variant: ${selectedDetail.Variant}`, 20, yOffset + 20);
            
            // If you have a product image, you can add it here
            // Example: doc.addImage(selectedDetail.ProductImage, 'JPEG', 20, yOffset + 30, 40, 40);
            
            doc.text(`Credit: ${selectedDetail.Credit}`, 20, yOffset + 30);
            doc.text(`Note: ${selectedDetail.Note}`, 20, yOffset + 40);
    
            yOffset += 60; // Adjust yOffset for the table
    
            // --- Table with Purchase Order Details ---
            const tableHeaders = [
                "Product Name", 
                "SKU Code", 
                "Variant", 
                "Quantity", 
                "Unit Price", 
                "First Mile", 
                "Carton Dimension (P)", 
                "Carton Dimension (L)", 
                "Carton Dimension (T)", 
                "Carton Qty", 
                "Price per Carton", 
                "Estimated CBM Total", 
                "Carton Weight", 
                "Marking Number", 
                "Credit", 
                "Note"
            ];
            
            const tableData = [[
                selectedDetail.ProductName,
                selectedDetail.SKUCode,
                selectedDetail.Variant,
                selectedDetail.QTY,
                `$${selectedDetail.UnitPrice}`,
                selectedDetail.FirstMile,
                selectedDetail.CartonP,
                selectedDetail.CartonL,
                selectedDetail.CartonT,
                selectedDetail.CartonQty,
                `$${selectedDetail.PricePerCarton}`,
                selectedDetail.EstimatedCBMTotal,
                selectedDetail.CartonWeight,
                selectedDetail.MarkingNumber,
                selectedDetail.Credit,
                selectedDetail.Note
            ]];
    
            // Generate the table with specified column widths
            autoTable(doc, {
                startY: yOffset,
                head: [tableHeaders],
                body: tableData,
                theme: "grid",
                margin: { left: 20 },
                tableWidth: "auto",
                columnStyles: {
                    0: { cellWidth: 60 }, // Product Name
                    1: { cellWidth: 40 }, // SKU Code
                    2: { cellWidth: 25 }, // Variant
                    3: { cellWidth: 25 }, // Quantity
                    4: { cellWidth: 30 }, // Unit Price
                    5: { cellWidth: 25 }, // First Mile
                    6: { cellWidth: 30 }, // Carton Dimension (P)
                    7: { cellWidth: 30 }, // Carton Dimension (L)
                    8: { cellWidth: 30 }, // Carton Dimension (T)
                    9: { cellWidth: 25 }, // Carton Qty
                    10: { cellWidth: 30 }, // Price per Carton
                    11: { cellWidth: 30 }, // Estimated CBM Total
                    12: { cellWidth: 30 }, // Carton Weight
                    13: { cellWidth: 30 }, // Marking Number
                    14: { cellWidth: 30 }, // Credit
                    15: { cellWidth: 30 }  // Note
                },
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
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Purchase Order Detail
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
                                ) : selectedDetail ? (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped align-middle text-center">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Product</th>
                                            <th>SKU</th>
                                            <th>Variant</th>
                                            <th>Quantity</th>
                                            <th>Unit Price</th>
                                            <th>Carton Dimention</th>
                                            <th>Carton QTY</th>
                                            <th>Price/Carton</th>
                                            <th>Note</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{selectedDetail.ProductName}</td>
                                            <td>{selectedDetail.SKUCode}</td>
                                            <td>{selectedDetail.Variant || "-"}</td>
                                            <td>{selectedDetail.QTY}</td>
                                            <td>${selectedDetail.UnitPrice}</td>
                                            <td>{selectedDetail.CartonP} x {selectedDetail.CartonL} x {selectedDetail.CartonT}</td>
                                            <td>{selectedDetail.CartonQty}</td>
                                            <td>${selectedDetail.PricePerCarton}</td>
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
                                    onClick={() =>
                                        handleEditDetail(selectedDetail?.Id?.toString() || "")
                                    }
                                >
                                    <i className="bi bi-pencil-square me-2"></i>{" "}
                                    Edit
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() =>
                                        handleDeleteDetail(
                                            selectedDetail?.Id?.toString() || ""
                                        )
                                    }
                                >
                                    <i className="bi bi-trash me-2"></i>Delete
                                </button>
                                <button
                                    className="btn btn-success"
                                    onClick={() => {
                                        console.log("poCode before adding detail:", poCode);
                                        handleAddDetail(poCode);
                                    }}
                                >
                                    <i className="bi bi-plus-square me-2"></i> Add Detail
                                </button>
                               
                                <button
                                    className="btn btn-info"
                                    onClick={generatePDF}
                                >
                                    <i className="bi bi-file-earmark-pdf me-2"></i> Generate PDF
                                </button>
                                

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
