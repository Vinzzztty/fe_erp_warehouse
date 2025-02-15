"use client"; 

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

// Define interfaces based on the API response for CXCode, PICode, SKUCode, and the Product
interface Product {
  SKUCode: string;
  Name: string;
}

interface CXCode {
  Code: number;
  Name: string;
}

interface PICode {
  Code: number;
  Name: string;
}

interface FormData {
  GoodsReceiptId: number;
  CXCode: string;
  PICode: string;
  SKUCode: string;
  ProductName: string;
  OrderedQty: number;
  ReceivedQty: number;
  Condition: string;
  Notes: string;
}

export default function AddGoodsReceiptDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    GoodsReceiptId: 0, // initially set to 0 or default value
    CXCode: "",
    PICode: "",
    SKUCode: "",
    ProductName: "",
    OrderedQty: 0,
    ReceivedQty: 0,
    Condition: "",
    Notes: "",
  });
  const [cxCodes, setCxCodes] = useState<CXCode[]>([]);
  const [piCodes, setPiCodes] = useState<PICode[]>([]);
  const [grId, setGrId] = useState<string | null>(searchParams.get("id"));
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch CXCodes, PICodes, and Products on page load
  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoading(true);
      try {
        // Fetch CX Codes
        const cxResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-quotations`);
        const cxData = await cxResponse.json();
        setCxCodes(cxData.data || []);

        // Fetch PI Codes
        const piResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoices`);
        const piData = await piResponse.json();
        setPiCodes(piData.data || []);

        // Fetch Products
        const productResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/master/products`);
        const productData = await productResponse.json();
        setProducts(productData.data || []);
      } catch (error) {
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDropdownData();

    // Set GoodsReceiptId from URL parameter if present
    if (grId) {
      setFormData((prevData) => ({
        ...prevData,
        GoodsReceiptId: Number(grId),
      }));
    }
  }, [grId]);

  // Fetch ordered quantity when PICode is selected
  const handlePiCodeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPICode = e.target.value;
    setFormData((prevData) => ({ ...prevData, PICode: selectedPICode }));

    if (selectedPICode) {
      try {
        const piDetailResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoice-details/by-proforma-invoice/${selectedPICode}`
        );
        const piDetailData = await piDetailResponse.json();
        const orderedQty = piDetailData.data.reduce((sum: number, detail: any) => sum + parseFloat(detail.QTYOrdered), 0);
        setFormData((prevData) => ({ ...prevData, OrderedQty: orderedQty }));
      } catch (error) {
        setError("Failed to fetch Proforma Invoice details.");
      }
    }
  };

  // Handle SKUCode change to auto-fill Product Name
  const handleSKUCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSKUCode = e.target.value;
    const selectedProduct = products.find((product) => product.SKUCode === selectedSKUCode);
    setFormData((prevData) => ({
      ...prevData,
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
      GoodsReceiptId: formData.GoodsReceiptId,
      CXCode: formData.CXCode,
      PICode: formData.PICode,
      SKUCode: formData.SKUCode,
      ProductName: formData.ProductName,
      OrderedQty: formData.OrderedQty,
      ReceivedQty: formData.ReceivedQty,
      Condition: formData.Condition,
      Notes: formData.Notes,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/goods-receipt-detils`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create Goods Receipt Detail.");
      }

      router.push("/transaction/goods-receipt");
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Add Goods Receipt Detail</h1>
      {error && <div className="alert alert-danger mt-4">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4">
          {/* CXCode Dropdown */}
          <div className="mb-3">
            <label htmlFor="CXCode" className="form-label">
              CX Code
            </label>
            <select
              id="CXCode"
              className="form-control"
              value={String(formData.CXCode)}
              onChange={(e) => setFormData({ ...formData, CXCode: e.target.value })}
            >
              <option value="">Select CX Code</option>
              {cxCodes.map((cx) => (
                <option key={cx.Code} value={cx.Code}>
                  {cx.Code}
                </option>
              ))}
            </select>
          </div>

          {/* PICode Dropdown */}
          <div className="mb-3">
            <label htmlFor="PICode" className="form-label">
              PI Code
            </label>
            <select
              id="PICode"
              className="form-control"
              value={formData.PICode}
              onChange={handlePiCodeChange}
            >
              <option value="">Select PI Code</option>
              {piCodes.map((pi) => (
                <option key={pi.Code} value={pi.Code}>
                  {pi.Code}
                </option>
              ))}
            </select>
          </div>

          {/* SKUCode Dropdown */}
          <div className="mb-3">
            <label htmlFor="SKUCode" className="form-label">
              SKU Code
            </label>
            <select
              id="SKUCode"
              className="form-control"
              value={formData.SKUCode}
              onChange={handleSKUCodeChange}
            >
              <option value="">Select SKU Code</option>
              {products.map((product) => (
                <option key={product.SKUCode} value={product.SKUCode}>
                  {product.SKUCode}
                </option>
              ))}
            </select>
          </div>

          {/* Product Name */}
          <div className="mb-3">
            <label htmlFor="ProductName" className="form-label">
              Product Name
            </label>
            <input
              type="text"
              id="ProductName"
              className="form-control"
              value={formData.ProductName}
              readOnly
            />
          </div>

          {/* Ordered and Received Quantities */}
          <div className="mb-3">
            <label htmlFor="OrderedQty" className="form-label">
              Ordered Quantity
            </label>
            <input
              type="number"
              id="OrderedQty"
              className="form-control"
              value={formData.OrderedQty}
              onChange={(e) => setFormData({ ...formData, OrderedQty: +e.target.value })}
              readOnly
            />
          </div>

          <div className="mb-3">
            <label htmlFor="ReceivedQty" className="form-label">
              Received Quantity
            </label>
            <input
              type="number"
              id="ReceivedQty"
              className="form-control"
              value={formData.ReceivedQty}
              onChange={(e) => setFormData({ ...formData, ReceivedQty: +e.target.value })}
            />
          </div>

          {/* Condition and Notes */}
          <div className="mb-3">
            <label htmlFor="Condition" className="form-label">
              Condition
            </label>
            <input
              type="text"
              id="Condition"
              className="form-control"
              value={formData.Condition}
              onChange={(e) => setFormData({ ...formData, Condition: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="Notes" className="form-label">
              Notes
            </label>
            <textarea
              id="Notes"
              className="form-control"
              value={formData.Notes}
              onChange={(e) => setFormData({ ...formData, Notes: e.target.value })}
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
