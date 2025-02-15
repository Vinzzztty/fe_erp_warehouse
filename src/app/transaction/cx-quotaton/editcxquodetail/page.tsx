"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditProformaInvoiceDetail() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id"); // Get `id` from query parameters

    const [formData, setFormData] = useState({
        ReceivedQty: 0,
        Notes:""
    });

    const fetchDetail = async () => {
        if (!id) return; // Ensure `id` is available
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/goods-receipt-detils/${id}`
            );
            if (!response.ok) throw new Error("Failed to fetch data.");

            const data = await response.json();
            console.log("Fetched GR Detail:", data.data);
            setFormData({
                ReceivedQty: data.data.ReceivedQty,
                Notes: data.data.Notes,
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
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/goods-receipt-detils/${id}`,
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
                    errorData.message || "Failed to update goods-receipt detail."
                );
            }

            alert("Goods-receipt Detail updated successfully.");
            router.push("/transaction/goods-receipt"); // Redirect back to the proforma invoices list
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    return (
        <div className="container mt-4">
            <h1>Edit Goods-receipt Detail</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="ReceivedQty" className="form-label">
                        Received QTY
                    </label>
                    <input
                        type="number"
                        id="ReceivedQty"
                        name="ReceivedQty"
                        className="form-control"
                        value={formData.ReceivedQty}
                        onChange={(e) =>
                            setFormData({ ...formData, ReceivedQty: +e.target.value })
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
              className="form-control"
              value={formData.Notes}
              onChange={(e) => setFormData({ ...formData, Notes: e.target.value })}
            />
          </div>
               
                <button type="submit" className="btn btn-primary">
                    Save Changes
                </button>
            </form>
        </div>
    );
}
