"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function EditPurchaseOrder() {
    const router = useRouter();
    const { id } = router.query;

    const [formData, setFormData] = useState({
        Date: "",
        Notes: "",
    });

    const fetchPurchaseOrder = async () => {
        if (!id) return;
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/purchase-orders/${id}`
            );
            if (!response.ok) throw new Error("Failed to fetch data.");

            const data = await response.json();
            setFormData({
                Date: data.Date,
                Notes: data.Notes,
            });
        } catch (error: any) {
            alert(error.message);
        }
    };

    useEffect(() => {
        fetchPurchaseOrder();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/purchase-orders/${id}`,
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
                    errorData.message || "Failed to update purchase order."
                );
            }

            alert("Purchase order updated successfully.");
            router.push("/transaction/po");
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    return (
        <div className="container mt-4">
            <h1>Edit Purchase Order</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="Date" className="form-label">
                        Date
                    </label>
                    <input
                        type="date"
                        id="Date"
                        name="Date"
                        className="form-control"
                        value={formData.Date}
                        onChange={(e) =>
                            setFormData({ ...formData, Date: e.target.value })
                        }
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="Notes" className="form-label">
                        Notes
                    </label>
                    <textarea
                        id="Notes"
                        name="Notes"
                        className="form-control"
                        value={formData.Notes}
                        onChange={(e) =>
                            setFormData({ ...formData, Notes: e.target.value })
                        }
                        required
                    ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                    Save Changes
                </button>
            </form>
        </div>
    );
}
