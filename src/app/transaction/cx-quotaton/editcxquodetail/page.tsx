"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

interface FormData {
    CXCost: number;
    DiscountAndFees: number;
}

export default function EditDetailCxQuotationPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        CXCost: 0,
        DiscountAndFees: 0,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const detailId = searchParams.get("id"); // Get the ID from the URL

    // Fetch existing data for the specified detail ID
    useEffect(() => {
        const fetchDetailData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-quotation-details/${detailId}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch CX Quotation detail.");
                }
                const data = await response.json();
                if (data.status.code !== 200) {
                    throw new Error(data.status.message || "No detail found.");
                }

                // Set the form data with the fetched detail
                setFormData({
                    CXCost: data.data.CXCost,
                    DiscountAndFees: data.data.DiscountAndFees,
                });
            } catch (error: any) {
                setError(error.message || "An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        };

        if (detailId) {
            fetchDetailData();
        }
    }, [detailId]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            CXCost: formData.CXCost,
            DiscountAndFees: formData.DiscountAndFees,
        };

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-quotation-details/${detailId}`,
                {
                    method: "PUT", // Use PUT for updating existing data
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update CX Quotation detail.");
            }

            router.push("/transaction/cx-quotaton"); // Redirect after successful update
        } catch (error: any) {
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Edit Detail CX Quotation</h1>
            {error && <div className="alert alert-danger mt-4">{error}</div>}

            {loading ? (
                <p>Loading...</p>
            ) : (
                <form onSubmit={handleSubmit} className="mt-4">
                    {/* CX Cost */}
                    <div className="mb-3">
                        <label htmlFor="CXCost" className="form-label">
                            CX Cost
                        </label>
                        <input
                            type="number"
                            id="CXCost"
                            className="form-control"
                            value={formData.CXCost}
                            onChange={(e) => setFormData({ ...formData, CXCost: +e.target.value })}
                        />
                    </div>

                    {/* Discount and Fees */}
                    <div className="mb-3">
                        <label htmlFor="DiscountAndFees" className="form-label">
                            Discount and Fees
                        </label>
                        <input
                            type="number"
                            id="DiscountAndFees"
                            className="form-control"
                            value={formData.DiscountAndFees}
                            onChange={(e) => setFormData({ ...formData, DiscountAndFees: +e.target.value })}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary">
                        Submit
                    </button>
                </form>
            )}
        </div>
    );
}