"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Define FormData interface
interface FormData {
    TransaksiLastMileId: string;
    CXCode: number;
    LastMileTracking: string;
    FreightCode: string;
    WarehouseCode: number;
    WarehouseAddress: string;
    Courier: string;
    ShippingCost: number;
    AdditionalCost: number;
}

interface Warehouse {
    Code: number;
    Name: string;
    Address: string;
}

interface CXInvoice {
    Code: number;
    Date: string;
    ForwarderId: number;
    Note: string | null;
    Status: string;
}

export default function AddLastMileDetailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [lmCode, setLmCode] = useState(searchParams.get("id") || "");
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [cxInvoices, setCxInvoices] = useState<CXInvoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>({
        TransaksiLastMileId: lmCode,
        CXCode: 0,
        LastMileTracking: "",
        FreightCode: "",
        WarehouseCode: 0,
        WarehouseAddress: "",
        Courier: "",
        ShippingCost: 0,
        AdditionalCost: 0,
    });

    // Fetch CX Invoices
    useEffect(() => {
        const fetchCXInvoices = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-invoices`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch CX invoices.");
                }

                const data = await response.json();
                if (data.status.code === 200) {
                    setCxInvoices(data.data || []);
                }
            } catch (error) {
                console.error("Error fetching CX invoices:", error);
                setError("Could not load CX invoices.");
            }
        };

        fetchCXInvoices();
    }, []);

    // Fetch Warehouse Data
    useEffect(() => {
        const fetchWarehouses = async () => {
            setLoading(true);
            setError(null); // Reset error before fetching

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/warehouses`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch warehouse data.");
                }

                const result = await response.json();
                setWarehouses(result.data || []);
            } catch (error) {
                console.error("Error fetching warehouse data:", error);
                setError("Could not load warehouse data.");
            } finally {
                setLoading(false);
            }
        };

        fetchWarehouses();
    }, []);

    // Handle form input changes
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle CX Code selection
    const handleCXCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCXCode = parseInt(e.target.value);
        setFormData((prev) => ({
            ...prev,
            CXCode: selectedCXCode,
        }));
    };

    // Handle warehouse selection
    const handleWarehouseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedWarehouseCode = parseInt(e.target.value);
        const selectedWarehouse = warehouses.find(
            (warehouse) => warehouse.Code === selectedWarehouseCode
        );

        if (selectedWarehouse) {
            setFormData((prev) => ({
                ...prev,
                WarehouseCode: selectedWarehouse.Code,
                WarehouseAddress: selectedWarehouse.Address,
            }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            TransaksiLastMileId: parseInt(lmCode, 10),
            CXCode: formData.CXCode,
            LastMileTracking: formData.LastMileTracking,
            FreightCode: formData.FreightCode,
            WarehouseCode: formData.WarehouseCode,
            WarehouseAddress: formData.WarehouseAddress,
            Courier: formData.Courier,
            ShippingCost: formData.ShippingCost,
            AdditionalCost: formData.AdditionalCost,
        };

        console.log("Payload to send:", payload);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/last-mile-details`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to create Last Mile Detail."
                );
            }

            router.push(`/transaction/last-mile`);
        } catch (error: any) {
            console.error("Error submitting Last Mile Detail:", error);
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-header bg-dark text-white">
                    <h4 className="mb-0">Add Last Mile Detail</h4>
                </div>
                <div className="card-body">
                    {error && <div className="alert alert-danger">{error}</div>}

                    {loading ? (
                        <p className="text-center">Loading data...</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="row g-3">
                            {/* CX Code Selection */}
                            <div className="col-md-6">
                                <label
                                    htmlFor="CXCode"
                                    className="form-label fw-bold"
                                >
                                    CX Code
                                </label>
                                <select
                                    id="CXCode"
                                    name="CXCode"
                                    className="form-select"
                                    value={formData.CXCode}
                                    onChange={handleCXCodeChange}
                                    required
                                >
                                    <option value="">Select CX Code</option>
                                    {cxInvoices.map((invoice) => (
                                        <option
                                            key={invoice.Code}
                                            value={invoice.Code}
                                        >
                                            {invoice.Code}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Last Mile Tracking */}
                            <div className="col-md-6">
                                <label
                                    htmlFor="LastMileTracking"
                                    className="form-label fw-bold"
                                >
                                    Last Mile Tracking
                                </label>
                                <input
                                    type="text"
                                    id="LastMileTracking"
                                    name="LastMileTracking"
                                    className="form-control"
                                    value={formData.LastMileTracking}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Freight Code */}
                            <div className="col-md-6">
                                <label
                                    htmlFor="FreightCode"
                                    className="form-label fw-bold"
                                >
                                    Freight Code
                                </label>
                                <input
                                    type="text"
                                    id="FreightCode"
                                    name="FreightCode"
                                    className="form-control"
                                    value={formData.FreightCode}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Warehouse Selection */}
                            <div className="col-md-6">
                                <label
                                    htmlFor="Warehouse"
                                    className="form-label fw-bold"
                                >
                                    Warehouse
                                </label>
                                <select
                                    id="Warehouse"
                                    className="form-select"
                                    onChange={handleWarehouseChange}
                                    required
                                >
                                    <option value="">Select Warehouse</option>
                                    {warehouses.map((warehouse) => (
                                        <option
                                            key={warehouse.Code}
                                            value={warehouse.Code}
                                        >
                                            {warehouse.Name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Display Warehouse Address */}
                            <div className="col-md-6">
                                <label
                                    htmlFor="WarehouseAddress"
                                    className="form-label fw-bold"
                                >
                                    Warehouse Address
                                </label>
                                <input
                                    type="text"
                                    id="WarehouseAddress"
                                    name="WarehouseAddress"
                                    className="form-control"
                                    value={formData.WarehouseAddress}
                                    readOnly
                                />
                            </div>

                            {/* Courier */}
                            <div className="col-md-6">
                                <label
                                    htmlFor="Courier"
                                    className="form-label fw-bold"
                                >
                                    Courier
                                </label>
                                <input
                                    type="text"
                                    id="Courier"
                                    name="Courier"
                                    className="form-control"
                                    value={formData.Courier}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Shipping Cost */}
                            <div className="col-md-6">
                                <label
                                    htmlFor="ShippingCost"
                                    className="form-label fw-bold"
                                >
                                    Shipping Cost
                                </label>
                                <input
                                    type="number"
                                    id="ShippingCost"
                                    name="ShippingCost"
                                    className="form-control"
                                    value={formData.ShippingCost}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Additional Cost */}
                            <div className="col-md-6">
                                <label
                                    htmlFor="AdditionalCost"
                                    className="form-label fw-bold"
                                >
                                    Additional Cost
                                </label>
                                <input
                                    type="number"
                                    id="AdditionalCost"
                                    name="AdditionalCost"
                                    className="form-control"
                                    value={formData.AdditionalCost}
                                    onChange={handleInputChange}
                                    required
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