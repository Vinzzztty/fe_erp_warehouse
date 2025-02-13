"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditUomPage() {
    const router = useRouter();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        Code: "",
        Name: "",
        Notes: "",
        Status: "Active",
    });
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchUomDetails = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/uoms/${id}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch UoM details.");
                }
                const uom = await response.json();

                setFormData({
                    Code: uom.data.Code || "",
                    Name: uom.data.Name || "",
                    Notes: uom.data.Notes || "",
                    Status: uom.data.Status || "Active",
                });
            } catch (error: any) {
                console.error("Error fetching UoM details:", error);
                setErrorMessage(error.message || "Failed to load UoM details.");
            }
        };

        fetchUomDetails();
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
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/uoms/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (!response.ok) {
                const responseData = await response.json();
                throw new Error(
                    responseData.message || "Failed to update UoM."
                );
            }

            router.push("/master/product_dashboard");
        } catch (error: any) {
            console.error("Error updating UoM:", error);
            setErrorMessage(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Edit Unit of Measure (UoM)</h1>

            {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
            )}

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
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? "Updating..." : "Update UoM"}
                </button>
            </form>
        </div>
    );
}
