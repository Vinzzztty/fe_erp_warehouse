"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ProformaInvoiceDetail {
    Id: number;
    ProformaInvoiceId: number;
    SKUCode: string;
    ProductName: string;
    Variant: string | null;
    ProductImage: string | null;
    QTYOrdered: string;
    QTYApproved: string;
    UnitPriceOrdered: string;
    UnitPriceApproved: string;
    FirstMile: string | null;
    CartonP: string;
    CartonL: string;
    CartonT: string;
    CartonQty: string;
    PricePerCarton: string;
    EstimatedCBMTotal: string;
    CartonWeight: string | null;
    MarkingNumber: string | null;
    Credit: string;
    Note: string;
    Total: string;
    createdAt: string;
    updatedAt: string;
    Code?: string;
}

const generatePDF = (selectedDetails: ProformaInvoiceDetail[]) => {
    if (selectedDetails.length > 0) {
        const doc = new jsPDF("landscape", "mm", "a4"); // A4 Landscape
        const pageWidth = doc.internal.pageSize.getWidth();
        let yOffset = 20;

        // --- Header Section ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("PROFORMA INVOICE", pageWidth / 2, yOffset, {
            align: "center",
        });

        doc.setFontSize(12);
        yOffset += 10;
        doc.text(
            `Proforma Invoice ID: ${selectedDetails[0].ProformaInvoiceId}`,
            20,
            yOffset + 6
        );
        doc.text(
            `Updated At: ${new Date(
                selectedDetails[0].updatedAt
            ).toLocaleString()}`,
            20,
            yOffset + 12
        );
        yOffset += 20;

        // --- Table: Ordered Product Details ---
        doc.setFontSize(10);
        doc.text("Ordered Product Details", 20, yOffset);
        yOffset += 5;

        const orderedHeaders = [
            "SKU",
            "Product Name",
            "Variant",
            "First Mile",
            "QTY Ordered",
            "Unit Price",
            "Carton P x L x T",
            "Carton Qty",
            "Price/Carton",
            "Estimated CBM",
            "Carton Weight",
            "Marking No",
            "Credit",
            "Note",
            "Total",
        ];

        const orderedData = selectedDetails.map((detail) => [
            detail.SKUCode,
            detail.ProductName,
            detail.Variant || "N/A",
            `$${Number(detail.FirstMile || 0).toFixed(2)}`,
            detail.QTYOrdered,
            `$${Number(detail.UnitPriceOrdered || 0).toFixed(2)}`,
            `${detail.CartonP} x ${detail.CartonL} x ${detail.CartonT}`,
            detail.CartonQty,
            `$${Number(detail.PricePerCarton || 0).toFixed(2)}`,
            Number(
                ((parseFloat(detail.CartonP) || 0) *
                    (parseFloat(detail.CartonL) || 0) *
                    (parseFloat(detail.CartonT) || 0) *
                    (parseFloat(detail.CartonQty) || 0)) /
                    1000000
            ).toFixed(3), // CBM Calculation Fixed

            detail.CartonWeight || "-",
            detail.MarkingNumber || "-",
            detail.Credit || "-",
            detail.Note || "-",
            `$${Number(detail.Total || 0).toFixed(2)}`,
        ]);

        autoTable(doc, {
            startY: yOffset,
            head: [orderedHeaders],
            body: orderedData,
            theme: "grid",
            margin: { left: 10, right: 10 },
            styles: { fontSize: 7, cellPadding: 3 },
            headStyles: {
                fillColor: [0, 0, 0],
                textColor: [255, 255, 255],
                fontStyle: "bold",
            },
        });

        yOffset = (doc as any).lastAutoTable.finalY + 10;

        // --- Table: Approved Product Details ---
        doc.setFontSize(10);
        doc.text("Approved Product Details", 20, yOffset);
        yOffset += 5;

        const approvedHeaders = [
            "SKU",
            "Product Name",
            "Variant",
            "QTY Approved",
            "Unit Price",
            "Carton P x L x T",
            "Carton Qty",
            "Price/Carton",
            "Estimated CBM",
            "Carton Weight",
            "Marking No",
            "Credit",
            "Note",
            "Total",
        ];

        const approvedData = selectedDetails.map((detail) => [
            detail.SKUCode,
            detail.ProductName,
            detail.Variant || "N/A",
            detail.QTYApproved,
            `$${Number(detail.UnitPriceApproved || 0).toFixed(2)}`,
            `${detail.CartonP} x ${detail.CartonL} x ${detail.CartonT}`,
            detail.CartonQty,
            `$${Number(detail.PricePerCarton || 0).toFixed(2)}`,
            Number(detail.EstimatedCBMTotal || 0).toFixed(3),
            detail.CartonWeight || "-",
            detail.MarkingNumber || "-",
            detail.Credit || "-",
            detail.Note || "-",
            `$${Number(detail.Total || 0).toFixed(2)}`,
        ]);

        autoTable(doc, {
            startY: yOffset,
            head: [approvedHeaders],
            body: approvedData,
            theme: "grid",
            margin: { left: 10, right: 10 },
            styles: { fontSize: 7, cellPadding: 3 },
            headStyles: {
                fillColor: [0, 0, 0],
                textColor: [255, 255, 255],
                fontStyle: "bold",
            },
        });

        yOffset = (doc as any).lastAutoTable.finalY + 20;

        // --- Total Calculation ---
        let totalAmount = selectedDetails.reduce(
            (sum, detail) => sum + Number(detail.Total || 0),
            0
        );
        let totalFirstMile = selectedDetails.reduce(
            (sum, detail) => sum + Number(detail.FirstMile || 0),
            0
        );

        // --- Total Amount Section ---
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(
            `Total Amount: $${totalAmount.toFixed(2)}`,
            pageWidth - 100,
            yOffset
        );
        yOffset += 6;
        doc.text(
            `Total First Mile Cost: $${totalFirstMile.toFixed(2)}`,
            pageWidth - 100,
            yOffset
        );

        // --- Footer ---
        yOffset += 15;
        doc.setFontSize(10);
        doc.text("Thank you for your business!", pageWidth / 2, yOffset, {
            align: "center",
        });

        // Save PDF
        doc.save(
            `proforma-invoice-${
                selectedDetails[0].Code || selectedDetails[0].ProformaInvoiceId
            }.pdf`
        );
    }
};

