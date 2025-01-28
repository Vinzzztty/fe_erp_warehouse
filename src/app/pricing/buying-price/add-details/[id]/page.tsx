"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

type BuyingPrice = { Code: number; Name: string };
type ProformaInvoice = { Code: number; Description: string };
type Cost = { Code: number; Name: string };

export default function AddBuyingPriceDetailsPage() {
    const { id } = useParams(); // BuyingPriceId
    const router = useRouter();

    const [formData, setFormData] = useState({
        PICode: "",
        SKUFull: "",
        SKUParent: "",
        SKUCode: "",
        SKUCodeChild: "",
        Name: "",
        ProdCost: "",
        FirstMileCost: "",
        LastMileCost: "",
        Biaya: "",
        SellingPrice: "",
    });

    const [proformaInvoices, setProformaInvoices] = useState<ProformaInvoice[]>(
        []
    );
    const [costs, setCosts] = useState<Cost[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch Proforma Invoices and Costs
        const fetchDropdownData = async () => {
            try {
                const [piResponse, costResponse] = await Promise.all([
                    fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoice-details`
                    ),
                    fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/costs`
                    ),
                ]);

                if (!piResponse.ok || !costResponse.ok) {
                    throw new Error("Failed to fetch dropdown data.");
                }

                const piData = await piResponse.json();
                const costData = await costResponse.json();

                setProformaInvoices(piData.data || []);
                setCosts(costData.data || []);
            } catch (error: any) {
                console.error("Error fetching dropdown data:", error);
                setError(error.message || "An unexpected error occurred.");
            }
        };

        fetchDropdownData();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/product_pricing/buying-price-details`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData, BuyingPriceId: id }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to add buying price detail.");
            }

            // Redirect back to details page
            router.push(`/pricing/buying-price/details/${id}`);
        } catch (error: any) {
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Add New Buying Price Details</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="mt-4">
                {/* Proforma Invoice Dropdown */}
                <div className="mb-3">
                    <label htmlFor="PICode" className="form-label">
                        Proforma Invoice
                    </label>
                    <select
                        id="PICode"
                        name="PICode"
                        className="form-select"
                        value={formData.PICode}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>
                            Select Proforma Invoice
                        </option>
                        {proformaInvoices.map((pi) => (
                            <option key={pi.Code} value={pi.Code}>
                                {pi.Description}
                            </option>
                        ))}
                    </select>
                </div>

                {/* SKU Full */}
                <div className="mb-3">
                    <label htmlFor="SKUFull" className="form-label">
                        SKU Full
                    </label>
                    <input
                        type="text"
                        id="SKUFull"
                        name="SKUFull"
                        className="form-control"
                        value={formData.SKUFull}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* SKU Parent */}
                <div className="mb-3">
                    <label htmlFor="SKUParent" className="form-label">
                        SKU Parent
                    </label>
                    <input
                        type="text"
                        id="SKUParent"
                        name="SKUParent"
                        className="form-control"
                        value={formData.SKUParent}
                        onChange={handleChange}
                    />
                </div>

                {/* Cost Dropdown */}
                <div className="mb-3">
                    <label htmlFor="Biaya" className="form-label">
                        Cost
                    </label>
                    <select
                        id="Biaya"
                        name="Biaya"
                        className="form-select"
                        value={formData.Biaya}
                        onChange={handleChange}
                    >
                        <option value="" disabled>
                            Select Cost
                        </option>
                        {costs.map((cost) => (
                            <option key={cost.Code} value={cost.Code}>
                                {cost.Name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Production Cost */}
                <div className="mb-3">
                    <label htmlFor="ProdCost" className="form-label">
                        Production Cost
                    </label>
                    <input
                        type="number"
                        id="ProdCost"
                        name="ProdCost"
                        className="form-control"
                        value={formData.ProdCost}
                        onChange={handleChange}
                        step="0.01"
                    />
                </div>

                {/* Selling Price */}
                <div className="mb-3">
                    <label htmlFor="SellingPrice" className="form-label">
                        Selling Price
                    </label>
                    <input
                        type="number"
                        id="SellingPrice"
                        name="SellingPrice"
                        className="form-control"
                        value={formData.SellingPrice}
                        onChange={handleChange}
                        step="0.01"
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Add Details"}
                </button>
            </form>
        </div>
    );
}
