"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditProductPage() {
    const router = useRouter();
    const { id } = useParams();

    // State for the product
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // State for form fields
    const [formData, setFormData] = useState({
        Name: "",
        SKUCode: "",
        ImageURL: "",
        Status: "Active",
    });

    // Fetch product data
    const fetchProduct = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/products/${id}`
            );
            if (!response.ok) throw new Error("Failed to fetch product.");
            const data = await response.json();
            setProduct(data.data);
            setFormData({
                Name: data.data.Name || "",
                SKUCode: data.data.SKUCode || "",
                ImageURL: data.data.ImageURL || "",
                Status: data.data.Status || "Active",
            });
        } catch (error: any) {
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    // Update product
    const updateProduct = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/products/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );
            if (!response.ok) throw new Error("Failed to update product.");
            alert("Product updated successfully!");
            router.push("/master/product");
        } catch (error: any) {
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    // Handle form input changes
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Fetch product data on mount
    useEffect(() => {
        fetchProduct();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-danger">Error: {error}</div>;

    return (
        <div className="container mt-4">
            <h1>Edit Product</h1>
            <p>Modify the details of the product below.</p>

            {product && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        updateProduct();
                    }}
                >
                    <div className="mb-3">
                        <label htmlFor="Name" className="form-label">
                            Product Name
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

                    <div className="mb-3">
                        <label htmlFor="ImageURL" className="form-label">
                            Image URL
                        </label>
                        <input
                            type="text"
                            id="ImageURL"
                            name="ImageURL"
                            className="form-control"
                            value={formData.ImageURL}
                            onChange={handleChange}
                        />
                    </div>

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

                    <button type="submit" className="btn btn-primary">
                        Save Changes
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary ms-2"
                        onClick={() => router.push("/master/products")}
                    >
                        Cancel
                    </button>
                </form>
            )}
        </div>
    );
}
