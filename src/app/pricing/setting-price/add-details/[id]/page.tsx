"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

type Product = {
    SKUCode: string;
    SKUFull: string;
    SKUParent: string;
    SKUCodeChild: string;
    Name: string;
    SellingPrice: string;
};

export default function AddSettingPriceDetailsPage() {
    const { id } = useParams(); // SettingPriceId
    const router = useRouter();

    const [formData, setFormData] = useState({
        SKUFull: "", // Ensure this is always a string
        SKUParent: "", // Default to an empty string
        SKUCode: "", // Default to an empty string
        SKUCodeChild: "", // Default to an empty string
        ProductName: "", // Default to an empty string
        SellingPrice: "", // Default to an empty string or "0" if numeric
        NormalPrice: "", // Default to an empty string or "0" if numeric
        StrikethroughPrice: "", // Default to an empty string or "0" if numeric
        CampaignPrice: "", // Default to an empty string or "0" if numeric
        BottomPrice: "", // Default to an empty string or "0" if numeric
    });

    const [products, setProducts] = useState<Product[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch products for the SKU dropdown
        const fetchProducts = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/products`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch products.");
                }

                const data = await response.json();
                setProducts(data.data || []);
            } catch (error: any) {
                setError(error.message || "An unexpected error occurred.");
            }
        };

        fetchProducts();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        // If the user selects a SKUCode, autofill other fields
        if (name === "SKUCode") {
            const selectedProduct = products.find(
                (product) => product.SKUCode === value
            );

            if (selectedProduct) {
                setFormData((prev) => ({
                    ...prev,
                    SKUCode: value,
                    SKUFull: selectedProduct?.SKUFull || "", // Autofill SKUFull
                    SKUParent: selectedProduct?.SKUParent || "", // Autofill SKUParent
                    SKUCodeChild: selectedProduct?.SKUCodeChild || "", // Autofill SKUCodeChild
                    ProductName: selectedProduct?.Name || "", // Map API Name to ProductName
                    SellingPrice: selectedProduct?.SellingPrice || "", // Autofill SellingPrice
                }));
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/product_pricing/setting-price-details`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData, SettingPriceId: id }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to add setting price detail.");
            }

            // Redirect back to details page
            router.push(`/pricing`);
        } catch (error: any) {
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Add New Setting Price Details</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="mt-4">
                {/* SKU Dropdown */}
                <div className="mb-3">
                    <label htmlFor="SKUCode" className="form-label">
                        SKU Code
                    </label>
                    <select
                        id="SKUCode"
                        name="SKUCode"
                        className="form-select"
                        value={formData.SKUCode}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>
                            Select SKU Code
                        </option>
                        {products.map((product) => (
                            <option
                                key={product.SKUCode}
                                value={product.SKUCode}
                            >
                                {product.SKUCode} - {product.Name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* SKU Full */}
                <div className="mb-3">
                    <label htmlFor="SKUFull" className="form-label">
                        SKU Full
                    </label>
                    <input
                        type="text"
                        id="SKUFull"
                        name="SKUFull"
                        className="form-control"
                        value={formData.SKUFull || ""}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* SKU Parent */}
                <div className="mb-3">
                    <label htmlFor="SKUParent" className="form-label">
                        SKU Parent
                    </label>
                    <input
                        type="text"
                        id="SKUParent"
                        name="SKUParent"
                        className="form-control"
                        value={formData.SKUParent || ""}
                        onChange={handleChange}
                    />
                </div>

                {/* SKU Code Child */}
                <div className="mb-3">
                    <label htmlFor="SKUCodeChild" className="form-label">
                        SKU Code Child
                    </label>
                    <input
                        type="text"
                        id="SKUCodeChild"
                        name="SKUCodeChild"
                        className="form-control"
                        value={formData.SKUCodeChild || ""}
                        onChange={handleChange}
                    />
                </div>

                {/* Product Name */}
                <div className="mb-3">
                    <label htmlFor="ProductName" className="form-label">
                        Product Name
                    </label>
                    <input
                        type="text"
                        id="ProductName"
                        name="ProductName"
                        className="form-control"
                        value={formData.ProductName || ""} // Default to an empty string
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Selling Price */}
                <div className="mb-3">
                    <label htmlFor="SellingPrice" className="form-label">
                        Selling Price
                    </label>
                    <input
                        type="number"
                        id="SellingPrice"
                        name="SellingPrice"
                        className="form-control"
                        value={formData.SellingPrice}
                        onChange={handleChange}
                        step="0.01"
                        required
                    />
                </div>

                {/* Additional Fields */}
                <div className="mb-3">
                    <label htmlFor="NormalPrice" className="form-label">
                        Normal Price
                    </label>
                    <input
                        type="number"
                        id="NormalPrice"
                        name="NormalPrice"
                        className="form-control"
                        value={formData.NormalPrice}
                        onChange={handleChange}
                        step="0.01"
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="StrikethroughPrice" className="form-label">
                        Strike Through Price
                    </label>
                    <input
                        type="number"
                        id="StrikethroughPrice"
                        name="StrikethroughPrice"
                        className="form-control"
                        value={formData.StrikethroughPrice}
                        onChange={handleChange}
                        step="0.01"
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="CampaignPrice" className="form-label">
                        Campaign Price
                    </label>
                    <input
                        type="number"
                        id="CampaignPrice"
                        name="CampaignPrice"
                        className="form-control"
                        value={formData.CampaignPrice}
                        onChange={handleChange}
                        step="0.01"
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="BottomPrice" className="form-label">
                        Bottom Price
                    </label>
                    <input
                        type="number"
                        id="BottomPrice"
                        name="BottomPrice"
                        className="form-control"
                        value={formData.BottomPrice}
                        onChange={handleChange}
                        step="0.01"
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Add Details"}
                </button>
            </form>
        </div>
    );
}
