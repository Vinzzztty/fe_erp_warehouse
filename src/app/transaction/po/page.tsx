"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PurchaseOrderDetail {
    Id: number;
    POId: number;
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
        if (!confirm("Are you sure you want to delete this Purchase Order?")) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/purchase-orders/${code}`,
                { method: "DELETE" }
            );
            if (!response.ok) throw new Error("Failed to delete Purchase Order.");

            setPOList((prev) => prev.filter((po: any) => po.Code !== code));
            alert("Purchase Order deleted successfully.");
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleDeleteDetail = async (code: string) => {
        if (!confirm("Are you sure you want to delete this Purchase Order detail?")) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/purchase-order-details/${code}`,
                { method: "DELETE" }
            );
            if (!response.ok) throw new Error("Failed to delete Purchase Order detail.");

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
        } finally {
            setLoadingDetail(false);
            setIsModalLoading(false);
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="container mt-4">
            <h1>
                <i className="bi bi-cart me-2"></i> Purchase Order
            </h1>
            <p>View and manage your purchase orders here.</p>
                            <Link href="/transaction/po/addpo">
                                <button className="btn btn-primary">Add PO</button>
                            </Link>

            <div className="mt-5">
                <h2>Purchase Orders</h2>
                {loadingPO && <p>Loading Purchase Orders...</p>}
                {errorPO && <p className="text-danger">{errorPO}</p>}
                {!loadingPO && !errorPO && POList.length === 0 && <p>No Purchase Orders found.</p>}
                {!loadingPO && !errorPO && POList.length > 0 && (
                    <table className="table table-bordered mt-3">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Date</th>
                                <th>Supplier</th>
                                <th>Notes</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {POList.map((po: any) => (
                                <tr key={po.Code}>
                                    <td>{po.Code}</td>
                                    <td>{po.Date}</td>
                                    <td>{po.SupplierId}</td>
                                    <td>{po.Notes}</td>
                                    <td>
                                        <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(po.Code)}>
                                            Edit
                                        </button>
                                        <button className="btn btn-danger btn-sm me-2" onClick={() => handleDelete(po.Code)}>
                                            Delete
                                        </button>
                                        <button className="btn btn-info btn-sm" onClick={() => handleDetails(po.Code)}>
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
                <div className="modal show" style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Purchase Order Detail</h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body">
                                {isModalLoading ? <p>Loading details...</p> : selectedDetail ? (
                                    <>
                                        <p><strong>Product Name:</strong> {selectedDetail.ProductName}</p>
                                        <p><strong>SKU Code:</strong> {selectedDetail.SKUCode}</p>
                                    </>
                                ) : <p>No details available.</p>}
                            </div>
                            <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={handleCloseModal}>
                                    Close
                                </button>
                                <button
                                    className="btn btn-primary"
                                    
                                    onClick={() => {
                                        
                                            handleEditDetail(selectedDetail?.Id?.toString() || '');
                                        
                                    }}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDeleteDetail(selectedDetail?.Id?.toString() || '')}
                                >
                                    Delete
                                </button>
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleAddDetail(poCode)}
                                >
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
