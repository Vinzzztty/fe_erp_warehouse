"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface CxQuotationDetail {
    Id: number;
    CXCost: string; // Assuming this is a string that can be converted to a number
}

interface CxInvoiceDetail {
    TransaksiCxInvoiceId: number; // This will be set from the URL
    CXCode: number;
    AWB: number; // Change to number
    FreightCode: number; // Change to number
    Rate: number;
    CXCostRupiah: number;
    PaymentRupiah: number;
}

export default function AddCXInvoice() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [cxQuotationDetails, setCxQuotationDetails] = useState<CxQuotationDetail[]>([]);
    const [formData, setFormData] = useState<CxInvoiceDetail>({
        TransaksiCxInvoiceId: Number(searchParams.get("id")) , // Set from URL or default to 1
        CXCode: 0, // Default value
        AWB: 0, // Change to number
        FreightCode: 0, // Change to number
        Rate: 0,
        CXCostRupiah: 0,
        PaymentRupiah: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCxQuotationDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-quotation-details`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch CX Quotation details.");
                }
                const data = await response.json();
                if (data.status.code !== 200) {
                    throw new Error(data.status.message || "Failed to fetch CX Quotation details.");
                }
                setCxQuotationDetails(data.data);
            } catch (error: any) {
                setError(error.message || "An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchCxQuotationDetails();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "Rate" || name === "CXCostRupiah" || name === "PaymentRupiah" ? parseFloat(value) : parseInt(value, 10),
        }));

        // If CXCode is changed, update CXCostRupiah
        if (name === "CXCode") {
            const selectedDetail = cxQuotationDetails.find(detail => detail.Id === parseInt(value));
            if (selectedDetail) {
                setFormData(prev => ({
                    ...prev,
                    CXCostRupiah: parseFloat(selectedDetail.CXCost), // Assuming CXCost is a string
                }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        console.log("DATA KIRIM", formData);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-invoice-details`,
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
                throw new Error(errorData.message || "Failed to add CX Invoice.");
            }

            alert("CX Invoice added successfully.");
            router.push("/transaction/cx-invoice"); // Redirect to the CX Invoice list page
        } catch (error: any) {
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Add CX Invoice</h1>
            {error && <p className="text-danger">{error}</p>}
            <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-3">
                    <label htmlFor="CXCode" className="form-label">CX Code</label>
                    <select
                        id="CXCode"
                        name="CXCode"
                        className="form-select"
                        value={formData.CXCode}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select CX Code</option>
                        {cxQuotationDetails.map(detail => (
                            <option key={detail.Id} value={detail.Id}>
                                {detail.Id} {/* You can customize this to show more descriptive text */}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="AWB" className="form-label">AWB</label>
                    <input
                        type="number" // Change to number
                        id="AWB"
                        name="AWB"
                        className="form-control"
                        value={formData.AWB}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="FreightCode" className="form-label">Freight Code</label>
                    <input
                        type="number" // Change to number
                        id="FreightCode"
                        name="FreightCode"
                        className="form-control"
                        value={formData.FreightCode}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="Rate" className="form-label">Rate</label>
                    <input
                        type="number"
                        id="Rate"
                        name="Rate"
                        className="form-control"
                        value={formData.Rate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="CXCostRupiah" className="form-label">CX Cost (Rupiah)</label>
                    <input
                        type="number"
                        id="CXCostRupiah"
                        name="CXCostRupiah"
                        className="form-control"
                        value={formData.CXCostRupiah}
                        onChange={handleChange}
                        required
                        readOnly // Make it read-only since it will be auto-filled
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="PaymentRupiah" className="form-label">Payment (Rupiah)</label>
                    <input
                        type="number"
                        id="PaymentRupiah"
                        name="PaymentRupiah"
                        className="form-control"
                        value={formData.PaymentRupiah}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Adding..." : "Add CX Invoice"}
                </button>
            </form>
        </div>
    );
} 