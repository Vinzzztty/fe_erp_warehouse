"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditWarehousePage() {
    const { id } = useParams();
    const router = useRouter();

    const [formData, setFormData] = useState({
        Name: "",
        Address: "",
        Notes: "",
        Status: "Active",
    });
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Fetch warehouse data
    useEffect(() => {
        const fetchWarehouseData = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/warehouses/${id}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch warehouse data.");
                }
                const data = await response.json();
                setFormData({
                    Name: data.data.Name || "",
                    Address: data.data.Address || "",
                    Notes: data.data.Notes || "",
                    Status: data.data.Status || "Active",
                });
            } catch (error: any) {
                setErrorMessage(
                    error.message || "Failed to load warehouse data."
                );
            }
        };

        fetchWarehouseData();
    }, [id]);

    // Handle input changes
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/warehouses/${id}`,
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
                    errorData.message || "Failed to update warehouse."
                );
            }

            // Redirect back to Warehouse page on success
            router.push("/master/warehouse");
        } catch (error: any) {
            setErrorMessage(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Edit Warehouse</h1>
            {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
            )}
            <form onSubmit={handleSubmit}>
                {/* Name */}
                <div className="mb-3">
                    <label htmlFor="Name" className="form-label">
                        Warehouse Name <span style={{ color: "red" }}>*</span>
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

                {/* Address */}
                <div className="mb-3">
                    <label htmlFor="Address" className="form-label">
                        Address <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                        type="text"
                        id="Address"
                        name="Address"
                        className="form-control"
                        value={formData.Address}
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

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
}
