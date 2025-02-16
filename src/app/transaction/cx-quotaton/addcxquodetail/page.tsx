"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

// Define interfaces based on the API response for PICode and the Product
interface PICode {
    Code: number;
    Name: string;
}

interface ProformaInvoiceDetail {
    SKUCode: string;
    ProductName: string;
    QTYOrdered: string;
    CartonP: string;
    CartonL: string;
    CartonT: string;
    CartonQty: string;
}

interface FormData {
    CxQuotationId: number;
    PICode: number;
    ProductName: string;
    QTY: number;
    CartonP: number;
    CartonL: number;
    CartonT: number;
    CartonQty: number;
    CrossBorderFee: number;
    ImportDuties: number;
    DiscountAndFees: number;
    CXCost: number;
}

export default function AddDetailCxQuotationPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        CxQuotationId: 0,
        PICode: 0,
        ProductName: "",
        QTY: 0,
        CartonP: 0,
        CartonL: 0,
        CartonT: 0,
        CartonQty: 0,
        CrossBorderFee: 0,
        ImportDuties: 0,
        DiscountAndFees: 0,
        CXCost: 0,
    });
    const [piCodes, setPiCodes] = useState<PICode[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [grId, setGrId] = useState<string | null>(searchParams.get("id"));

    // Fetch PICodes on page load
    useEffect(() => {
        const fetchPiCodes = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoices`);
                const data = await response.json();
                setPiCodes(data.data || []);
            } catch (error) {
                setError("Failed to fetch PI Codes.");
            } finally {
                setLoading(false);
            }
        };

        fetchPiCodes();

        // Set CxQuotationId from URL parameter if present
        if (grId) {
            setFormData((prevData) => ({
                ...prevData,
                CxQuotationId: Number(grId),
            }));
        }
    }, [grId]);

    // Fetch ordered quantity and other details when PICode is selected
    const handlePiCodeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedPICode = Number(e.target.value);
        setFormData((prevData) => ({ ...prevData, PICode: selectedPICode }));

        if (selectedPICode) {
            try {
                const piDetailResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/proforma-invoice-details/by-proforma-invoice/${selectedPICode}`
                );
                const piDetailData = await piDetailResponse.json();

                // Assuming the response contains an array of details
                if (piDetailData.data && piDetailData.data.length > 0) {
                    const firstDetail: ProformaInvoiceDetail = piDetailData.data[0]; // Get the first detail
                    setFormData((prevData) => ({
                        ...prevData,
                        ProductName: firstDetail.ProductName,
                        QTY: Number(firstDetail.QTYOrdered),
                        CartonP: Number(firstDetail.CartonP),
                        CartonL: Number(firstDetail.CartonL),
                        CartonT: Number(firstDetail.CartonT),
                        CartonQty: Number(firstDetail.CartonQty),
                    }));
                }
            } catch (error) {
                setError("Failed to fetch Proforma Invoice details.");
            }
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            CxQuotationId: formData.CxQuotationId,
            PICode: formData.PICode,
            ProductName: formData.ProductName,
            QTY: formData.QTY,
            CartonP: formData.CartonP,
            CartonL: formData.CartonL,
            CartonT: formData.CartonT,
            CartonQty: formData.CartonQty,
            CrossBorderFee: formData.CrossBorderFee,
            ImportDuties: formData.ImportDuties,
            DiscountAndFees: formData.DiscountAndFees,
            CXCost: formData.CXCost,
        };

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-quotation-details`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to create CX Quotation Detail.");
            }

            router.push("/transaction/cx-quotaton"); // Redirect after successful submission
        } catch (error: any) {
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Add Detail CX Quotation</h1>
            {error && <div className="alert alert-danger mt-4">{error}</div>}

            {loading ? (
                <p>Loading...</p>
            ) : (
                <form onSubmit={handleSubmit} className="mt-4">
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

                    {/* Quantity */}
                    <div className="mb-3">
                        <label htmlFor="QTY" className="form-label">
                            Quantity
                        </label>
                        <input
                            type="number"
                            id="QTY"
                            className="form-control"
                            value={formData.QTY}
                            onChange={(e) => setFormData({ ...formData, QTY: Number(e.target.value) })}
                        />
                    </div>

                    {/* Carton Dimensions */}
                    <div className="mb-3">
                        <label htmlFor="CartonP" className="form-label">
                            Carton P
                        </label>
                        <input
                            type="number"
                            id="CartonP"
                            className="form-control"
                            value={formData.CartonP}
                            onChange={(e) => setFormData({ ...formData, CartonP: Number(e.target.value) })}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="CartonL" className="form-label">
                            Carton L
                        </label>
                        <input
                            type="number"
                            id="CartonL"
                            className="form-control"
                            value={formData.CartonL}
                            onChange={(e) => setFormData({ ...formData, CartonL: Number(e.target.value) })}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="CartonT" className="form-label">
                            Carton T
                        </label>
                        <input
                            type="number"
                            id="CartonT"
                            className="form-control"
                            value={formData.CartonT}
                            onChange={(e) => setFormData({ ...formData, CartonT: Number(e.target.value) })}
                        />
                    </div>

                    {/* Carton Quantity */}
                    <div className="mb-3">
                        <label htmlFor="CartonQty" className="form-label">
                            Carton Quantity
                        </label>
                        <input
                            type="number"
                            id="CartonQty"
                            className="form-control"
                            value={formData.CartonQty}
                            onChange={(e) => setFormData({ ...formData, CartonQty: Number(e.target.value) })}
                        />
                    </div>

                    {/* Fees */}
                    <div className="mb-3">
                        <label htmlFor="CrossBorderFee" className="form-label">
                            Cross Border Fee
                        </label>
                        <input
                            type="number"
                            id="CrossBorderFee"
                            className="form-control"
                            value={formData.CrossBorderFee}
                            onChange={(e) => setFormData({ ...formData, CrossBorderFee: Number(e.target.value) })}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="ImportDuties" className="form-label">
                            Import Duties
                        </label>
                        <input
                            type="number"
                            id="ImportDuties"
                            className="form-control"
                            value={formData.ImportDuties}
                            onChange={(e) => setFormData({ ...formData, ImportDuties: Number(e.target.value) })}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="DiscountAndFees" className="form-label">
                            Discount and Fees
                        </label>
                        <input
                            type="number"
                            id="DiscountAndFees"
                            className="form-control"
                            value={formData.DiscountAndFees}
                            onChange={(e) => setFormData({ ...formData, DiscountAndFees: Number(e.target.value) })}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="CXCost" className="form-label">
                            CX Cost
                        </label>
                        <input
                            type="number"
                            id="CXCost"
                            className="form-control"
                            value={formData.CXCost}
                            onChange={(e) => setFormData({ ...formData, CXCost: Number(e.target.value) })}
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