"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AddPiPaymentDetailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Get PiPaymentId from search params
    const piPaymentId = searchParams.get("id") || ""; // Default to empty string if not found

    const [formData, setFormData] = useState({
        PiPaymentId: piPaymentId, // Set from search params
        PICode: "", // Will be set from dropdown
        Rate: 2200.00,
        ProductPriceRupiah: 1000000.00,
        FirstMileCostRupiah: 50000.00,
        PaymentRupiah: 600000.00,
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [proformaInvoices, setProformaInvoices] = useState<any[]>([]); // Store fetched proforma invoices

    useEffect(() => {
        const fetchProformaInvoices = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoices`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch proforma invoices.");
                }
                const data = await response.json();
                if (data.status.code !== 200) {
                    throw new Error(data.status.message || "Failed to fetch proforma invoices.");
                }
                setProformaInvoices(data.data); // Set the fetched data
            } catch (error: any) {
                setError(error.message || "An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchProformaInvoices();
    }, []);

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);


        console.log("form data to be send",formData);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/pi-payment-details`,
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
                throw new Error(errorData.message || "Failed to add payment detail.");
                
            }

            alert("Payment detail added successfully.");
            router.push("/transaction/pi-payment"); // Redirect after successful submission
        } catch (error: any) {
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Add PI Payment Detail</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="row g-3">
                {/* PiPaymentId */}
                <div className="col-md-6">
                    <label htmlFor="PiPaymentId" className="form-label fw-bold">PI Payment ID</label>
                    <input
                        type="text"
                        id="PiPaymentId"
                        name="PiPaymentId"
                        className="form-control"
                        value={formData.PiPaymentId}
                        readOnly // Make it read-only since it's set from search params
                    />
                </div>

                {/* PICode Dropdown */}
                <div className="col-md-6">
                    <label htmlFor="PICode" className="form-label fw-bold">PI Code</label>
                    <select
                        id="PICode"
                        name="PICode"
                        className="form-select"
                        value={formData.PICode}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select PI Code</option>
                        {proformaInvoices.map((invoice) => (
                            <option key={invoice.Code} value={invoice.Code}>
                                {invoice.Code} - {invoice.Notes} {/* Display Code and Notes */}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Rate */}
                <div className="col-md-6">
                    <label htmlFor="Rate" className="form-label fw-bold">Rate</label>
                    <input
                        type="number"
                        id="Rate"
                        name="Rate"
                        className="form-control"
                        value={formData.Rate}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                {/* Product Price in Rupiah */}
                <div className="col-md-6">
                    <label htmlFor="ProductPriceRupiah" className="form-label fw-bold">Product Price (Rupiah)</label>
                    <input
                        type="number"
                        id="ProductPriceRupiah"
                        name="ProductPriceRupiah"
                        className="form-control"
                        value={formData.ProductPriceRupiah}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                {/* First Mile Cost in Rupiah */}
                <div className="col-md-6">
                    <label htmlFor="FirstMileCostRupiah" className="form-label fw-bold">First Mile Cost (Rupiah)</label>
                    <input
                        type="number"
                        id="FirstMileCostRupiah"
                        name="FirstMileCostRupiah"
                        className="form-control"
                        value={formData.FirstMileCostRupiah}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                {/* Payment in Rupiah */}
                <div className="col-md-6">
                    <label htmlFor="PaymentRupiah" className="form-label fw-bold">Payment (Rupiah)</label>
                    <input
                        type="number"
                        id="PaymentRupiah"
                        name="PaymentRupiah"
                        className="form-control"
                        value={formData.PaymentRupiah}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                {/* Submit Button */}
                <div className="col-12 text-center">
                    <button type="submit" className="btn btn-primary px-4 py-2" disabled={loading}>
                        {loading ? "Adding..." : "Add Payment Detail"}
                    </button>
                </div>
            </form>
        </div>
    );
}