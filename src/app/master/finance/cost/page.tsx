"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CostPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        Name: "",
        Percentage: "",
        Note: "",
        Status: "Active",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/costs`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...formData,
                        Percentage: parseFloat(formData.Percentage), // Ensure Percentage is sent as a number
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json(); // Extract response JSON
                let apiMessage =
                    errorData?.status?.message || "Failed to add Cost";

                // ✅ Customize error message if "already exists"
                if (apiMessage.includes("already exists")) {
                    apiMessage = "The name is Duplicate";
                }

                throw new Error(apiMessage); // Throw error so it goes to catch block
            }

            // Redirect or refresh after successful submission
            router.push("/master/finance");
        } catch (error: any) {
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            {/* Back Button */}
            <button
                className="btn btn-outline-dark mb-3"
                onClick={() => router.push("/master/finance")}
            >
                <i className="bi bi-arrow-left"></i> Back
            </button>
            <h1>Add New Cost</h1>
            <form onSubmit={handleSubmit} className="mt-4">
                {/* Name Field */}
                <div className="mb-3">
                    <label htmlFor="Name" className="form-label">
                        Cost Name <span style={{ color: "red" }}>*</span>
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

                {/* Percentage Field */}
                <div className="mb-3">
                    <label htmlFor="Percentage" className="form-label">
                        Percentage (%) <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                        type="number"
                        id="Percentage"
                        name="Percentage"
                        className="form-control"
                        value={formData.Percentage}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                    />
                </div>

                {/* Note Field */}
                <div className="mb-3">
                    <label htmlFor="Note" className="form-label">
                        Notes
                    </label>
                    <textarea
                        id="Note"
                        name="Note"
                        className="form-control"
                        value={formData.Note}
                        onChange={handleChange}
                    />
                </div>

                {/* Status Field */}
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

                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn btn-dark"
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Add Cost"}
                </button>
            </form>

            {/* Error Message */}
            {error && <div className="alert alert-danger mt-4">{error}</div>}
        </div>
    );
}
