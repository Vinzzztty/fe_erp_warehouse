"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditProformaInvoiceDetail() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id"); // Get `id` from query parameters

    const [formData, setFormData] = useState({
        QTYApproved: 0,
        UnitPriceApproved: 0.0,
        CartonQty: 0,
    });

    const fetchDetail = async () => {
        if (!id) return; // Ensure `id` is available
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoice-details/${id}`
            );
            if (!response.ok) throw new Error("Failed to fetch data.");

            const data = await response.json();
            console.log("Fetched Proforma Invoice Detail:", data.data);
            setFormData({
                QTYApproved: data.data.QTYApproved,
                UnitPriceApproved: data.data.UnitPriceApproved,
                CartonQty: data.data.CartonQty,
            });
        } catch (error: any) {
            alert(error.message);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoice-details/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to update proforma invoice detail."
                );
            }

            alert("Proforma Invoice Detail updated successfully.");
            router.push("/transaction/pi"); // Redirect back to the proforma invoices list
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    return (
        <div className="container mt-4">
            <h1>Edit Proforma Invoice Detail</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="QTYApproved" className="form-label">
                        QTY Approved
                    </label>
                    <input
                        type="number"
                        id="QTYApproved"
                        name="QTYApproved"
                        className="form-control"
                        value={formData.QTYApproved}
                        onChange={(e) =>
                            setFormData({ ...formData, QTYApproved: +e.target.value })
                        }
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="UnitPriceApproved" className="form-label">
                        Unit Price Approved
                    </label>
                    <input
                        type="number"
                        id="UnitPriceApproved"
                        name="UnitPriceApproved"
                        className="form-control"
                        value={formData.UnitPriceApproved}
                        onChange={(e) =>
                            setFormData({ ...formData, UnitPriceApproved: +e.target.value })
                        }
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="CartonQty" className="form-label">
                        Carton Quantity
                    </label>
                    <input
                        type="number"
                        id="CartonQty"
                        name="CartonQty"
                        className="form-control"
                        value={formData.CartonQty}
                        onChange={(e) =>
                            setFormData({ ...formData, CartonQty: +e.target.value })
                        }
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    Save Changes
                </button>
            </form>
        </div>
    );
}
