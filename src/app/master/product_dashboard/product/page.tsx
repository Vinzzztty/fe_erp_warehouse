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
        Content: "",
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
        if (formData.Content)
            formDataToSubmit.append("Content", formData.Content);
        if (imageFile) formDataToSubmit.append("file", imageFile);

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

            const contentType = response.headers.get("content-type");

            if (!contentType || !contentType.includes("application/json")) {
                const errorText = await response.text();
                throw new Error(
                    `Unexpected response: ${
                        errorText || "HTML content received"
                    }`
                );
            }

            const responseData = await response.json();
            console.log("Response Data:", responseData);

            if (!response.ok) {
                throw new Error(
                    responseData.message || "Failed to add product."
                );
            }

            // Update the formData state with the auto-calculated dimensions
            setFormData((prev) => ({
                ...prev,
                Length: responseData.data.Length,
                Width: responseData.data.Width,
                Height: responseData.data.Height,
            }));

            router.push("/master/product_dashboard");
        } catch (error: any) {
            console.error("Error occurred:", error);
            setErrorMessage(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    // return (
    //     <div className="container mt-4">
    //         <h1>Manage Products</h1>
    //         <p>Add new products to your system.</p>

    //         {/* Error Message */}
    //         {errorMessage && (
    //             <div className="alert alert-danger">{errorMessage}</div>
    //         )}

    //         {/* Product Form */}
    //         <form onSubmit={handleSubmit} className="mt-4">
    //             {/* Name */}
    //             <div className="mb-3">
    //                 <label htmlFor="Name" className="form-label">
    //                     Product Name <span style={{ color: "red" }}>*</span>
    //                 </label>
    //                 <input
    //                     type="text"
    //                     id="Name"
    //                     name="Name"
    //                     className="form-control"
    //                     value={formData.Name}
    //                     onChange={handleChange}
    //                     required
    //                 />
    //             </div>

    //             {/* Code Name */}
    //             <div className="mb-3">
    //                 <label htmlFor="CodeName" className="form-label">
    //                     Code Name (Auto-generated)
    //                 </label>
    //                 <input
    //                     type="text"
    //                     id="CodeName"
    //                     name="CodeName"
    //                     className="form-control"
    //                     value={formData.CodeName}
    //                     onChange={handleChange}
    //                     readOnly // Make this field read-only since it is auto-generated
    //                 />
    //                 <button
    //                     type="button"
    //                     className="btn btn-secondary mt-2"
    //                     onClick={() => {
    //                         const words = formData.Name.trim().split(" ");
    //                         const firstThreeWords = words.slice(0, 3).join("-");
    //                         const randomString = Math.random()
    //                             .toString(36)
    //                             .substring(2, 6)
    //                             .toUpperCase();
    //                         const codeName = `${firstThreeWords}-${randomString}`;
    //                         setFormData((prev) => ({
    //                             ...prev,
    //                             CodeName: codeName,
    //                         }));
    //                     }}
    //                 >
    //                     Generate Code Name
    //                 </button>
    //             </div>

    //             {/* Additional Content */}
    //             <div className="mb-3">
    //                 <label htmlFor="Content" className="form-label">
    //                     Contents
    //                 </label>
    //                 <textarea
    //                     id="Content"
    //                     name="Content"
    //                     className="form-control"
    //                     value={formData.Content}
    //                     onChange={handleChange}
    //                 />
    //             </div>

    //             {/* Company */}
    //             <div className="mb-3">
    //                 <label htmlFor="CompanyCode" className="form-label">
    //                     Company <span style={{ color: "red" }}>*</span>
    //                 </label>
    //                 <select
    //                     id="CompanyCode"
    //                     name="CompanyCode"
    //                     className="form-select"
    //                     value={formData.CompanyCode}
    //                     onChange={handleChange}
    //                     required
    //                 >
    //                     <option value="" disabled>
    //                         Select a company
    //                     </option>
    //                     {companies.map((company: any) => (
    //                         <option key={company.Code} value={company.Code}>
    //                             {company.Name}
    //                         </option>
    //                     ))}
    //                 </select>
    //             </div>

    //             {/* UoM */}
    //             <div className="mb-3">
    //                 <label htmlFor="UoM" className="form-label">
    //                     Unit of Measure (UoM){" "}
    //                     <span style={{ color: "red" }}>*</span>
    //                 </label>
    //                 <select
    //                     id="UoM"
    //                     name="UoM"
    //                     className="form-select"
    //                     value={formData.UoM}
    //                     onChange={handleChange}
    //                     required
    //                 >
    //                     <option value="" disabled>
    //                         Select a unit of measure
    //                     </option>
    //                     {uoms.map((uom: any) => (
    //                         <option key={uom.Code} value={uom.Code}>
    //                             {uom.Name}
    //                         </option>
    //                     ))}
    //                 </select>
    //             </div>

    //             {/* Store Name */}
    //             <div className="mb-3">
    //                 <label htmlFor="StoreName" className="form-label">
    //                     Store Name <span style={{ color: "red" }}>*</span>
    //                 </label>
    //                 <select
    //                     id="StoreName"
    //                     name="StoreName"
    //                     className="form-select"
    //                     value={formData.StoreName}
    //                     onChange={handleChange}
    //                     required
    //                 >
    //                     <option value="" disabled>
    //                         Select a store
    //                     </option>
    //                     {stores.map((store: any) => (
    //                         <option key={store.Code} value={store.Code}>
    //                             {store.Name}
    //                         </option>
    //                     ))}
    //                 </select>
    //             </div>

    //             {/* Channel */}
    //             <div className="mb-3">
    //                 <label htmlFor="Channel" className="form-label">
    //                     Channel <span style={{ color: "red" }}>*</span>
    //                 </label>
    //                 <select
    //                     id="Channel"
    //                     name="Channel"
    //                     className="form-select"
    //                     value={formData.Channel}
    //                     onChange={handleChange}
    //                     required
    //                 >
    //                     <option value="" disabled>
    //                         Select a Channel
    //                     </option>
    //                     {channels.map((channel: any) => (
    //                         <option key={channel.Code} value={channel.Code}>
    //                             {channel.Name}
    //                         </option>
    //                     ))}
    //                 </select>
    //             </div>

    //             {/* Category */}
    //             <div className="mb-3">
    //                 <label htmlFor="CategoryCode" className="form-label">
    //                     Category <span style={{ color: "red" }}>*</span>
    //                 </label>
    //                 <select
    //                     id="CategoryCode"
    //                     name="CategoryCode"
    //                     className="form-select"
    //                     value={formData.CategoryCode}
    //                     onChange={handleChange}
    //                     required
    //                 >
    //                     <option value="" disabled>
    //                         Select a Category
    //                     </option>
    //                     {categories.map((category: any) => (
    //                         <option key={category.Code} value={category.Code}>
    //                             {category.Name}
    //                         </option>
    //                     ))}
    //                 </select>
    //             </div>

    //             {/* Variant */}
    //             <div className="mb-3">
    //                 <label htmlFor="VariantId" className="form-label">
    //                     Variant <span style={{ color: "red" }}>*</span>
    //                 </label>
    //                 <select
    //                     id="VariantId"
    //                     name="VariantId"
    //                     className="form-select"
    //                     value={formData.VariantId}
    //                     onChange={handleChange}
    //                     required
    //                 >
    //                     <option value="" disabled>
    //                         Select a Variant
    //                     </option>
    //                     {variants.map((variant: any) => (
    //                         <option key={variant.Code} value={variant.Code}>
    //                             {variant.Name}
    //                         </option>
    //                     ))}
    //                 </select>
    //             </div>

    //             {/* Image Upload */}
    //             <div className="mb-3">
    //                 <label htmlFor="ImageURL" className="form-label">
    //                     Product Image
    //                 </label>
    //                 <input
    //                     type="file"
    //                     id="ImageURL"
    //                     name="ImageURL"
    //                     className="form-control"
    //                     onChange={handleFileChange}
    //                     accept="image/*"
    //                 />
    //                 {imagePreview && (
    //                     <div className="mt-3">
    //                         <p>Preview:</p>
    //                         <img
    //                             src={imagePreview}
    //                             alt="Image Preview"
    //                             style={{ maxWidth: "200px" }}
    //                         />
    //                     </div>
    //                 )}
    //             </div>

    //             {/* Additional Notes */}
    //             <div className="mb-3">
    //                 <label htmlFor="Notes" className="form-label">
    //                     Notes
    //                 </label>
    //                 <textarea
    //                     id="Notes"
    //                     name="Notes"
    //                     className="form-control"
    //                     value={formData.Notes}
    //                     onChange={handleChange}
    //                 />
    //             </div>

    //             {/* Status */}
    //             <div className="mb-3">
    //                 <label htmlFor="Status" className="form-label">
    //                     Status <span style={{ color: "red" }}>*</span>
    //                 </label>
    //                 <select
    //                     id="Status"
    //                     name="Status"
    //                     className="form-select"
    //                     value={formData.Status}
    //                     onChange={handleChange}
    //                     required
    //                 >
    //                     <option value="Active">Active</option>
    //                     <option value="Non-Active">Non-Active</option>
    //                 </select>
    //             </div>

    //             {/* Submit Button */}
    //             <button
    //                 type="submit"
    //                 className="btn btn-primary"
    //                 disabled={loading}
    //             >
    //                 {loading ? "Submitting..." : "Add Product"}
    //             </button>
    //         </form>
    //     </div>
    // );

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-header bg-dark text-white">
                    <h4 className="mb-0">Add Purchase Order Detail</h4>
                </div>
                <div className="card-body">
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
                                            : "Add Product"}
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
