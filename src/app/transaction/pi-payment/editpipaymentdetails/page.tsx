"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function EditPiPaymentDetailPage() {
    const router = useRouter();
        const searchParams = useSearchParams();
        const id = searchParams.get("id");

    const [formData, setFormData] = useState({
        PaymentRMB: 150.0, // Default value
        FirstMileCostRupiah: 100000, // Default value
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPaymentDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/pi-payment-details/${id}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch payment detail.");
                }
                const data = await response.json();
                if (data.status.code !== 200) {
                    throw new Error(data.status.message || "Failed to fetch payment detail.");
                }
                setFormData(data.data); // Set the fetched data
            } catch (error: any) {
                setError(error.message || "An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPaymentDetail();
        }
    }, [id]);

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/pi-payment-details/${id}`,
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
                throw new Error(errorData.message || "Failed to update payment detail.");
            }

            alert("Payment detail updated successfully.");
            router.push("/transaction/pi-payment"); // Redirect after successful submission
        } catch (error: any) {
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Edit PI Payment Detail</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <form onSubmit={handleSubmit} className="row g-3">
                    {/* Payment in RMB */}
                    <div className="col-md-6">
                        <label htmlFor="PaymentRMB" className="form-label fw-bold">Payment (RMB)</label>
                        <input
                            type="number"
                            id="PaymentRMB"
                            name="PaymentRMB"
                            className="form-control"
                            value={formData.PaymentRMB}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/* First Mile Cost in Rupiah */}
                    <div className="col-md-6">
                        <label htmlFor="FirstMileCostRupiah" className="form-label fw-bold">First Mile Cost (Rupiah)</label>
                        <input
                            type="number"
                            id="FirstMileCostRupiah"
                            name="FirstMileCostRupiah"
                            className="form-control"
                            value={formData.FirstMileCostRupiah}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="col-12 text-center">
                        <button type="submit" className="btn btn-primary px-4 py-2" disabled={loading}>
                            {loading ? "Updating..." : "Update Payment Detail"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}