"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditProformalInvoice() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id"); // Get `id` from query parameters

    const [formData, setFormData] = useState({
        Status: "",
        Notes: "",
    });

    const fetchPurchaseOrder = async () => {
        if (!id) return; // Ensure `id` is available
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoices/${id}`
            );
            if (!response.ok) throw new Error("Failed to fetch data.");

            const data = await response.json();
            console.log("Fetched Purchase Order:", data.data);
            setFormData({
                Status: data.data.Status,
                Notes: data.data.Notes,
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
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoices/${id}`,
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
                    errorData.message || "Failed to update proforma invoice."
                );
            }

            alert("Proforma Invoice updated successfully.");
            router.push("/transaction/pi");
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
                        value={formData.Status}
                        onChange={(e) =>
                            setFormData({ ...formData, Status: e.target.value })
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