export default function PIPage() {
    const [Invoice, setInvoice] = useState([]);
    const [selectedDetail, setSelectedDetail] = useState<any[]>([]); // Array instead of single object

    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [errorCompanies, setErrorCompanies] = useState<string | null>(null);
    const [errorDetail, setErrorDetail] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalLoading, setIsModalLoading] = useState(true); // To handle modal loading state
    const router = useRouter();
    const [piCode, setPiCode] = useState<string>(""); // Add a state to store piCode

    useEffect(() => {
        const fetchCompanies = async () => {
            setLoadingCompanies(true);
            setErrorCompanies(null);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoices`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch PI.");
                }
                const data = await response.json();
                if (data.status.code !== 200) {
                    throw new Error(
                        data.status.message || "Failed to fetch PI."
                    );
                }
                setInvoice(data.data);
                console.log("Fetched Proforma Invoice:", data.data);
            } catch (error: any) {
                setErrorCompanies(
                    error.message || "An unexpected error occurred."
                );
            } finally {
                setLoadingCompanies(false);
            }
        };

        fetchCompanies();
    }, []);

    const handleEdit = (code: string) => {
        router.push(`/transaction/pi/editpi?id=${code}`);
    };

    const handleAddDetail = (code: string) => {
        router.push(`/transaction/pi/adddetailpi?id=${code}`);
    };
    const handleEditDetail = (code: string) => {
        router.push(`/transaction/pi/editpidetail?id=${code}`);
    };

    const handleDetails = async (code: string) => {
        setLoadingDetail(true);
        setIsModalLoading(true);
        setErrorDetail(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoice-details/by-proforma-invoice/${code}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch proforma invoice details.");
            }

            const data = await response.json();
            console.log("Fetched Details:", data);

            if (
                !data.data ||
                data.data.length === 0 ||
                data.status.code !== 200
            ) {
                setSelectedDetail([]); // Store an empty array instead of null
                setPiCode(code);
                throw new Error(
                    "No details available for this Proforma Invoice."
                );
            } else {
                setSelectedDetail(data.data); // Store all details as an array
                setPiCode(code);
            }

            setIsModalOpen(true);
        } catch (error: any) {
            setErrorDetail(error.message || "An unexpected error occurred.");
            setSelectedDetail([]); // Ensure it's an empty array instead of null
            setIsModalOpen(true);
            setPiCode(code);
        } finally {
            setLoadingDetail(false);
            setIsModalLoading(false);
            setPiCode(code);
        }
    };

    const handleDelete = async (code: string) => {
        const confirmDelete = confirm(
            "Are you sure you want to delete this proforma invoice?"
        );
        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoices/${code}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to delete proforma invoice."
                );
            }

            setInvoice((prev) =>
                prev.filter((purchase: any) => purchase.Code !== code)
            );
            alert("Proforma invoice deleted successfully.");
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };
    const handleDeleteDetail = async (code: string) => {
        const confirmDelete = confirm(
            "Are you sure you want to delete this proforma invoice?"
        );
        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoice-details/${code}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        "Failed to delete proforma invoice detail."
                );
            }

            setInvoice((prev) =>
                prev.filter((purchase: any) => purchase.Code !== code)
            );
            alert("Proforma invoice deleted successfully.");
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="container-fluid mt-4">
            <div className="text-center card shadow-lg p-4 rounded">
                <h1>
                    <i className="bi bi-building me-2"></i> Proforma Invoice
                </h1>

                <p>View and manage your orders here.</p>
                <Link href="/transaction/pi/addpi">
                    <button className="btn btn-dark">
                        Go to Proforma Invoice
                    </button>
                </Link>
            </div>

            <div className="card shadow-lg p-4 rounded mt-4">
                <p className="mb-4 fw-bold">Proforma Invoice</p>
                {loadingCompanies && <p>Loading PIs...</p>}
                {errorCompanies && (
                    <p className="text-danger">{errorCompanies}</p>
                )}
                {!loadingCompanies &&
                    !errorCompanies &&
                    Invoice.length === 0 && <p>No PIs found.</p>}
                {!loadingCompanies && !errorCompanies && Invoice.length > 0 && (
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered table-hover align-middle text-center">
                            <thead className="table-dark">
                                <tr>
                                    <th>No</th>
                                    <th>Date</th>
                                    <th>PO Number</th>
                                    <th>Supplier Id</th>
                                    <th>Notes</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Invoice.map((purchase: any, index: number) => (
                                    <tr key={purchase.Code}>
                                        <td className="fw-bold">{index + 1}</td>
                                        <td>{purchase.Date}</td>
                                        <td>{purchase.PONumber}</td>
                                        <td>{purchase.Supplier.Name}</td>
                                        <td>{purchase.Notes || "N/A"}</td>
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() =>
                                                    handleEdit(purchase.Code)
                                                }
                                            >
                                                <i className="bi bi-pencil-square"></i>{" "}
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm me-2"
                                                onClick={() =>
                                                    handleDelete(purchase.Code)
                                                }
                                            >
                                                <i className="bi bi-trash"></i>{" "}
                                                Delete
                                            </button>
                                            <button
                                                className="btn btn-info btn-sm"
                                                onClick={() =>
                                                    handleDetails(purchase.Code)
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
                            <div className="modal-header bg-dark text-white">
                                <h5 className="modal-title">
                                    Proforma Invoice Details
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
                                ) : selectedDetail.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped align-middle text-center">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>No</th>
                                                    <th>Product Name</th>
                                                    <th>SKU Code</th>
                                                    <th>Variant</th>
                                                    <th>FirstMile</th>
                                                    <th>QTY Ordered</th>
                                                    <th>QTY Approved</th>
                                                    <th>Unit Price Ordered</th>
                                                    <th>Unit Price Approved</th>
                                                    <th>
                                                        Carton Dimensions (P x L
                                                        x T)
                                                    </th>
                                                    <th>Carton Quantity</th>
                                                    <th>Price Per Carton</th>
                                                    <th>Estimated CBM Total</th>
                                                    <th>Credit</th>
                                                    <th>Note</th>
                                                    <th>Total</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedDetail.map(
                                                    (detail, index) => (
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
                                                                    "N/A"}
                                                            </td>
                                                            <td>
                                                                {detail.FirstMile ||
                                                                    "N/A"}
                                                            </td>
                                                            <td>
                                                                {
                                                                    detail.QTYOrdered
                                                                }
                                                            </td>
                                                            <td>
                                                                {
                                                                    detail.QTYApproved
                                                                }
                                                            </td>
                                                            <td>
                                                                $
                                                                {Number(
                                                                    detail.UnitPriceOrdered ||
                                                                        0
                                                                ).toFixed(2)}
                                                            </td>
                                                            <td>
                                                                $
                                                                {Number(
                                                                    detail.UnitPriceApproved ||
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
                                                                    detail.CartonP *
                                                                        detail.CartonL *
                                                                        detail.CartonT ||
                                                                        0
                                                                ).toFixed(2)}
                                                            </td>
                                                            <td>
                                                                {detail.Credit ||
                                                                    "-"}
                                                            </td>
                                                            <td>
                                                                {detail.Note ||
                                                                    "-"}
                                                            </td>
                                                            <td>
                                                                $
                                                                {Number(
                                                                    detail.Total ||
                                                                        0
                                                                ).toFixed(2)}
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
                                    <p className="text-center text-warning">
                                        No details available for this Proforma
                                        Invoice.
                                    </p>
                                )}
                            </div>
                            <div className="modal-footer d-flex justify-content-between">
                                <div>
                                    <button
                                        className="btn btn-success me-2"
                                        onClick={() => handleAddDetail(piCode)}
                                    >
                                        <i className="bi bi-plus-square me-2"></i>{" "}
                                        Add Detail
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() =>
                                            generatePDF(selectedDetail)
                                        }
                                    >
                                        <i className="bi bi-file-earmark-pdf me-2"></i>{" "}
                                        Download PDF
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
