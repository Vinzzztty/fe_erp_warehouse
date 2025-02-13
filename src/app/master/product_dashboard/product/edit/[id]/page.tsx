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
        Content: "",
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
                        setter(
                            data.data.filter(
                                (item: any) => item.Status === "Active"
                            )
                        );
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
                    Content: product.Content || "",
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
            <div className="card shadow-sm">
                <div className="card-header bg-dark text-white">
                    <h4 className="mb-0">Edit Product</h4>
                </div>
                <div className="card-body">
                    {/* Error Message */}
                    {errorMessage && (
                        <div className="alert alert-danger">{errorMessage}</div>
                    )}
                    <table
                        className="table table-bordered"
                        style={{ width: "100%", tableLayout: "fixed" }}
                    >
                        <tbody>
                            {/* Form Fields */}
                            <tr>
                                <td>
                                    Company Code{" "}
                                    <span style={{ color: "red" }}>*</span>
                                </td>
                                <td>
                                    <select
                                        className="form-select"
                                        name="CompanyCode"
                                        value={formData.CompanyCode}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select a company
                                        </option>
                                        {companies.map((company: any) => (
                                            <option
                                                key={company.Code}
                                                value={company.Code}
                                            >
                                                {company.Name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td
                                    rowSpan={6}
                                    colSpan={2}
                                    className="text-center align-middle"
                                >
                                    <button
                                        type="button"
                                        className="btn btn-secondary mt-2 mb-2"
                                        onClick={() => {
                                            const words =
                                                formData.Name.trim().split(" ");
                                            const firstThreeWords = words
                                                .slice(0, 3)
                                                .join("-");
                                            const randomString = Math.random()
                                                .toString(36)
                                                .substring(2, 6)
                                                .toUpperCase();
                                            const codeName = `${firstThreeWords}-${randomString}`;
                                            setFormData((prev) => ({
                                                ...prev,
                                                CodeName: codeName,
                                            }));
                                        }}
                                    >
                                        Generate Code Name
                                    </button>
                                    <div className="border p-3">
                                        <p>
                                            <strong>GAMBAR PRODUK</strong>
                                        </p>
                                        {imagePreview && (
                                            <div className="mt-3">
                                                <p>Preview:</p>
                                                <img
                                                    src={imagePreview}
                                                    alt="Image Preview"
                                                    style={{
                                                        maxWidth: "200px",
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Channel{" "}
                                    <span style={{ color: "red" }}>*</span>
                                </td>
                                <td>
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
                                            <option
                                                key={channel.Code}
                                                value={channel.Code}
                                            >
                                                {channel.Name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Category Code{" "}
                                    <span style={{ color: "red" }}>*</span>
                                </td>
                                <td>
                                    <select
                                        className="form-select"
                                        name="CategoryCode"
                                        value={formData.CategoryCode}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select a category
                                        </option>
                                        {categories.map((category: any) => (
                                            <option
                                                key={category.Code}
                                                value={category.Code}
                                            >
                                                {category.Name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Variant{" "}
                                    <span style={{ color: "red" }}>*</span>
                                </td>
                                <td>
                                    <select
                                        className="form-select"
                                        name="VariantId"
                                        value={formData.VariantId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select a variant
                                        </option>
                                        {variants.map((variant: any) => (
                                            <option
                                                key={variant.Code}
                                                value={variant.Code}
                                            >
                                                {variant.Name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                            <tr></tr>
                            <tr>
                                <td>
                                    Name <span style={{ color: "red" }}>*</span>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="Name"
                                        value={formData.Name}
                                        onChange={handleChange}
                                        required
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Code Name{" "}
                                    <span style={{ color: "red" }}>*</span>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="CodeName"
                                        value={formData.CodeName}
                                        onChange={handleChange}
                                        required
                                    />
                                </td>
                            </tr>

                            {/* UoM */}
                            <tr>
                                <td>
                                    UoM <span style={{ color: "red" }}>*</span>
                                </td>
                                <td>
                                    <select
                                        className="form-select"
                                        name="UoM"
                                        value={formData.UoM}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select a unit of measure
                                        </option>
                                        {uoms.map((uom: any) => (
                                            <option
                                                key={uom.Code}
                                                value={uom.Code}
                                            >
                                                {uom.Name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>

                            {/* Store */}
                            <tr>
                                <td>
                                    StoreName{" "}
                                    <span style={{ color: "red" }}>*</span>
                                </td>
                                <td>
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
                                            <option
                                                key={store.Code}
                                                value={store.Code}
                                            >
                                                {store.Name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>

                            {/* Image Upload */}
                            <tr>
                                <td>
                                    <label
                                        htmlFor="ImageURL"
                                        className="form-label"
                                    >
                                        Product Image
                                    </label>
                                </td>
                                <td>
                                    <input
                                        type="file"
                                        id="ImageURL"
                                        name="ImageURL"
                                        className="form-control"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                    />
                                </td>
                            </tr>

                            {/* Notes */}
                            <tr>
                                <td>Contents</td>
                                <td colSpan={3}>
                                    <textarea
                                        id="Content"
                                        name="Content"
                                        className="form-control"
                                        value={formData.Content}
                                        onChange={handleChange}
                                    />
                                </td>
                            </tr>

                            {/* Notes */}
                            <tr>
                                <td>Notes</td>
                                <td colSpan={3}>
                                    <textarea
                                        className="form-control"
                                        name="Notes"
                                        value={formData.Notes}
                                        onChange={handleChange}
                                    ></textarea>
                                </td>
                            </tr>

                            {/* Status */}
                            <tr>
                                <td>
                                    Status{" "}
                                    <span style={{ color: "red" }}>*</span>
                                </td>
                                <td colSpan={3}>
                                    <select
                                        className="form-select"
                                        name="Status"
                                        value={formData.Status}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Non-Active">
                                            Non-Active
                                        </option>
                                    </select>
                                </td>
                            </tr>
                            {/* Submit Button */}
                            <tr>
                                <td colSpan={4} className="text-center">
                                    <button
                                        type="button"
                                        className="btn btn-dark"
                                        disabled={loading}
                                        onClick={handleSubmit} // Manually trigger submit function
                                    >
                                        {loading
                                            ? "Submitting..."
                                            : "Update Product"}
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
