"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditVariantPage() {
    const router = useRouter();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        Name: "",
        Notes: "",
        Status: "Active",
    });
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchVariantDetails = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/variants/${id}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch variant details.");
                }
                const variant = await response.json();

                setFormData({
                    Name: variant.data.Name || "",
                    Notes: variant.data.Notes || "",
                    Status: variant.data.Status || "Active",
                });
            } catch (error: any) {
                console.error("Error fetching variant details:", error);
                setErrorMessage(
                    error.message || "Failed to load variant details."
                );
            }
        };

        fetchVariantDetails();
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/variants/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (!response.ok) {
                const errorData = await response.json(); // Extract response JSON
                let apiMessage =
                    errorData?.status?.message || "Failed to Update variant.";

                // ✅ Customize error message if "already exists"
                if (apiMessage.includes("already exists")) {
                    apiMessage = "The name is Duplicate";
                }

                throw new Error(apiMessage); // Throw error so it goes to catch block
            }

            router.push("/master/product_dashboard");
        } catch (error: any) {
            console.error("Error updating variant:", error);
            setErrorMessage(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            {/* Back Button */}
            <button
                className="btn btn-outline-dark mb-3"
                onClick={() => router.push("/master/product_dashboard")}
            >
                <i className="bi bi-arrow-left"></i> Back
            </button>
            <h1>Edit Variant</h1>

            {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
            )}

            <form onSubmit={handleSubmit} className="mt-4">
                {/* Name */}
                <div className="mb-3">
                    <label htmlFor="Name" className="form-label">
                        Variant Name <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                        type="text"
                        id="Name"
                        name="Name"
                        className="form-control"
                        value={formData.Name}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Notes */}
                <div className="mb-3">
                    <label htmlFor="Notes" className="form-label">
                        Notes
                    </label>
                    <textarea
                        id="Notes"
                        name="Notes"
                        className="form-control"
                        value={formData.Notes}
                        onChange={handleChange}
                    ></textarea>
                </div>

                {/* Status */}
                <div className="mb-3">
                    <label htmlFor="Status" className="form-label">
                        Status <span style={{ color: "red" }}>*</span>
                    </label>
                    <select
                        id="Status"
                        name="Status"
                        className="form-select"
                        value={formData.Status}
                        onChange={handleChange}
                        required
                    >
                        <option value="Active">Active</option>
                        <option value="Non-Active">Non-Active</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="btn btn-dark"
                    disabled={loading}
                >
                    {loading ? "Updating..." : "Update Variant"}
                </button>
            </form>
        </div>
    );
}
