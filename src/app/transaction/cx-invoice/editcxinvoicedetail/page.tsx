"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditCXInvoiceDetail() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id"); // Get `id` from query parameters

    const [formData, setFormData] = useState({
        PaymentRMB: 0,
        CXCostRMB: 0,
    });

    const fetchCxInvoiceDetail = async () => {
        if (!id) return; // Ensure `id` is available
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-invoice-details/${id}`
            );
            if (!response.ok) throw new Error("Failed to fetch data.");

            const data = await response.json();
            console.log("Fetched CX Invoice Detail:", data.data);
            setFormData({
                PaymentRMB: data.data.PaymentRMB,
                CXCostRMB: data.data.CXCostRMB,
            });
        } catch (error: any) {
            alert(error.message);
        }
    };

    useEffect(() => {
        fetchCxInvoiceDetail();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-invoice-details/${id}`,
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
                    errorData.message || "Failed to update CX Invoice detail."
                );
            }

            alert("CX Invoice detail updated successfully.");
            router.push("/transaction/cx-invoice"); // Redirect to the CX Invoice list page
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    return (
        <div className="container mt-4">
            <h1>Edit CX Invoice Detail</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="PaymentRMB" className="form-label">
                        Payment (RMB)
                    </label>
                    <input
                        type="number"
                        id="PaymentRMB"
                        name="PaymentRMB"
                        className="form-control"
                        value={formData.PaymentRMB}
                        onChange={(e) =>
                            setFormData({ ...formData, PaymentRMB: parseFloat(e.target.value) })
                        }
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="CXCostRMB" className="form-label">
                        CX Cost (RMB)
                    </label>
                    <input
                        type="number"
                        id="CXCostRMB"
                        name="CXCostRMB"
                        className="form-control"
                        value={formData.CXCostRMB}
                        onChange={(e) =>
                            setFormData({ ...formData, CXCostRMB: parseFloat(e.target.value) })
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