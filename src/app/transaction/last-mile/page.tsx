"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Forwarder {
    Code: number;
    Name: string;
    Notes: string;
    CountryId: number;
    AddressIndonesia: string;
    CoordinateIndonesia: string;
    Department: string;
    ContactMethod: string;
    Description: string;
    BankId: number;
    AccountNumber: number;
    Website: string;
    Wechat: string;
    ShippingMark: string;
    Status: string;
    createdAt: string;
    updatedAt: string;
}

interface LastMile {
    Code: number;
    Date: string;
    ForwarderId: number;
    Note: string;
    createdAt: string;
    updatedAt: string;
    Forwarder: Forwarder;
}

interface LastMileDetail {
    Id: number;
    TransaksiLastMileId: number;
    CXCode: number;
    LastMileTracking: string;
    FreightCode: string;
    WarehouseCode: number;
    WarehouseAddress: string;
    Courier: string;
    ShippingCost: string;
    AdditionalCost: string;
    Subtotal: string;
    Total: string;
    createdAt: string;
    updatedAt: string;
    LastMileId: number | null;
}

export default function Lastmile() {
    const [Lm, setLm] = useState<LastMile[]>([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [errorCompanies, setErrorCompanies] = useState<string | null>(null);
    const [selectedDetail, setSelectedDetail] = useState<LastMileDetail[]>([]); // Now an array
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lmCode, setLmCode] = useState<string>(""); // Tambahkan state untuk lmCode
    const router = useRouter();

    useEffect(() => {
        const fetchLm = async () => {
            setLoadingCompanies(true);
            setErrorCompanies(null);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/last-mile`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch last-mile.");
                }
                const data = await response.json();
                if (data.status.code !== 200) {
                    throw new Error(
                        data.status.message || "Failed to fetch Last-miles."
                    );
                }
                setLm(data.data);
                console.log("Fetched Lms:", data.data);
            } catch (error: any) {
                setErrorCompanies(
                    error.message || "An unexpected error occurred."
                );
            } finally {
                setLoadingCompanies(false);
            }
        };

        fetchLm();
    }, []);

    const handleEdit = (id: string) => {
        router.push(`/transaction/last-mile/editlastmile?id=${id}`);
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = confirm(
            "Are you sure you want to delete this last-mile?"
        );
        if (!confirmDelete) return;
    
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/last-mile/${id}`,
                {
                    method: "DELETE",
                }
            );
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error data:", errorData); // Log error data for debugging
                throw new Error(
                    errorData.message || "Failed to delete last-mile."
                );
            }
    
            // Update state to remove deleted item
            setLm((prev) =>
                prev.filter((purchase: any) => purchase.Code !== Number(id))
            );
            alert("Last-mile deleted successfully.");
            router.push(`/transaction/last-mile`);
        } catch (error: any) {
            console.error("Error occurred:", error); // Log error for debugging
            alert(error.message || "An unexpected error occurred.");
        }
    };

    const handleDetails = async (id: string) => {
        console.log("Selected Last Mile Code:", id); // Tambahkan log untuk memeriksa ID yang dipilih
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/last-mile-details/by-transaksi-last-mile/${id}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch last-mile details.");
            }

            const data = await response.json();
            console.log("Fetched Last Mile Details:", data); // Log data yang diterima

            if (data.status.code !== 200) {
                throw new Error(data.status.message || "No details found.");
            }

            setSelectedDetail(data.data); // Store all details, not just one
            setLmCode(id.toString()); // Simpan lmCode di sini
            setIsModalOpen(true);
        } catch (error: any) {
            console.error("Error fetching last-mile details:", error); // Tambahkan log untuk kesalahan
            setIsModalOpen(true);
            setLmCode(id.toString());
        }
    };

    const handleAddDetail = (id: string) => {
        router.push(`/transaction/last-mile/addlastmiledetail?id=${id}`); // Gunakan lmCode
    };

    const handleEditDetail = (detailId: number) => {
        router.push(`/transaction/last-mile/editlastmiledetail?id=${detailId}`);
    };

    const handleDeleteDetail = async (detailId: number) => {
        const confirmDelete = confirm(
            "Are you sure you want to delete this detail?"
        );
        if (!confirmDelete) return;
    
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/last-mile-details/${detailId}`,
                {
                    method: "DELETE",
                }
            );
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to delete detail."
                );
            }
    
            alert("Detail deleted successfully.");
            // Redirect to the same page to refresh
            router.push(`/transaction/last-mile`);
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    const handlePrintDetail = () => {
        if (selectedDetail.length > 0) {
            const doc = new jsPDF("landscape", "mm", "a4");

            // Page width for positioning
            const pageWidth = doc.internal.pageSize.getWidth();
            const rightAlignX = pageWidth - 20;

            // --- Last Mile Title (Top Right) ---
            doc.setFontSize(18);
            doc.text("Last Mile Details", rightAlignX, 20, { align: "right" });

            doc.setFontSize(12);
            let yOffset = 40;

            // --- Table with Last Mile Details ---
            doc.setFontSize(14);
            doc.text("Last Mile Detail", 20, yOffset);
            yOffset += 10;

            const headers = [
                "No",
                "Tracking Code",
                "Freight Code",
                "Warehouse Address",
                "Courier",
                "Shipping Cost",
                "Additional Cost",
                "Subtotal",
                "Total",
                "Created At",
                "Updated At",
            ];

            const tableData = selectedDetail.map((detail, index) => [
                index + 1,
                detail.LastMileTracking,
                detail.FreightCode,
                detail.WarehouseAddress,
                detail.Courier,
                detail.ShippingCost,
                detail.AdditionalCost,
                detail.Subtotal,
                detail.Total,
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

            // Save PDF
            doc.save(`last-mile-details-${lmCode}.pdf`);
        } else {
            console.error("No last mile details available.");
        }
    };

    return (
        <div className="container-fluid mt-4">
            <div className="text-center card shadow-lg p-4 rounded">
                <h1>
                    <i className="bi bi-truck me-2"></i> Last-mile
                </h1>
                <p>View and manage your last-mile here.</p>
                <Link href="/transaction/last-mile/addlastmile">
                    <button className="btn btn-dark">Add last mile</button>
                </Link>
            </div>

            <div className="card shadow-lg p-4 rounded mt-4">
                <p className="mb-4 fw-bold">Last-miles</p>
                {loadingCompanies && <p>Loading Last-miles...</p>}
                {errorCompanies && (
                    <p className="text-danger">{errorCompanies}</p>
                )}
                {!loadingCompanies && !errorCompanies && Lm.length === 0 && (
                    <p>No found.</p>
                )}
                {!loadingCompanies && !errorCompanies && Lm.length > 0 && (
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
                                {Lm.map((purchase, index) => (
                                    <tr key={purchase.Code}>
                                        <td className="fw-bold">{index + 1}</td>
                                        <td>{purchase.Date}</td>
                                        <td>{purchase.Forwarder.Name}</td>
                                        <td>{purchase.Note || "N/A"}</td>
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() =>
                                                    handleEdit(
                                                        purchase.Code.toString()
                                                    )
                                                }
                                            >
                                                <i className="bi bi-pencil-square"></i>{" "}
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm me-2"
                                                onClick={() =>
                                                    handleDelete(
                                                        purchase.Code.toString()
                                                    )
                                                }
                                            >
                                                <i className="bi bi-trash"></i>{" "}
                                                Delete
                                            </button>
                                            <button
                                                className="btn btn-info btn-sm"
                                                onClick={() =>
                                                    handleDetails(
                                                        purchase.Code.toString()
                                                    )
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
                        {/* Ubah ukuran modal menjadi ekstra besar */}
                        <div className="modal-content">
                            <div className="modal-header bg-dark text-white">
                                <h5 className="modal-title">
                                    Last Mile Details
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setIsModalOpen(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {selectedDetail.length > 0 ? ( // Check if selectedDetail has data
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped align-middle text-center">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>No</th>
                                                    <th>Tracking Code</th>
                                                    <th>Freight Code</th>
                                                    <th>Warehouse Address</th>
                                                    <th>Courier</th>
                                                    <th>Shipping Cost</th>
                                                    <th>Additional Cost</th>
                                                    <th>Subtotal</th>
                                                    <th>Total</th>
                                                    <th>Created At</th>
                                                    <th>Updated At</th>
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
                                                                    detail.LastMileTracking
                                                                }
                                                            </td>
                                                            <td>
                                                                {
                                                                    detail.FreightCode
                                                                }
                                                            </td>
                                                            <td>
                                                                {
                                                                    detail.WarehouseAddress
                                                                }
                                                            </td>
                                                            <td>
                                                                {detail.Courier}
                                                            </td>
                                                            <td>
                                                                $
                                                                {
                                                                    detail.ShippingCost
                                                                }
                                                            </td>
                                                            <td>
                                                                $
                                                                {
                                                                    detail.AdditionalCost
                                                                }
                                                            </td>
                                                            <td>
                                                                $
                                                                {
                                                                    detail.Subtotal
                                                                }
                                                            </td>
                                                            <td>
                                                                ${detail.Total}
                                                            </td>
                                                            <td>
                                                                {new Date(
                                                                    detail.createdAt
                                                                ).toLocaleString()}
                                                            </td>
                                                            <td>
                                                                {new Date(
                                                                    detail.updatedAt
                                                                ).toLocaleString()}
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-primary btn-sm me-2"
                                                                    onClick={() =>
                                                                        handleEditDetail(
                                                                            detail.Id
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
                                                                            detail.Id
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
                                    <p>
                                        No details available for this Last Mile.
                                    </p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-success me-2"
                                    onClick={() => handleAddDetail(lmCode)} // Panggil handleAddDetail
                                >
                                    <i className="bi bi-plus-square me-2"></i>{" "}
                                    Add Detail
                                </button>
                                <button
                                    className="btn btn-info"
                                    onClick={handlePrintDetail}
                                >
                                    <i className="bi bi-printer me-2"></i> Print
                                    Detail
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
