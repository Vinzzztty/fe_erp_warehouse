"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

type ProformaInvoice = {
    Code: number;
    Description: string;
    SKUFull: string;
    ProdCost: number;
    FirstMileCost: number;
    LastMileCost: number;
    SellingPrice: number;
    OrderedQty: number;
};

type Cost = { Code: number; Name: string; Amount: number };

export default function AddBuyingPriceDetailsPage() {
    const { id } = useParams(); // BuyingPriceId
    const router = useRouter();

    const [formData, setFormData] = useState({
        PICode: "",
        SKUFull: "",
        ProdCost: "",
        FirstMileCost: "",
        LastMileCost: "",
        DDPCost: "",
        Biaya: "",
        TrueCost: "",
        TrueCostEach: "",
        DDPCostEach: "",
        SellingPrice: "",
        OrderedQty: "",
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

        // Autofill fields based on PI Code
        if (name === "PICode") {
            const selectedPI = proformaInvoices.find(
                (pi) => pi.Code.toString() === value
            );
            if (selectedPI) {
                const ddpCost =
                    selectedPI.ProdCost +
                    selectedPI.FirstMileCost +
                    selectedPI.LastMileCost;

                setFormData((prev) => ({
                    ...prev,
                    PICode: value,
                    SKUFull: selectedPI.SKUFull,
                    ProdCost: selectedPI.ProdCost.toFixed(2).toString(),
                    FirstMileCost:
                        selectedPI.FirstMileCost.toFixed(2).toString(),
                    LastMileCost: selectedPI.LastMileCost.toFixed(2).toString(),
                    DDPCost: ddpCost.toFixed(2).toString(),
                    OrderedQty: selectedPI.OrderedQty.toString(),
                    DDPCostEach: (ddpCost / selectedPI.OrderedQty)
                        .toFixed(2)
                        .toString(),
                    SellingPrice: selectedPI.SellingPrice.toFixed(2).toString(),
                }));
                return;
            }
        }

        // Autofill Biaya (Cost)
        if (name === "Biaya") {
            const selectedCost = costs.find(
                (cost) => cost.Code.toString() === value
            );
            if (selectedCost) {
                setFormData((prev) => {
                    const trueCost =
                        parseFloat(prev.DDPCost || "0") + selectedCost.Amount;
                    return {
                        ...prev,
                        Biaya: value,
                        TrueCost: trueCost.toFixed(2).toString(),
                        TrueCostEach: prev.OrderedQty
                            ? (trueCost / parseFloat(prev.OrderedQty))
                                  .toFixed(2)
                                  .toString()
                            : "0",
                    };
                });
                return;
            }
        }

        // Normal state update
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleManualUpdate = () => {
        const ddpCost =
            parseFloat(formData.ProdCost || "0") +
            parseFloat(formData.FirstMileCost || "0") +
            parseFloat(formData.LastMileCost || "0");

        setFormData((prev) => ({
            ...prev,
            DDPCost: ddpCost.toFixed(2).toString(),
            DDPCostEach: prev.OrderedQty
                ? (ddpCost / parseFloat(prev.OrderedQty)).toFixed(2).toString()
                : "0",
        }));
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

                {/* Editable Fields */}
                {[
                    { label: "SKU Full", name: "SKUFull", readOnly: true },
                    {
                        label: "Prod. Cost / EXW",
                        name: "ProdCost",
                        readOnly: false,
                    },
                    {
                        label: "First Mile Cost",
                        name: "FirstMileCost",
                        readOnly: false,
                    },
                    {
                        label: "Last Mile Cost",
                        name: "LastMileCost",
                        readOnly: false,
                    },
                    {
                        label: "Selling Price",
                        name: "SellingPrice",
                        readOnly: false,
                    },
                ].map((field) => (
                    <div className="mb-3" key={field.name}>
                        <label htmlFor={field.name} className="form-label">
                            {field.label}
                        </label>
                        <input
                            type="text"
                            id={field.name}
                            name={field.name}
                            className="form-control"
                            value={
                                formData[field.name as keyof typeof formData]
                            }
                            onChange={handleChange}
                            readOnly={field.readOnly}
                            onBlur={
                                !field.readOnly ? handleManualUpdate : undefined
                            }
                        />
                    </div>
                ))}

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

                {/* Submit Button */}
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
