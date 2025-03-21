"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CountryPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        Name: "",
        Status: "Active",
    });
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
        setErrorMessage(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/countries`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );

            // ✅ Check if response is NOT OK
            if (!response.ok) {
                const errorData = await response.json(); // Extract response JSON
                let apiMessage =
                    errorData?.status?.message || "Failed to add country.";

                // ✅ Customize error message if "already exists"
                if (apiMessage.includes("already exists")) {
                    apiMessage = "The name is Duplicate";
                }

                throw new Error(apiMessage); // Throw error so it goes to catch block
            }

            // Navigate back to Wilayah page on success
            router.push("/master/wilayah");
        } catch (error: any) {
            // ✅ Handle API response errors
            if (error.message) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage(
                    "An unexpected error occurred. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = formData.Name.trim() !== "";

    return (
        <div className="container mt-4">
            {/* Back Button */}
            <button
                className="btn btn-outline-dark mb-3"
                onClick={() => router.push("/master/wilayah")}
            >
                <i className="bi bi-arrow-left"></i> Back
            </button>
            <h1>Manage Countries</h1>
            <p>Add new countries to your system.</p>

            {/* Error Message */}
            {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
            )}

            {/* Country Form */}
            <form onSubmit={handleSubmit} className="mt-4">
                {/* Name Field */}
                <div className="mb-3">
                    <label htmlFor="Name" className="form-label">
                        Country Name <span style={{ color: "red" }}>*</span>
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
                    className="btn btn-dark"
                    disabled={!isFormValid || loading}
                >
                    {loading ? "Submitting..." : "Add Country"}
                </button>
            </form>
        </div>
    );
}
