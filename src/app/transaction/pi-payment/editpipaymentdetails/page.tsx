"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditLastMileDetail() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id"); // Get `id` from query parameters

    const [formData, setFormData] = useState({
        ShippingCost: 0,
        AdditionalCost: 0,
    });

    const fetchDetail = async () => {
        if (!id) return; // Ensure `id` is available
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/last-mile-details/${id}`
            );
            if (!response.ok) throw new Error("Failed to fetch data.");

            const data = await response.json();
            console.log("Fetched Last Mile Detail:", data.data);
            setFormData({
                ShippingCost: data.data.ShippingCost,
                AdditionalCost: data.data.AdditionalCost,
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
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/last-mile-details/${id}`,
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
                    errorData.message || "Failed to update Last Mile Detail."
                );
            }

            alert("Last Mile Detail updated successfully.");
            router.push("/transaction/last-mile"); // Redirect back to the last mile list
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    return (
        <div className="container mt-4">
            <h1>Edit Last Mile Detail</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="ShippingCost" className="form-label">
                        Shipping Cost
                    </label>
                    <input
                        type="number"
                        id="ShippingCost"
                        name="ShippingCost"
                        className="form-control"
                        value={formData.ShippingCost}
                        onChange={(e) =>
                            setFormData({ ...formData, ShippingCost: +e.target.value })
                        }
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="AdditionalCost" className="form-label">
                        Additional Cost
                    </label>
                    <input
                        type="number"
                        id="AdditionalCost"
                        name="AdditionalCost"
                        className="form-control"
                        value={formData.AdditionalCost}
                        onChange={(e) =>
                            setFormData({ ...formData, AdditionalCost: +e.target.value })
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