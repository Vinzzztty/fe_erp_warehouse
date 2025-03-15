"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Store {
    Code: number;
    Name: string;
}

interface Channel {
    Code: number;
    Name: string;
    InitialChannel: string; // ✅ Corrected field
    CategoryFromChannel: string; // ✅ Corrected field
}

export default function ProductPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        Name: "",
        CodeName: "",
        SKUCode: "",
        SKUFull: "",
        SKUParent: "",
        SKUCodeChild: "",
        CompanyCode: "",
        CategoryCode: "",
        VariantId: "",
        VariantId_2: "",
        Content: "",
        UoM: "",
        Notes: "",
        Status: "Active",
        Length_UoM: "",
        Width_UoM: "",
        Height_UoM: "",
        Weight_UoM: "",
        Keyword: [], // ✅ JSON array
        StoreName_1: null,
        Channel_1: null,
        InitialChannel_1: "",
        CategoryFromChannel_1: "",
        CodeNumber_1: null,
        SKUCodeEcommerce_1: "",

        StoreName_2: null,
        Channel_2: null,
        InitialChannel_2: "",
        CategoryFromChannel_2: "",
        CodeNumber_2: null,
        SKUCodeEcommerce_2: "",

        StoreName_3: null,
        Channel_3: null,
        InitialChannel_3: "",
        CategoryFromChannel_3: "",
        CodeNumber_3: null,
        SKUCodeEcommerce_3: "",

        StoreName_4: null,
        Channel_4: null,
        InitialChannel_4: "",
        CategoryFromChannel_4: "",
        CodeNumber_4: null,
        SKUCodeEcommerce_4: "",

        StoreName_5: null,
        Channel_5: null,
        InitialChannel_5: "",
        CategoryFromChannel_5: "",
        CodeNumber_5: null,
        SKUCodeEcommerce_5: "",
    });

    // ✅ Multiple Image Handling
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [companies, setCompanies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [variants, setVariants] = useState([]);
    const [uoms, setUoms] = useState([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);
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
                    {
                        url: "/master/channels",
                        setter: (data: any[]) => {
                            // ✅ Ensure channels map correctly to expected fields
                            setChannels(
                                data.map((channel) => ({
                                    Code: channel.Code,
                                    Name: channel.Name,
                                    InitialChannel: channel.Initial || "", // ✅ Map 'Initial' to 'InitialChannel'
                                    CategoryFromChannel: channel.Category || "", // ✅ Map 'Category' to 'CategoryFromChannel'
                                }))
                            );
                        },
                    },
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

    const handleSKUChange = (
        e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
        key: string
    ) => {
        const { value } = e.target;
        setFormData((prev) => {
            const updatedData: any = { ...prev, [key]: value };

            // ✅ When Channel is selected, auto-fill related fields
            if (key.startsWith("Channel_")) {
                const index = key.split("_")[1]; // Extract the number
                const selectedChannel = channels.find(
                    (c) => c.Code.toString() === value
                );

                if (selectedChannel) {
                    updatedData[`InitialChannel_${index}`] =
                        selectedChannel.InitialChannel || "";
                    updatedData[`CategoryFromChannel_${index}`] =
                        selectedChannel.CategoryFromChannel || "";
                    updatedData[
                        `SKUCodeEcommerce_${index}`
                    ] = `SKU-${selectedChannel.Code}-${index}`; // Example SKU generation
                }
            }

            return updatedData;
        });
    };
    // const handleChange = (
    //     e: React.ChangeEvent<
    //         HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    //     >
    // ) => {
    //     const { name, value } = e.target;
    //     setFormData((prev) => ({ ...prev, [name]: value }));
    // };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === "CodeName" ? value.toUpperCase() : value,
        }));
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
        formDataToSubmit.append("Notes", formData.Notes || "");
        formDataToSubmit.append("Content", formData.Content || "");
        formDataToSubmit.append("Status", formData.Status);
        formDataToSubmit.append("Length_UoM", formData.Length_UoM || "");
        formDataToSubmit.append("Width_UoM", formData.Width_UoM || "");
        formDataToSubmit.append("Height_UoM", formData.Height_UoM || "");
        formDataToSubmit.append("Weight_UoM", formData.Weight_UoM || "");

        if (formData.VariantId)
            formDataToSubmit.append("VariantId", formData.VariantId);
        if (formData.VariantId_2)
            formDataToSubmit.append("VariantId_2", formData.VariantId_2);

        // ✅ Ensure JSON fields are stored correctly as JSON strings
        formDataToSubmit.append("Keyword", JSON.stringify(formData.Keyword));
        formDataToSubmit.append(
            "InitialChannel_1",
            formData.InitialChannel_1 || ""
        );
        formDataToSubmit.append(
            "CategoryFromChannel_1",
            formData.CategoryFromChannel_1 || ""
        );
        formDataToSubmit.append(
            "SKUCodeEcommerce_1",
            formData.SKUCodeEcommerce_1 || ""
        );

        formDataToSubmit.append(
            "InitialChannel_2",
            formData.InitialChannel_2 || ""
        );
        formDataToSubmit.append(
            "CategoryFromChannel_2",
            formData.CategoryFromChannel_2 || ""
        );
        formDataToSubmit.append(
            "SKUCodeEcommerce_2",
            formData.SKUCodeEcommerce_2 || ""
        );

        formDataToSubmit.append(
            "InitialChannel_3",
            formData.InitialChannel_3 || ""
        );
        formDataToSubmit.append(
            "CategoryFromChannel_3",
            formData.CategoryFromChannel_3 || ""
        );
        formDataToSubmit.append(
            "SKUCodeEcommerce_3",
            formData.SKUCodeEcommerce_3 || ""
        );

        formDataToSubmit.append(
            "InitialChannel_4",
            formData.InitialChannel_4 || ""
        );
        formDataToSubmit.append(
            "CategoryFromChannel_4",
            formData.CategoryFromChannel_4 || ""
        );
        formDataToSubmit.append(
            "SKUCodeEcommerce_4",
            formData.SKUCodeEcommerce_4 || ""
        );

        formDataToSubmit.append(
            "InitialChannel_5",
            formData.InitialChannel_5 || ""
        );
        formDataToSubmit.append(
            "CategoryFromChannel_5",
            formData.CategoryFromChannel_5 || ""
        );
        formDataToSubmit.append(
            "SKUCodeEcommerce_5",
            formData.SKUCodeEcommerce_5 || ""
        );

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

            // ✅ Update state with auto-generated SKU values
            setFormData((prev) => ({
                ...prev,
                SKUFull: responseData.data.SKUFull || prev.SKUFull,
                SKUParent: responseData.data.SKUParent || prev.SKUParent,
                SKUCode: responseData.data.SKUCode || prev.SKUCode,
                SKUCodeChild:
                    responseData.data.SKUCodeChild || prev.SKUCodeChild,
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
                                {/* SKU */}
                                <td>
                                    <strong>SKU Full:</strong>
                                </td>
                                <td colSpan={2}>
                                    <input
                                        type="text"
                                        value={
                                            formData.SKUFull
                                                ? formData.SKUFull
                                                : ""
                                        }
                                        placeholder="Will be autofilled after saving"
                                        readOnly
                                        className="form-control"
                                    />
                                    {!formData.SKUFull && (
                                        <small className="text-muted">
                                            Example: Test_Product_123
                                        </small>
                                    )}
                                </td>
                                <td>
                                    <strong>SKU Parent:</strong>
                                </td>
                                <td colSpan={2}>
                                    <input
                                        type="text"
                                        value={
                                            formData.SKUParent
                                                ? formData.SKUParent
                                                : ""
                                        }
                                        placeholder="Will be autofilled after saving"
                                        readOnly
                                        className="form-control"
                                    />
                                    {!formData.SKUParent && (
                                        <small className="text-muted">
                                            Example: Test_Product_PARENT
                                        </small>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>SKU Code:</strong>
                                </td>
                                <td colSpan={2}>
                                    <input
                                        type="text"
                                        value={
                                            formData.SKUCode
                                                ? formData.SKUCode
                                                : ""
                                        }
                                        placeholder="Will be autofilled after saving"
                                        readOnly
                                        className="form-control"
                                    />
                                    {!formData.SKUCode && (
                                        <small className="text-muted">
                                            Example: Test_Product_CODE
                                        </small>
                                    )}
                                </td>
                                <td>
                                    <strong>SKU Code Child:</strong>
                                </td>
                                <td colSpan={2}>
                                    <input
                                        type="text"
                                        value={
                                            formData.SKUCodeChild
                                                ? formData.SKUCodeChild
                                                : ""
                                        }
                                        placeholder="Will be autofilled after saving"
                                        readOnly
                                        className="form-control"
                                    />
                                    {!formData.SKUCodeChild && (
                                        <small className="text-muted">
                                            Example: Test_Product_CHILD
                                        </small>
                                    )}
                                </td>
                            </tr>
                            {/* Empty Row for Spacing */}
                            <tr>
                                <td
                                    className="bg-light"
                                    colSpan={6}
                                    style={{ height: "10px" }}
                                ></td>
                            </tr>

                            {/* Company */}
                            <tr>
                                <td>
                                    Company Code{" "}
                                    <span style={{ color: "red" }}>*</span>
                                </td>
                                <td colSpan={2}>
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
                                    colSpan={3}
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
                                <td colSpan={2}>
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
                                <td colSpan={2}>
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
                            {/* Empty Row for Spacing */}
                            <tr>
                                <td
                                    className="bg-light"
                                    colSpan={3}
                                    style={{ height: "10px" }}
                                ></td>
                            </tr>

                            <tr>
                                <td>
                                    Name <span style={{ color: "red" }}>*</span>
                                </td>
                                <td colSpan={2}>
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
                                <td colSpan={2}>
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

                            <tr>
                                <td>
                                    Variant{" "}
                                    <span style={{ color: "red" }}>*</span>
                                </td>
                                <td colSpan={2}>
                                    <select
                                        className="form-select"
                                        name="VariantId_2"
                                        value={formData.VariantId_2}
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
                            {/* Empty Row for Spacing */}
                            <tr>
                                <td
                                    className="bg-light"
                                    colSpan={6}
                                    style={{ height: "10px" }}
                                ></td>
                            </tr>

                            {/* Contents */}
                            <tr>
                                <td>Contents</td>
                                <td colSpan={5}>
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
                                <td colSpan={2}>
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
                                <td colSpan={2}>
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
                                <td colSpan={2}>
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
                                <td colSpan={6} className="text-center">
                                    <label className="form-label">
                                        <strong>Tab Grid</strong>
                                    </label>
                                </td>
                            </tr>

                            <tr>
                                <td
                                    colSpan={6}
                                    className="w-bold text-center bg-light py-2"
                                >
                                    <label className="form-label text-uppercase">
                                        <strong>Detail Product</strong>
                                    </label>
                                </td>
                            </tr>

                            <tr className="bg-secondary text-white text-center">
                                <td className="fw-bold" colSpan={2}>
                                    Detail Product
                                </td>
                                <td className="fw-bold" colSpan={2}>
                                    Parameter
                                </td>
                                <td className="fw-bold" colSpan={2}>
                                    Unit
                                </td>
                            </tr>

                            {[
                                { label: "Length", name: "Length_UoM" },
                                { label: "Width", name: "Width_UoM" },
                                { label: "Height", name: "Height_UoM" },
                                { label: "Weight", name: "Weight_UoM" },
                            ].map((item, index) => (
                                <tr key={index}>
                                    <td className="text-capitalize" colSpan={2}>
                                        {item.label}
                                    </td>
                                    <td colSpan={2}>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name={`${item.name}_value`}
                                            value={
                                                (formData as any)[
                                                    `${item.name}_value`
                                                ] || ""
                                            }
                                            onChange={handleChange}
                                            placeholder="Enter value"
                                        />
                                    </td>
                                    <td colSpan={2}>
                                        <select
                                            className="form-select"
                                            name={item.name}
                                            value={
                                                (formData as any)[item.name] ||
                                                ""
                                            }
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
                            ))}
                            <tr>
                                <td
                                    colSpan={6}
                                    className="text-center w-bold text-center bg-light"
                                >
                                    <label className="form-label ">
                                        <strong>Keywords</strong>
                                    </label>
                                </td>
                            </tr>
                            <tr>
                                <td>Keyword</td>
                                <td colSpan={5}>
                                    <textarea
                                        className="form-control"
                                        name="Keyword"
                                        value={formData.Keyword}
                                        onChange={handleChange}
                                    ></textarea>
                                </td>
                            </tr>

                            {/* SKU E-Commerce List */}
                            <tr>
                                <td
                                    colSpan={6}
                                    className="text-center w-bold bg-light"
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
                                <td>Initial Channel</td>
                                <td>Category</td>
                                <td>Code Number</td>
                                <td>SKU Code</td>
                            </tr>
                            {[1, 2, 3, 4, 5].map((index) => (
                                <tr key={index}>
                                    <td>
                                        <select
                                            name={`StoreName_${index}`}
                                            className="form-select"
                                            value={
                                                (formData as any)[
                                                    `StoreName_${index}`
                                                ] || ""
                                            }
                                            onChange={(e) =>
                                                handleSKUChange(
                                                    e,
                                                    `StoreName_${index}`
                                                )
                                            }
                                        >
                                            <option value="" disabled>
                                                Select a store
                                            </option>
                                            {stores.map((store) => (
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
                                            name={`Channel_${index}`}
                                            className="form-select"
                                            value={
                                                (formData as any)[
                                                    `Channel_${index}`
                                                ] || ""
                                            }
                                            onChange={(e) =>
                                                handleSKUChange(
                                                    e,
                                                    `Channel_${index}`
                                                )
                                            }
                                        >
                                            <option value="" disabled>
                                                Select a Channel
                                            </option>
                                            {channels.map((channel) => (
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
                                        <input
                                            type="text"
                                            className="form-control"
                                            name={`InitialChannel_${index}`}
                                            value={
                                                (formData as any)[
                                                    `InitialChannel_${index}`
                                                ] || ""
                                            }
                                            readOnly // ✅ Makes it read-only
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name={`CategoryFromChannel_${index}`}
                                            value={
                                                (formData as any)[
                                                    `CategoryFromChannel_${index}`
                                                ] || ""
                                            }
                                            readOnly // ✅ Makes it read-only
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name={`CodeNumber_${index}`}
                                            value={
                                                (formData as any)[
                                                    `CodeNumber_${index}`
                                                ] || ""
                                            }
                                            onChange={(e) =>
                                                handleSKUChange(
                                                    e,
                                                    `CodeNumber_${index}`
                                                )
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name={`SKUCodeEcommerce_${index}`}
                                            value={
                                                (formData as any)[
                                                    `SKUCodeEcommerce_${index}`
                                                ] || ""
                                            }
                                            readOnly // ✅ Makes it read-only
                                        />
                                    </td>
                                </tr>
                            ))}

                            {/* Imaages */}
                            <tr>
                                <td
                                    colSpan={6}
                                    className="text-center fw-bold text-center bg-light"
                                >
                                    <label className="form-label">
                                        <strong>Upload Images</strong>
                                    </label>
                                </td>
                            </tr>

                            {/* Images */}
                            <tr>
                                <td colSpan={2}>
                                    <label className="form-label ">
                                        Product Image
                                    </label>
                                </td>
                                <td colSpan={4}>
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
                                <td colSpan={6} className="text-center">
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
