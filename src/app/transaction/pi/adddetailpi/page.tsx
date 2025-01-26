"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function AddProformaInvoiceDetailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [productId, setProductId] = useState(searchParams.get("code") || "");
    const [productData, setProductData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        ProformaInvoiceId: productId,
        SKUCode: "",
        QTYOrdered: 0,
        QTYApproved: 0,
        UnitPriceOrdered: 0,
        UnitPriceApproved: 0,
        CartonP: 0,
        CartonL: 0,
        CartonT: 0,
        CartonQty: 0,
        Credit: 0.0,
        Note: "",
    });

    useEffect(() => {
        if (!productId) return;

        const fetchProductData = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/products/${productId}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch product data.");
                }

                const data = await response.json();
                setProductData(data);

                setFormData((prev) => ({
                    ...prev,
                    SKUCode: data.SKUCode || "",
                    Note: data.Notes || "",
                }));
            } catch (error) {
                console.error("Error fetching product data:", error);
                setError("Could not load product data.");
            }
        };

        fetchProductData();
    }, [productId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoice-details`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to create Proforma Invoice Detail."
                );
            }

            router.push(`/transaction/pi/details?id=${productId}`);
        } catch (error: any) {
            console.error("Error submitting Proforma Invoice Detail:", error);
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Add Proforma Invoice Detail</h1>

            {error && <div className="alert alert-danger mt-4">{error}</div>}

            {productData ? (
                <form onSubmit={handleSubmit} className="mt-4">
                    <div className="mb-3">
                        <label htmlFor="SKUCode" className="form-label">SKU Code</label>
                        <input
                            type="text"
                            id="SKUCode"
                            name="SKUCode"
                            className="form-control"
                            value={formData.SKUCode}
                            readOnly
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="QTYOrdered" className="form-label">Quantity Ordered</label>
                        <input
                            type="number"
                            id="QTYOrdered"
                            name="QTYOrdered"
                            className="form-control"
                            value={formData.QTYOrdered}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    QTYOrdered: parseInt(e.target.value, 10) || 0,
                                })
                            }
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="Note" className="form-label">Notes</label>
                        <textarea
                            id="Note"
                            name="Note"
                            className="form-control"
                            value={formData.Note}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    Note: e.target.value,
                                })
                            }
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Add Detail"}
                    </button>
                </form>
            ) : (
                <p>Loading product data...</p>
            )}
        </div>
    );
}
