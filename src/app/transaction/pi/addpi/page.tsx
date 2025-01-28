"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CompanyPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        Date: "",
        PONumber: "",
        SupplierId: "",
        Notes: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suppliers, setSuppliers] = useState<{ Code: number; Name: string }[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<{ Code: number }[]>([]); // For PO Numbers
    const [loadingSuppliers, setLoadingSuppliers] = useState(false);
    const [loadingPurchaseOrders, setLoadingPurchaseOrders] = useState(false);

    // Fetch suppliers on component mount
    useEffect(() => {
        const fetchSuppliers = async () => {
            setLoadingSuppliers(true);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/suppliers`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch suppliers.");
                }
                const data = await response.json();
                if (data.status.code !== 200) {
                    throw new Error(data.status.message || "Failed to fetch suppliers.");
                }
                setSuppliers(data.data);
            } catch (error: any) {
                console.error("Error fetching suppliers:", error);
                setError(error.message || "Failed to fetch suppliers.");
            } finally {
                setLoadingSuppliers(false);
            }
        };

        fetchSuppliers();
    }, []);

    // Fetch Purchase Orders on component mount
    useEffect(() => {
        const fetchPurchaseOrders = async () => {
            setLoadingPurchaseOrders(true);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/purchase-orders`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch purchase orders.");
                }
                const data = await response.json();
                if (data.status.code !== 200) {
                    throw new Error(data.status.message || "Failed to fetch purchase orders.");
                }
                setPurchaseOrders(data.data);
            } catch (error: any) {
                console.error("Error fetching purchase orders:", error);
                setError(error.message || "Failed to fetch purchase orders.");
            } finally {
                setLoadingPurchaseOrders(false);
            }
        };

        fetchPurchaseOrders();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === "SupplierId" ? parseInt(value) || "" : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.SupplierId || isNaN(Number(formData.SupplierId))) {
            setError("SupplierId must be a valid number.");
            setLoading(false);
            return;
        }

        try {
            console.log("Submitting data:", formData);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoices`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error Response:", errorData);
                throw new Error(
                    errorData.message || "Failed to create proforma invoice."
                );
            }

            router.push("/transaction/pi");
        } catch (error: any) {
            console.error("Error Submitting PI:", error);
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Add Proforma Invoice</h1>
            <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-3">
                    <label htmlFor="Date" className="form-label">
                        Date
                    </label>
                    <input
                        type="date"
                        id="Date"
                        name="Date"
                        className="form-control"
                        value={formData.Date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="Notes" className="form-label">
                        Notes
                    </label>
                    <textarea
                        id="Notes"
                        name="Notes"
                        className="form-control"
                        value={formData.Notes}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="SupplierId" className="form-label">
                        Supplier
                    </label>
                    <select
                        id="SupplierId"
                        name="SupplierId"
                        className="form-select"
                        value={formData.SupplierId}
                        onChange={handleChange}
                        required
                        disabled={loadingSuppliers}
                    >
                        <option value="">-- Select Supplier --</option>
                        {suppliers.map((supplier) => (
                            <option key={supplier.Code} value={supplier.Code}>
                                {supplier.Name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label htmlFor="PONumber" className="form-label">
                        PO Number
                    </label>
                    <select
                        id="PONumber"
                        name="PONumber"
                        className="form-select"
                        value={formData.PONumber}
                        onChange={handleChange}
                        required
                        disabled={loadingPurchaseOrders}
                    >
                        <option value="">-- Select PO Number --</option>
                        {purchaseOrders.map((po) => (
                            <option key={po.Code} value={po.Code}>
                                {po.Code}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || loadingSuppliers || loadingPurchaseOrders}
                >
                    {loading ? "Submitting..." : "Add PI"}
                </button>
            </form>

            {error && <div className="alert alert-danger mt-4">{error}</div>}
        </div>
    );
}
