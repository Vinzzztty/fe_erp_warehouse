"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditCategoryPage() {
    const router = useRouter();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        Name: "",
        SKUCode: "",
        Notes: "",
        Status: "Active",
    });
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategoryDetails = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/categories/${id}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch category details.");
                }
                const category = await response.json();

                setFormData({
                    Name: category.data.Name || "",
                    SKUCode: category.data.SKUCode || "",
                    Notes: category.data.Notes || "",
                    Status: category.data.Status || "Active",
                });
            } catch (error: any) {
                console.error("Error fetching category details:", error);
                setErrorMessage(
                    error.message || "Failed to load category details."
                );
            }
        };

        fetchCategoryDetails();
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
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/categories/${id}`,
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
                    responseData.message || "Failed to update category."
                );
            }

            router.push("/master/product_dashboard");
        } catch (error: any) {
            console.error("Error updating category:", error);
            setErrorMessage(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Edit Category</h1>

            {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
            )}

            <form onSubmit={handleSubmit} className="mt-4">
                {/* Name */}
                <div className="mb-3">
                    <label htmlFor="Name" className="form-label">
                        Category Name <span style={{ color: "red" }}>*</span>
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

                {/* SKU Code */}
                <div className="mb-3">
                    <label htmlFor="SKUCode" className="form-label">
                        SKU Code
                    </label>
                    <input
                        type="text"
                        id="SKUCode"
                        name="SKUCode"
                        className="form-control"
                        value={formData.SKUCode}
                        onChange={handleChange}
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
                    {loading ? "Updating..." : "Update Category"}
                </button>
            </form>
        </div>
    );
}
