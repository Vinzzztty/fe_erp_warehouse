"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UoMPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        Code: "",
        Name: "",
        Notes: "",
        Status: "Active",
    });
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
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
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/uoms`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add UoM.");
            }

            // Navigate back to Product Page on success
            router.push("/master/product_dashboard");
        } catch (error: any) {
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
            <h1>Manage Units of Measure (UoM)</h1>
            <p>Add new UoMs to your system.</p>

            {/* Error Message */}
            {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
            )}

            {/* UoM Form */}
            <form onSubmit={handleSubmit} className="mt-4">
                {/* Code */}
                <div className="mb-3">
                    <label htmlFor="Code" className="form-label">
                        Code <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                        type="text"
                        id="Code"
                        name="Code"
                        className="form-control"
                        value={formData.Code}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Name */}
                <div className="mb-3">
                    <label htmlFor="Name" className="form-label">
                        Name <span style={{ color: "red" }}>*</span>
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
                    />
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

                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn btn-dark"
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Add UoM"}
                </button>
            </form>
        </div>
    );
}
