"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Define the Product interface
interface Product {
  SKUCode: string;
  Name: string;
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
  Note: string;
}

export default function AddPODetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [poId, setPoId] = useState(searchParams.get("id") || "");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    Note: "",
  });
  useEffect(() => {
    const poCodeFromURL = searchParams.get("id");
    if (poCodeFromURL) {
      setPoId(poCodeFromURL);
    }
  }, [searchParams]);
  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
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

        if (products.length > 0) {
          setFormData((prev) => ({
            ...prev,
            SKUCode: products[0].SKUCode || "",
            ProductName: products[0].Name || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
        setError("Could not load product data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [poId]);

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
          errorData.message || "Failed to create Purchase Order Detail."
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
      <h1>Add Purchase Order Detail</h1>

      {error && <div className="alert alert-danger mt-4">{error}</div>}

      {loading ? (
        <p>Loading product data...</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-3">
            <label htmlFor="SKUCode" className="form-label">
              SKU Code
            </label>
            <select
              id="SKUCode"
              name="SKUCode"
              className="form-control"
              value={formData.SKUCode}
              onChange={handleSKUCodeChange}
              required
            >
              <option value="">Select SKU Code</option>
              {products.map((product) => (
                <option key={product.SKUCode} value={product.SKUCode}>
                  {product.SKUCode}
                </option>
              ))}
            </select>
          </div>

          {/* Input fields for all data */}
          {[
            { label: "Product Name", id: "ProductName", type: "text" },
            { label: "Variant", id: "Variant", type: "text" },
            { label: "Product Image URL", id: "ProductImage", type: "text" },
            { label: "Quantity", id: "QTY", type: "number" },
            { label: "Unit Price", id: "UnitPrice", type: "number" },
            { label: "Carton Length (L)", id: "CartonL", type: "number" },
            { label: "Carton Width (P)", id: "CartonP", type: "number" },
            { label: "Carton Height (T)", id: "CartonT", type: "number" },
            { label: "Carton Quantity", id: "CartonQty", type: "number" },
          ].map(({ label, id, type }) => (
            <div className="mb-3" key={id}>
              <label htmlFor={id} className="form-label">
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
                    [id]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value,
                  })
                }
                required
              />
            </div>
          ))}

          <div className="mb-3">
            <label htmlFor="Note" className="form-label">
              Note
            </label>
            <textarea
              id="Note"
              name="Note"
              className="form-control"
              value={formData.Note}
              onChange={(e) =>
                setFormData({ ...formData, Note: e.target.value })
              }
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      )}
    </div>
  );
}
