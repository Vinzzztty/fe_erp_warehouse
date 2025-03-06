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

    // const [imageFile, setImageFile] = useState<File | null>(null);
    // const [imagePreview, setImagePreview] = useState<string | null>(null);

    // ✅ Multiple Image Handling
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

    // ✅ Handle multiple image selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const files = Array.from(e.target.files);

        // ✅ Prevent exceeding 8 images
        if (files.length + imageFiles.length > 8) {
            setErrorMessage("You can upload up to 8 images only.");
            return;
        }

        const newPreviews = files.map((file) => URL.createObjectURL(file));

        setImageFiles((prev) => [...prev, ...files]);
        setImagePreviews((prev) => [...prev, ...newPreviews]);

        // ✅ Auto-select first image if not selected
        if (imageFiles.length === 0) {
            setSelectedImage(newPreviews[0]);
            setCurrentImageIndex(0);
        }
    };

    // ✅ Remove an image
    const removeImage = (index: number) => {
        const updatedFiles = imageFiles.filter((_, i) => i !== index);
        const updatedPreviews = imagePreviews.filter((_, i) => i !== index);

        setImageFiles(updatedFiles);
        setImagePreviews(updatedPreviews);

        // ✅ Adjust selected image if removed
        if (updatedPreviews.length > 0) {
            setSelectedImage(updatedPreviews[0]);
            setCurrentImageIndex(0);
        } else {
            setSelectedImage(null);
        }
    };

    // ✅ Handle next image navigation
    const handleNextImage = () => {
        setCurrentImageIndex(
            (prevIndex) => (prevIndex + 1) % imagePreviews.length
        );
        setSelectedImage(
            imagePreviews[(currentImageIndex + 1) % imagePreviews.length]
        );
    };

    // ✅ Handle previous image navigation
    const handlePreviousImage = () => {
        setCurrentImageIndex(
            (prevIndex) =>
                (prevIndex - 1 + imagePreviews.length) % imagePreviews.length
        );
        setSelectedImage(
            imagePreviews[
                (currentImageIndex - 1 + imagePreviews.length) %
                    imagePreviews.length
            ]
        );
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
        // if (imageFile) formDataToSubmit.append("file", imageFile);
        // ✅ Append multiple images
        imageFiles.forEach((file) => {
            formDataToSubmit.append("images", file);
        });

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
                const errorData = await response.json(); // Extract response JSON
                let apiMessage =
                    errorData?.status?.message || "Failed to add Product";

                // ✅ Customize error message if "already exists"
                if (apiMessage.includes("already exists")) {
                    apiMessage = "The name is Duplicate";
                }

                throw new Error(apiMessage); // Throw error so it goes to catch block
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
    return (
        <div className="container mt-4">
            {/* Back Button */}
            <button
                className="btn btn-outline-dark mb-3"
                onClick={() => router.push("/master/product_dashboard")}
            >
                <i className="bi bi-arrow-left"></i> Back
            </button>
            <div className="card shadow-sm">
                <div className="card-header bg-dark text-white">
                    <h4 className="mb-0">Add Product</h4>
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
                                    {/* ✅ Generate Barcode Button */}
                                    <button
                                        type="button"
                                        className="btn btn-secondary mt-2 mb-3"
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
                                        Generate Barcode
                                    </button>

                                    {/* ✅ Image Preview Section */}
                                    <div className="border p-3 rounded bg-light">
                                        <p className="fw-bold">GAMBAR PRODUK</p>

                                        {/* ✅ Selected Image Display */}
                                        <div className="d-flex justify-content-center align-items-center mb-3">
                                            {selectedImage ? (
                                                <img
                                                    src={selectedImage}
                                                    alt="Selected"
                                                    width={150}
                                                    className="rounded border shadow"
                                                />
                                            ) : (
                                                <p className="text-muted">
                                                    No image selected
                                                </p>
                                            )}
                                        </div>

                                        {/* ✅ Navigation Buttons */}
                                        <div className="d-flex justify-content-between mb-2">
                                            <button
                                                className="btn btn-sm btn-outline-dark"
                                                onClick={handlePreviousImage}
                                                disabled={
                                                    imagePreviews.length <= 1
                                                }
                                            >
                                                ◀ Previous
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-dark"
                                                onClick={handleNextImage}
                                                disabled={
                                                    imagePreviews.length <= 1
                                                }
                                            >
                                                Next ▶
                                            </button>
                                        </div>

                                        {/* ✅ Thumbnail Previews */}
                                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                                            {imagePreviews.map(
                                                (preview, index) => (
                                                    <div
                                                        key={index}
                                                        className="position-relative"
                                                    >
                                                        <img
                                                            src={preview}
                                                            alt={`Preview ${
                                                                index + 1
                                                            }`}
                                                            width={80}
                                                            className={`rounded border ${
                                                                selectedImage ===
                                                                preview
                                                                    ? "border-primary"
                                                                    : ""
                                                            }`}
                                                            style={{
                                                                cursor: "pointer",
                                                            }}
                                                            onClick={() =>
                                                                setSelectedImage(
                                                                    preview
                                                                )
                                                            }
                                                        />
                                                        <button
                                                            className="btn btn-danger btn-sm position-absolute top-0 end-0"
                                                            onClick={() =>
                                                                removeImage(
                                                                    index
                                                                )
                                                            }
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
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
                            {/* Contents */}
                            <tr>
                                <td>Contents</td>
                                <td>
                                    <textarea
                                        id="Content"
                                        name="Content"
                                        className="form-control"
                                        value={formData.Content}
                                        onChange={handleChange}
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

                            {/* Notes */}
                            <tr>
                                <td>Notes</td>
                                <td>
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
                                <td>
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

                            <tr>
                                <td colSpan={4} className="text-center">
                                    <label className="form-label">
                                        <strong>Tab Grid</strong>
                                    </label>
                                </td>
                            </tr>
                            <tr>
                                <td
                                    colSpan={4}
                                    className="w-bold text-center bg-light"
                                >
                                    <label className="form-label">
                                        <strong>Detail Product</strong>
                                    </label>
                                </td>
                            </tr>

                            <tr>
                                <td>Detail Product </td>

                                <td>Parameter</td>
                                <td>Unit</td>
                            </tr>
                            <tr>
                                <td>Length </td>

                                <td>
                                    <textarea
                                        className="form-control"
                                        name="Notes"
                                        value={formData.Notes}
                                        onChange={handleChange}
                                    ></textarea>
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
                            <tr>
                                <td>Width </td>

                                <td>
                                    <textarea
                                        className="form-control"
                                        name="Notes"
                                        value={formData.Notes}
                                        onChange={handleChange}
                                    ></textarea>
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
                            <tr>
                                <td>Height </td>

                                <td>
                                    <textarea
                                        className="form-control"
                                        name="Notes"
                                        value={formData.Notes}
                                        onChange={handleChange}
                                    ></textarea>
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
                            <tr>
                                <td>Weight </td>

                                <td>
                                    <textarea
                                        className="form-control"
                                        name="Notes"
                                        value={formData.Notes}
                                        onChange={handleChange}
                                    ></textarea>
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
                            <tr>
                                <td
                                    colSpan={4}
                                    className="text-center w-bold text-center bg-light"
                                >
                                    <label className="form-label ">
                                        <strong>Keywords</strong>
                                    </label>
                                </td>
                            </tr>
                            <tr>
                                <td>Keyword</td>
                                <td>
                                    <textarea
                                        className="form-control"
                                        name="Notes"
                                        value={formData.Notes}
                                        onChange={handleChange}
                                    ></textarea>
                                </td>
                            </tr>

                            {/* SKU Ecommerce List */}
                            <tr>
                                <td
                                    colSpan={4}
                                    className="text-center w-bold text-center bg-light"
                                >
                                    <label className="form-label">
                                        <strong>SKU E-Commerce List</strong>
                                    </label>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    Store Name{" "}
                                    <span style={{ color: "red" }}>*</span>
                                </td>
                                <td>
                                    Channel{" "}
                                    <span style={{ color: "red" }}>*</span>
                                </td>
                                <td>Category</td>
                                <td>Code Number</td>
                            </tr>
                            {/* Store */}
                            <tr>
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
                                <td>
                                    <textarea
                                        className="form-control"
                                        name="Notes"
                                        value={formData.Notes}
                                        onChange={handleChange}
                                    ></textarea>
                                </td>
                            </tr>
                            <tr>
                                <td
                                    colSpan={4}
                                    className="text-center fw-bold text-center bg-light"
                                >
                                    <label className="form-label">
                                        <strong>Upload Images</strong>
                                    </label>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label className="form-label ">
                                        Product Image
                                    </label>
                                </td>
                                <td>
                                    <input
                                        type="file"
                                        name="images"
                                        className="form-control"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    {errorMessage && (
                                        <p className="text-danger">
                                            {errorMessage}
                                        </p>
                                    )}
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
