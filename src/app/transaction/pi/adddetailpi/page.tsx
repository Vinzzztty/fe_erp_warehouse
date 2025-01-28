"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Define the Product interface based on the API response
interface Product {
  Code: number;
  Name: string;
  SKUCode: string;
  Notes: string | null;
}

// Define the FormData interface
interface FormData {
  ProformaInvoiceId: string;
  SKUCode: string;
  QTYOrdered: number;
  QTYApproved: number;
  UnitPriceOrdered: number;
  UnitPriceApproved: number;
  CartonP: number;
  CartonL: number;
  CartonT: number;
  CartonQty: number;
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
    QTYOrdered: 0,
    QTYApproved: 0,
    UnitPriceOrdered: 0,
    UnitPriceApproved: 0,
    CartonP: 0,
    CartonL: 0,
    CartonT: 0,
    CartonQty: 0,
    Credit: 0.0,
    Note: "",
  });

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
            Note: products[0].Notes || "",
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
  }, [productId]);

  // Handle SKU Code dropdown change
  const handleSKUCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSKUCode = e.target.value;
    const selectedProduct = products.find(
      (product) => product.SKUCode === selectedSKUCode
    );

    setFormData((prev) => ({
      ...prev,
      SKUCode: selectedSKUCode,
      Note: selectedProduct?.Notes || "",
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ProformaInvoiceId: parseInt(productId, 10),
      SKUCode: formData.SKUCode,
      QTYOrdered: formData.QTYOrdered,
      QTYApproved: formData.QTYApproved,
      UnitPriceOrdered: formData.UnitPriceOrdered,
      UnitPriceApproved: formData.UnitPriceApproved,
      CartonP: formData.CartonP,
      CartonL: formData.CartonL,
      CartonT: formData.CartonT,
      CartonQty: formData.CartonQty,
      Credit: formData.Credit,
      Note: formData.Note,
    };

    console.log("Payload to send:", payload);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoice-details`,
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
          errorData.message || "Failed to create Proforma Invoice Detail."
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
      <h1>Add Proforma Invoice Detail</h1>

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
            { label: "Quantity Ordered", id: "QTYOrdered" },
            { label: "Quantity Approved", id: "QTYApproved" },
            { label: "Unit Price Ordered", id: "UnitPriceOrdered" },
            { label: "Unit Price Approved", id: "UnitPriceApproved" },
            { label: "Carton Length (L)", id: "CartonL" },
            { label: "Carton Width (P)", id: "CartonP" },
            { label: "Carton Height (T)", id: "CartonT" },
            { label: "Carton Quantity", id: "CartonQty" },
            { label: "Credit", id: "Credit" },
          ].map(({ label, id }) => (
            <div className="mb-3" key={id}>
              <label htmlFor={id} className="form-label">
                {label}
              </label>
              <input
                type="number"
                id={id}
                name={id}
                className="form-control"
                value={(formData as any)[id]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [id]: parseFloat(e.target.value) || 0,
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
