"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProductPage() {
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
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [companies, setCompanies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [variants, setVariants] = useState([]);
    const [uoms, setUoms] = useState([]);
    const [stores, setStores] = useState([]);
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Fetch dropdown data
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

        fetchDropdownData();
    }, []);

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

        const formDataToSubmit = new FormData();
        formDataToSubmit.append("Name", formData.Name);
        formDataToSubmit.append("CodeName", formData.CodeName);
        formDataToSubmit.append("SKUCode", formData.SKUCode || "");
        formDataToSubmit.append("CompanyCode", formData.CompanyCode);
        formDataToSubmit.append("CategoryCode", formData.CategoryCode);
        formDataToSubmit.append("UoM", formData.UoM);
        formDataToSubmit.append("StoreName", formData.StoreName);
        formDataToSubmit.append("Channel", formData.Channel);
        if (formData.VariantId)
            formDataToSubmit.append("VariantId", formData.VariantId);
        if (formData.Notes) formDataToSubmit.append("Notes", formData.Notes);
        if (imageFile) formDataToSubmit.append("ImageURL", imageFile);

        console.log("Payload being sent:");
        for (let [key, value] of formDataToSubmit.entries()) {
            console.log(`${key}: ${value}`);
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/products`,
                {
                    method: "POST",
                    body: formDataToSubmit,
                }
            );

            console.log("Response Status:", response.status);
            const responseData = await response.json();
            console.log("Response Data:", responseData);

            if (!response.ok) {
                throw new Error(
                    responseData.message || "Failed to add product."
                );
            }

            router.push("/master/product_dashboard");
        } catch (error: any) {
            console.error("Error occurred:", error);
            setErrorMessage(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Manage Products</h1>
            <p>Add new products to your system.</p>

            {/* Error Message */}
            {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
            )}

            {/* Product Form */}
            <form onSubmit={handleSubmit} className="mt-4">
                {/* Name */}
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

                {/* Code Name */}
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
                        required
                    />
                </div>

                {/* Company */}
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
                            Select a unit of measure
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
                {/* Image Upload */}
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
                            <p>Preview:</p>
                            <img
                                src={imagePreview}
                                alt="Image Preview"
                                style={{ maxWidth: "200px" }}
                            />
                        </div>
                    )}
                </div>

                {/* Additional Notes */}
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

                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Add Product"}
                </button>
            </form>
        </div>
    );
}
