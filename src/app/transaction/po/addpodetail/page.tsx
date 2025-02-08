"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Define the Product interface
interface Product {
    SKUCode: string;
    Name: string;
    Variant?: { Name: string }; // Corrected Variant structure
    ImageURL?: string; // Product Image URL
}

// Define the FormData interface
interface FormData {
    PurchaseOrderId: string;
    SKUCode: string;
    ProductName: string;
    Variant: string;
    ProductImage: string;
    QTY: number;
    UnitPrice: number;
    CartonP: number;
    CartonL: number;
    CartonT: number;
    CartonQty: number;
    PricePerCarton: number; // Auto-calculated
    EstimatedCBMTotal: number; // Auto-calculated
    CartonWeight?: number; // Optional
    MarkingNumber?: string; // Optional
    Credit?: string; // Optional
    Note: string;
}

export default function AddPODetailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [poId, setPoId] = useState(searchParams.get("id") || "");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize formData state
    const [formData, setFormData] = useState<FormData>({
        PurchaseOrderId: poId,
        SKUCode: "",
        ProductName: "",
        Variant: "",
        ProductImage: "",
        QTY: 0,
        UnitPrice: 0,
        CartonP: 0,
        CartonL: 0,
        CartonT: 0,
        CartonQty: 0,
        PricePerCarton: 0, // Auto-calculate
        EstimatedCBMTotal: 0, // Auto-calculate
        CartonWeight: undefined,
        MarkingNumber: "",
        Credit: "",
        Note: "",
    });

    // Update poId when URL parameter changes
    useEffect(() => {
        const poCodeFromURL = searchParams.get("id");
        if (poCodeFromURL && poCodeFromURL !== poId) {
            setPoId(poCodeFromURL);
        }
    }, [searchParams, poId]);

    // Fetch product data when poId changes
    useEffect(() => {
        if (!poId) return; // Prevent unnecessary API calls if poId is empty

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
                }));
            } catch (error) {
                console.error("Error fetching product data:", error);
                setError("Could not load product data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
    }, [poId]); // Fetch only when 'poId' changes
    // Handle SKU Code dropdown change
    const handleSKUCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedSKUCode = e.target.value;
        const selectedProduct = products.find(
            (product) => product.SKUCode === selectedSKUCode
        );

        setFormData((prev) => ({
            ...prev,
            SKUCode: selectedSKUCode,
            ProductName: selectedProduct?.Name || "",
            Variant: selectedProduct?.Variant?.Name || "",
            ProductImage: selectedProduct?.ImageURL || "",
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            PurchaseOrderId: parseInt(poId, 10),
            SKUCode: formData.SKUCode,
            ProductName: formData.ProductName,
            Variant: formData.Variant,
            ProductImage: formData.ProductImage,
            QTY: formData.QTY,
            UnitPrice: formData.UnitPrice,
            CartonP: formData.CartonP,
            CartonL: formData.CartonL,
            CartonT: formData.CartonT,
            CartonQty: formData.CartonQty,
            PricePerCarton: formData.PricePerCarton, // Auto-calculated
            EstimatedCBMTotal: formData.EstimatedCBMTotal, // Auto-calculated
            CartonWeight: formData.CartonWeight || null, // Optional
            MarkingNumber: formData.MarkingNumber || null, // Optional
            Credit: formData.Credit || null, // Optional
            Note: formData.Note,
        };

        console.log("Payload to send:", payload);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/purchase-order-details`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        "Failed to create Purchase Order Detail."
                );
            }

            router.push(`/transaction/po`);
        } catch (error: any) {
            console.error("Error submitting Purchase Order Detail:", error);
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-header bg-dark text-white">
                    <h4 className="mb-0">Add Purchase Order Detail</h4>
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
                            </div>

                            {/* Input fields for Product Info */}
                            {[
                                {
                                    label: "Product Name",
                                    id: "ProductName",
                                    type: "text",
                                },
                                {
                                    label: "Variant",
                                    id: "Variant",
                                    type: "text",
                                },
                                {
                                    label: "Product Image URL",
                                    id: "ProductImage",
                                    type: "text",
                                },
                                {
                                    label: "Quantity",
                                    id: "QTY",
                                    type: "number",
                                },
                                {
                                    label: "Unit Price",
                                    id: "UnitPrice",
                                    type: "number",
                                },
                                {
                                    label: "Carton Quantity",
                                    id: "CartonQty",
                                    type: "number",
                                },
                            ].map(({ label, id, type }) => (
                                <div className="col-md-6" key={id}>
                                    <label
                                        htmlFor={id}
                                        className="form-label fw-bold"
                                    >
                                        {label}
                                    </label>
                                    <input
                                        type={type}
                                        id={id}
                                        name={id}
                                        className="form-control"
                                        value={(formData as any)[id]}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                [id]:
                                                    type === "number"
                                                        ? parseFloat(
                                                              e.target.value
                                                          ) || 0
                                                        : e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                            ))}

                            {/* Carton Dimension (M) Group */}
                            <div className="col-12">
                                <fieldset className="border p-3 rounded">
                                    <legend className="float-none w-auto px-3 fw-bold">
                                        Carton Dimension* (M)
                                    </legend>

                                    <div className="row text-center">
                                        {["CartonP", "CartonL", "CartonT"].map(
                                            (id, index) => (
                                                <div
                                                    className="col-md-4"
                                                    key={id}
                                                >
                                                    <label
                                                        htmlFor={id}
                                                        className="form-label fw-bold"
                                                    >
                                                        {["P", "L", "T"][index]}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id={id}
                                                        name={id}
                                                        className="form-control"
                                                        value={
                                                            (formData as any)[
                                                                id
                                                            ]
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                [id]:
                                                                    parseFloat(
                                                                        e.target
                                                                            .value
                                                                    ) || 0,
                                                            })
                                                        }
                                                        required
                                                    />
                                                </div>
                                            )
                                        )}
                                    </div>
                                </fieldset>
                            </div>

                            {/* Price per Carton (Auto-calculated) */}
                            <div className="col-md-6">
                                <label
                                    htmlFor="PricePerCarton"
                                    className="form-label fw-bold"
                                >
                                    Price per Carton
                                </label>
                                <input
                                    type="number"
                                    id="PricePerCarton"
                                    name="PricePerCarton"
                                    className="form-control"
                                    value={
                                        formData.UnitPrice *
                                            formData.CartonQty || 0
                                    }
                                    readOnly
                                />
                            </div>

                            {/* Estimated CBM Total (Auto-calculated) */}
                            <div className="col-md-6">
                                <label
                                    htmlFor="EstimatedCBMTotal"
                                    className="form-label fw-bold"
                                >
                                    Estimated CBM Total
                                </label>
                                <input
                                    type="number"
                                    id="EstimatedCBMTotal"
                                    name="EstimatedCBMTotal"
                                    className="form-control"
                                    value={
                                        formData.CartonP *
                                            formData.CartonL *
                                            formData.CartonT || 0
                                    }
                                    readOnly
                                />
                            </div>

                            {/* Optional Fields */}
                            {[
                                {
                                    label: "Carton Weight",
                                    id: "CartonWeight",
                                    type: "number",
                                },
                                {
                                    label: "Marking Number",
                                    id: "MarkingNumber",
                                    type: "number",
                                },
                                { label: "Credit", id: "Credit", type: "text" },
                            ].map(({ label, id, type }) => (
                                <div className="col-md-6" key={id}>
                                    <label
                                        htmlFor={id}
                                        className="form-label fw-bold"
                                    >
                                        {label}{" "}
                                        {type === "text" ? "(Optional)" : ""}
                                    </label>
                                    <input
                                        type={type}
                                        id={id}
                                        name={id}
                                        className="form-control"
                                        value={(formData as any)[id] || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                [id]:
                                                    type === "number"
                                                        ? parseFloat(
                                                              e.target.value
                                                          ) || 0
                                                        : e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            ))}

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
