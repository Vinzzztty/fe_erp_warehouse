"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function POPage() {
    const [Invoice, setInvoice] = useState([]);
    const [selectedDetail, setSelectedDetail] =
        useState<ProformaInvoiceDetail | null>(null);
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
        setIsModalLoading(true); // Set the modal to loading state
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
                data.status.code !== 200 ||
                !data.data ||
                data.data.length === 0
            ) {
                setSelectedDetail(null); // Set to null when no details are available
                setSelectedDetail(null); // Set to null when no details are available
                setPiCode(code); // Store piCode in state
                throw new Error(
                    "No details available for this Proforma Invoice."
                );
            } else {
                setSelectedDetail(data.data[0]); // Set the first detail as the selected detail
                setPiCode(code); // Store piCode in state
            }
            setIsModalOpen(true); // Open modal even when there's no data
        } catch (error: any) {
            setErrorDetail(error.message || "An unexpected error occurred.");
            setSelectedDetail(null); // Set to null if there's an error
            setIsModalOpen(true); // Ensure modal opens on error as well
            setPiCode(code); // Store piCode in state
        } finally {
            setLoadingDetail(false);
            setIsModalLoading(false); // Set the modal to data state
            setPiCode(code); // Store piCode in state
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
                    errorData.message || "Failed to delete purchase order."
                );
            }

            setInvoice((prev) =>
                prev.filter((purchase: any) => purchase.Code !== code)
            );
            alert("Purchase order deleted successfully.");
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
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Proforma Invoice Detail
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
                                ) : selectedDetail ? (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped align-middle text-center">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>Product Name</th>
                                                    <th>SKU Code</th>
                                                    <th>Variant</th>
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
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        {
                                                            selectedDetail.ProductName
                                                        }
                                                    </td>
                                                    <td>
                                                        {selectedDetail.SKUCode}
                                                    </td>
                                                    <td>
                                                        {selectedDetail.Variant ||
                                                            "N/A"}
                                                    </td>
                                                    <td>
                                                        {
                                                            selectedDetail.QTYOrdered
                                                        }
                                                    </td>
                                                    <td>
                                                        {
                                                            selectedDetail.QTYApproved
                                                        }
                                                    </td>
                                                    <td>
                                                        {
                                                            selectedDetail.UnitPriceOrdered
                                                        }
                                                    </td>
                                                    <td>
                                                        {
                                                            selectedDetail.UnitPriceApproved
                                                        }
                                                    </td>
                                                    <td>
                                                        {selectedDetail.CartonP}{" "}
                                                        x{" "}
                                                        {selectedDetail.CartonL}{" "}
                                                        x{" "}
                                                        {selectedDetail.CartonT}
                                                    </td>
                                                    <td>
                                                        {
                                                            selectedDetail.CartonQty
                                                        }
                                                    </td>
                                                    <td>
                                                        {
                                                            selectedDetail.PricePerCarton
                                                        }
                                                    </td>
                                                    <td>
                                                        {
                                                            selectedDetail.EstimatedCBMTotal
                                                        }
                                                    </td>
                                                    <td>
                                                        {selectedDetail.Credit}
                                                    </td>
                                                    <td>
                                                        {selectedDetail.Note}
                                                    </td>
                                                    <td>
                                                        {selectedDetail.Total}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p>
                                        No detail data available for this
                                        Proforma Invoice.
                                    </p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-primary"
                                    onClick={() =>
                                        router.push(
                                            `/transaction/proforma-invoice/edit?id=${selectedDetail?.Id}`
                                        )
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
                                    onClick={() => handleAddDetail(piCode)}
                                >
                                    <i className="bi bi-plus-square me-2"></i>{" "}
                                    Add Detail
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
