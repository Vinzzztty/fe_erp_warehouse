"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

async function fetchData(endpoint: string) {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`
    );
    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${endpoint}`);
    }
    return response.json();
}

export default function EditProductPage() {
    const { id } = useParams();
    const router = useRouter();

    const [formData, setFormData] = useState({
        Name: "",
        CodeName: "",
        SKUCode: "",
        CompanyCode: "",
        CategoryCode: "",
        VariantId: "",
        UoM: "",
        StoreName: "",
        Channel: "",
        Notes: "",
        Status: "Active",
        Length: "",
        Width: "",
        Height: "",
        Weight: "",
        Keyword: "",
        Parameter: "",
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [companies, setCompanies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [variants, setVariants] = useState([]);
    const [uoms, setUoms] = useState([]);
    const [stores, setStores] = useState([]);
    const [channels, setChannels] = useState([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Fetch the product details when the page loads
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const endpoints = [
                    { url: "/master/companies", setter: setCompanies },
                    { url: "/master/categories", setter: setCategories },
                    { url: "/master/variants", setter: setVariants },
                    { url: "/master/uoms", setter: setUoms },
                    { url: "/master/stores", setter: setStores },
                    { url: "/master/channels", setter: setChannels },
                ];

                await Promise.all(
                    endpoints.map(async ({ url, setter }) => {
                        const response = await fetch(
                            `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`
                        );
                        if (!response.ok)
                            throw new Error("Failed to fetch dropdown data");
                        const data = await response.json();
                        setter(data.data);
                    })
                );
            } catch (error: any) {
                setErrorMessage(
                    error.message || "Failed to load dropdown data."
                );
            }
        };
        const fetchProductDetails = async () => {
            try {
                const response = await fetchData(`/master/products/${id}`);
                const product = response.data;

                // Populate form data with fetched product details
                setFormData({
                    Name: product.Name || "",
                    CodeName: product.CodeName || "",
                    SKUCode: product.SKUCode || "",
                    CompanyCode: product.CompanyCode || "",
                    CategoryCode: product.CategoryCode || "",
                    VariantId: product.VariantId || "",
                    UoM: product.UoM || "",
                    StoreName: product.StoreName || "",
                    Channel: product.Channel || "",
                    Notes: product.Notes || "",
                    Status: product.Status || "Non-Active",
                    Length: product.Length ?? 0,
                    Width: product.Width ?? 0, // Set default to 0 if null or undefined
                    Height: product.Height ?? 0, // Set default to 0 if null or undefined
                    Weight: product.Weight ?? 0, // Set default to 0 if null or undefined
                    Keyword: product.Keyword || "",
                    Parameter: product.Parameter ?? 0, // Set default to 0 if null or undefined
                });

                // Set image preview if available
                if (product.ImageURL) {
                    setImagePreview(product.ImageURL);
                }
            } catch (error: any) {
                console.error("Failed to fetch product details:", error);
                setErrorMessage("Failed to load product details.");
            }
        };

        fetchDropdownData();

        fetchProductDetails();
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);

        if (file) {
            setImagePreview(URL.createObjectURL(file)); // Generate image preview
        } else {
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        // Sanitize numeric fields
        const sanitizedFormData = {
            ...formData,
            Length: formData.Length ? parseInt(formData.Length, 10) : 0,
            Width: formData.Width ? parseInt(formData.Width, 10) : 0,
            Height: formData.Height ? parseInt(formData.Height, 10) : 0,
            Weight: formData.Weight ? parseInt(formData.Weight, 10) : 0,
            Parameter: formData.Parameter
                ? parseInt(formData.Parameter, 10)
                : 0,
        };

        const formDataToSubmit = new FormData();
        Object.entries(sanitizedFormData).forEach(([key, value]) => {
            formDataToSubmit.append(key, value.toString());
        });
        if (imageFile) {
            formDataToSubmit.append("file", imageFile);
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/products/${id}`,
                {
                    method: "PUT", // Assuming you're using PUT for updates
                    body: formDataToSubmit,
                }
            );

            if (!response.ok) {
                const responseData = await response.json();
                throw new Error(
                    responseData.message || "Failed to update product."
                );
            }

            router.push("/master/product_dashboard");
        } catch (error: any) {
            console.error("Error updating product:", error);
            setErrorMessage(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Edit Product</h1>

            {/* Error Message */}
            {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
            )}

            {/* Edit Product Form */}
            <form onSubmit={handleSubmit} className="mt-4">
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
                    <label htmlFor="CodeName" className="form-label">
                        Code Name
                    </label>
                    <input
                        type="text"
                        id="CodeName"
                        name="CodeName"
                        className="form-control"
                        value={formData.CodeName}
                        onChange={handleChange}
                        readOnly
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
                        readOnly
                    />
                </div>

                {/* Company Name */}
                <div className="mb-3">
                    <label htmlFor="CompanyCode" className="form-label">
                        Company
                    </label>
                    <select
                        id="CompanyCode"
                        name="CompanyCode"
                        className="form-select"
                        value={formData.CompanyCode}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>
                            Select a company
                        </option>
                        {companies.map((company: any) => (
                            <option key={company.Code} value={company.Code}>
                                {company.Name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Category Code */}
                <div className="mb-3">
                    <label htmlFor="CategoryCode" className="form-label">
                        Category
                    </label>
                    <select
                        id="CategoryCode"
                        name="CategoryCode"
                        className="form-select"
                        value={formData.CategoryCode}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>
                            Select a category
                        </option>
                        {categories.map((category: any) => (
                            <option key={category.Code} value={category.Code}>
                                {category.Name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Variant ID */}
                <div className="mb-3">
                    <label htmlFor="VariantId" className="form-label">
                        Variant
                    </label>
                    <select
                        id="VariantId"
                        name="VariantId"
                        className="form-select"
                        value={formData.VariantId}
                        onChange={handleChange}
                    >
                        <option value="" disabled>
                            Select a variant
                        </option>
                        {variants.map((variant: any) => (
                            <option key={variant.Code} value={variant.Code}>
                                {variant.Name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* UoM */}
                <div className="mb-3">
                    <label htmlFor="UoM" className="form-label">
                        Unit of Measure (UoM)
                    </label>
                    <select
                        id="UoM"
                        name="UoM"
                        className="form-select"
                        value={formData.UoM}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>
                            Select a UoM
                        </option>
                        {uoms.map((uom: any) => (
                            <option key={uom.Code} value={uom.Code}>
                                {uom.Name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Store Name */}
                <div className="mb-3">
                    <label htmlFor="StoreName" className="form-label">
                        Store Name
                    </label>
                    <select
                        id="StoreName"
                        name="StoreName"
                        className="form-select"
                        value={formData.StoreName}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>
                            Select a store
                        </option>
                        {stores.map((store: any) => (
                            <option key={store.Code} value={store.Code}>
                                {store.Name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Channel */}
                <div className="mb-3">
                    <label htmlFor="Channel" className="form-label">
                        Channel
                    </label>
                    <select
                        id="Channel"
                        name="Channel"
                        className="form-select"
                        value={formData.Channel}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>
                            Select a Channel
                        </option>
                        {channels.map((channel: any) => (
                            <option key={channel.Code} value={channel.Code}>
                                {channel.Name}
                            </option>
                        ))}
                    </select>
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

                {/* Weight */}
                <div className="mb-3">
                    <label htmlFor="Weight" className="form-label">
                        Weight
                    </label>
                    <input
                        type="number"
                        id="Weight"
                        name="Weight"
                        className="form-control"
                        value={formData.Weight || ""}
                        onChange={handleChange}
                    />
                </div>

                {/* Keyword */}
                <div className="mb-3">
                    <label htmlFor="Keyword" className="form-label">
                        Keyword
                    </label>
                    <input
                        type="text"
                        id="Keyword"
                        name="Keyword"
                        className="form-control"
                        value={formData.Keyword}
                        onChange={handleChange}
                    />
                </div>

                {/* Parameter */}
                <div className="mb-3">
                    <label htmlFor="Parameter" className="form-label">
                        Parameter
                    </label>
                    <input
                        type="number"
                        id="Parameter"
                        name="Parameter"
                        className="form-control"
                        value={formData.Parameter || 0}
                        onChange={handleChange}
                    />
                </div>

                {/* Add other fields similar to above, prefilled with formData values */}

                <div className="mb-3">
                    <label htmlFor="ImageURL" className="form-label">
                        Product Image
                    </label>
                    <input
                        type="file"
                        id="ImageURL"
                        name="ImageURL"
                        className="form-control"
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                    {imagePreview && (
                        <div className="mt-3">
                            <img
                                src={imagePreview}
                                alt="Image Preview"
                                style={{ maxWidth: "200px" }}
                            />
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? "Updating..." : "Update Product"}
                </button>
            </form>
        </div>
    );
}
