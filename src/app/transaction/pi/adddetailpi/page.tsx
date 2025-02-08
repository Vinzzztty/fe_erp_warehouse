"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Define the Product interface based on the API response
interface Product {
    Code: number;
    Name: string;
    SKUCode: string;
    Notes: string | null;
    Variant?: { Name: string };
    ImageURL?: string;
}

// Define FormData interface
interface FormData {
    ProformaInvoiceId: string;
    SKUCode: string;
    ProductName: string;
    Variant: string;
    ProductImage: string;
    QTYOrdered: number;
    QTYApproved: number;
    UnitPriceOrdered: number;
    UnitPriceApproved: number;
    CartonP: number;
    CartonL: number;
    CartonT: number;
    CartonQty: number;
    PricePerCarton: number; // Auto-calculated
    EstimatedCBMTotal: number; // Auto-calculated
    FirstMile: number;
    CartonWeight?: number; // Optional
    MarkingNumber?: string; // Optional
    Credit: number;
    Note: string;
}

export default function AddProformaInvoiceDetailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [productId, setProductId] = useState(searchParams.get("id") || "");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>({
        ProformaInvoiceId: productId,
        SKUCode: "",
        ProductName: "",
        Variant: "",
        ProductImage: "",
        QTYOrdered: 0,
        QTYApproved: 0,
        UnitPriceOrdered: 0,
        UnitPriceApproved: 0,
        CartonP: 0,
        CartonL: 0,
        CartonT: 0,
        CartonQty: 0,
        PricePerCarton: 0,
        EstimatedCBMTotal: 0,
        FirstMile: 0,
        CartonWeight: undefined,
        MarkingNumber: "",
        Credit: 0.0,
        Note: "",
    });

    // Update productId when URL parameter changes
    useEffect(() => {
        const productIdFromURL = searchParams.get("id");
        if (productIdFromURL && productIdFromURL !== productId) {
            setProductId(productIdFromURL);
        }
    }, [searchParams, productId]);

    // Fetch product data when productId changes
    useEffect(() => {
        if (!productId) return; // Prevent unnecessary API calls

        const fetchProductData = async () => {
            setLoading(true);
            setError(null); // Reset error before fetching

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/products`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch product data.");
                }

                const result = await response.json();
                console.log("API Response:", result);

                const products: Product[] = result.data || [];
                setProducts(products);

                // Auto-fill form only if it's empty (Avoid overwriting user input)
                setFormData((prev) => ({
                    ...prev,
                    SKUCode: prev.SKUCode || products[0]?.SKUCode || "",
                    ProductName: prev.ProductName || products[0]?.Name || "",
                    Variant: prev.Variant || products[0]?.Variant?.Name || "",
                    ProductImage:
                        prev.ProductImage || products[0]?.ImageURL || "",
                    Note: prev.Note || products[0]?.Notes || "",
                }));
            } catch (error) {
                console.error("Error fetching product data:", error);
                setError("Could not load product data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
    }, [productId]); // Fetch only when 'productId' changes

    const handleSKUCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedSKUCode = e.target.value;
        const selectedProduct = products.find(
            (product) => product.SKUCode === selectedSKUCode
        );

        setFormData((prev) => ({
            ...prev,
            SKUCode: selectedSKUCode,
            ProductName: selectedProduct?.Name || "",
            Variant: selectedProduct?.Variant?.Name || "", // Ensure correct path
            ProductImage: selectedProduct?.ImageURL || "",
        }));
    };

    // Handle form input changes & auto-calculations
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        let updatedValue: number | string = value;

        if (e.target.type === "number") {
            updatedValue = parseFloat(value) || 0;
        }

        setFormData((prev) => {
            const updatedForm = { ...prev, [name]: updatedValue };

            // Auto-calculate PricePerCarton
            if (["UnitPriceOrdered", "CartonQty"].includes(name)) {
                updatedForm.PricePerCarton =
                    updatedForm.UnitPriceOrdered * updatedForm.CartonQty;
            }

            // Auto-calculate EstimatedCBMTotal
            if (["CartonP", "CartonL", "CartonT", "CartonQty"].includes(name)) {
                updatedForm.EstimatedCBMTotal = updatedForm.EstimatedCBMTotal =
                    (updatedForm.CartonP *
                        updatedForm.CartonL *
                        updatedForm.CartonT *
                        updatedForm.CartonQty) /
                    100;
            }

            return updatedForm;
        });
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Ensure PricePerCarton & EstimatedCBMTotal are calculated before sending
        const payload = {
            ProformaInvoiceId: parseInt(productId, 10),
            SKUCode: formData.SKUCode,
            ProductName: formData.ProductName,
            Variant: formData.Variant,
            ProductImage: formData.ProductImage,
            QTYOrdered: formData.QTYOrdered,
            QTYApproved: formData.QTYApproved,
            UnitPriceOrdered: formData.UnitPriceOrdered,
            UnitPriceApproved: formData.UnitPriceApproved,
            CartonP: formData.CartonP,
            CartonL: formData.CartonL,
            CartonT: formData.CartonT,
            CartonQty: formData.CartonQty,
            PricePerCarton: formData.PricePerCarton.toFixed(2), // Ensure 2 decimal places
            EstimatedCBMTotal: formData.EstimatedCBMTotal.toFixed(3), // Ensure 3 decimal places
            FirstMile: formData.FirstMile,
            Credit: formData.Credit,
            Note: formData.Note,
        };

        console.log("Payload to send:", payload);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoice-details`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        "Failed to create Proforma Invoice Detail."
                );
            }

            router.push(`/transaction/pi`);
        } catch (error: any) {
            console.error("Error submitting Proforma Invoice Detail:", error);
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-header bg-dark text-white">
                    <h4 className="mb-0">Add Proforma Invoice Detail</h4>
                </div>
                <div className="card-body">
                    {error && <div className="alert alert-danger">{error}</div>}

                    {loading ? (
                        <p className="text-center">Loading product data...</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="row g-3">
                            {/* SKU Code Selection */}
                            <div className="col-md-6">
                                <label
                                    htmlFor="SKUCode"
                                    className="form-label fw-bold"
                                >
                                    SKU Code
                                </label>
                                <select
                                    id="SKUCode"
                                    name="SKUCode"
                                    className="form-select"
                                    value={formData.SKUCode}
                                    onChange={handleSKUCodeChange}
                                    required
                                >
                                    <option value="">Select SKU Code</option>
                                    {products.map((product) => (
                                        <option
                                            key={product.SKUCode}
                                            value={product.SKUCode}
                                        >
                                            {product.SKUCode}
                                        </option>
                                    ))}
                                </select>
                                <label className="form-label fw-bold mt-2">
                                    Product Details
                                </label>
                                <div className="row g-2">
                                    {[
                                        {
                                            label: "Product Name",
                                            id: "ProductName",
                                        },
                                        {
                                            label: "Variant",
                                            id: "Variant",
                                            type: "text",
                                        },
                                    ].map(({ label, id }) => (
                                        <div className="col-md-6" key={id}>
                                            <label
                                                htmlFor={id}
                                                className="form-label"
                                            >
                                                {label}
                                            </label>
                                            <input
                                                type="text"
                                                id={id}
                                                name={id}
                                                className="form-control"
                                                value={(formData as any)[id]}
                                                readOnly
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quantity & Pricing */}
                            <div className="col-md-6">
                                <label className="form-label fw-bold">
                                    Quantity & Pricing
                                </label>
                                <div className="row g-2">
                                    {[
                                        {
                                            label: "QTY Ordered",
                                            id: "QTYOrdered",
                                        },
                                        {
                                            label: "QTY Approved",
                                            id: "QTYApproved",
                                        },
                                        {
                                            label: "Unit Price Ordered",
                                            id: "UnitPriceOrdered",
                                        },
                                        {
                                            label: "Unit Price Approved",
                                            id: "UnitPriceApproved",
                                        },
                                    ].map(({ label, id }) => (
                                        <div className="col-md-6" key={id}>
                                            <label
                                                htmlFor={id}
                                                className="form-label"
                                            >
                                                {label}
                                            </label>
                                            <input
                                                type="number"
                                                id={id}
                                                name={id}
                                                className="form-control"
                                                value={(formData as any)[id]}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Carton Dimensions */}
                            <div className="col-md-12">
                                <label className="form-label fw-bold">
                                    Carton Dimensions (m)
                                </label>
                                <div className="row g-2">
                                    {[
                                        { label: "Width (P)", id: "CartonP" },
                                        { label: "Length (L)", id: "CartonL" },
                                        { label: "Height (T)", id: "CartonT" },
                                        {
                                            label: "Carton Quantity",
                                            id: "CartonQty",
                                        },
                                        {
                                            label: "FirstMile",
                                            id: "FirstMile",
                                        },
                                    ].map(({ label, id }) => (
                                        <div className="col-md-3" key={id}>
                                            <label
                                                htmlFor={id}
                                                className="form-label"
                                            >
                                                {label}
                                            </label>
                                            <input
                                                type="number"
                                                id={id}
                                                name={id}
                                                className="form-control"
                                                value={(formData as any)[id]}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Auto-Calculated Fields */}
                            <div className="col-md-6">
                                <label className="form-label fw-bold">
                                    Auto-Calculated Fields
                                </label>
                                <div className="row g-2">
                                    {[
                                        {
                                            label: "Price Per Carton",
                                            id: "PricePerCarton",
                                        },
                                        {
                                            label: "Estimated CBM Total",
                                            id: "EstimatedCBMTotal",
                                        },
                                    ].map(({ label, id }) => (
                                        <div className="col-md-6" key={id}>
                                            <label
                                                htmlFor={id}
                                                className="form-label"
                                            >
                                                {label}
                                            </label>
                                            <input
                                                type="text"
                                                id={id}
                                                name={id}
                                                className="form-control"
                                                value={(formData as any)[
                                                    id
                                                ].toFixed(2)}
                                                readOnly
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Optional Fields */}
                            <div className="col-md-6">
                                <label className="form-label fw-bold">
                                    Additional Information
                                </label>
                                <div className="row g-2">
                                    {[
                                        {
                                            label: "Carton Weight (kg)",
                                            id: "CartonWeight",
                                        },
                                        {
                                            label: "Marking Number",
                                            id: "MarkingNumber",
                                        },
                                        { label: "Credit", id: "Credit" },
                                    ].map(({ label, id }) => (
                                        <div className="col-md-4" key={id}>
                                            <label
                                                htmlFor={id}
                                                className="form-label"
                                            >
                                                {label}
                                            </label>
                                            <input
                                                type="text"
                                                id={id}
                                                name={id}
                                                className="form-control"
                                                value={
                                                    (formData as any)[id] || ""
                                                }
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Product Image Preview */}
                            {formData.ProductImage && (
                                <div className="col-12 text-center">
                                    <p className="fw-bold">
                                        Product Image Preview:
                                    </p>
                                    <img
                                        src={formData.ProductImage}
                                        alt="Product Preview"
                                        className="img-thumbnail shadow-sm"
                                        style={{
                                            width: "200px",
                                            height: "200px",
                                            objectFit: "cover",
                                            borderRadius: "10px",
                                        }}
                                    />
                                </div>
                            )}

                            {/* Note Field */}
                            <div className="col-12">
                                <label
                                    htmlFor="Note"
                                    className="form-label fw-bold"
                                >
                                    Note
                                </label>
                                <textarea
                                    id="Note"
                                    name="Note"
                                    className="form-control"
                                    rows={3}
                                    value={formData.Note}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            Note: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="col-12 text-center">
                                <button
                                    type="submit"
                                    className="btn btn-primary px-4 py-2"
                                >
                                    <i className="bi bi-save me-2"></i> Submit
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
