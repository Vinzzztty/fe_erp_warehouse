"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BankPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        Name: "",
        Notes: "",
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
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/banks`,
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
                throw new Error(errorData.message || "Failed to create bank.");
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
            <h1>Add New Bank</h1>
            <form onSubmit={handleSubmit} className="mt-4">
                {/* Name Field */}
                <div className="mb-3">
                    <label htmlFor="Name" className="form-label">
                        Bank Name
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

                {/* Notes Field */}
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

                {/* Status Field */}
                <div className="mb-3">
                    <label htmlFor="Status" className="form-label">
                        Status
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
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Add Bank"}
                </button>
            </form>

            {/* Error Message */}
            {error && <div className="alert alert-danger mt-4">{error}</div>}
        </div>
    );
}
