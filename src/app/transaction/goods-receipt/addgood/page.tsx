"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        Date: "",
        ForwarderId: "",
        LMCode: "",
        WarehouseId: "",
        Notes: "",
    });

    const [lastMileCodes, setLastMileCodes] = useState<
        { Code: number; Note: string }[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingLastMileCodes, setLoadingLastMileCodes] = useState(false);

    useEffect(() => {
        const fetchLastMileCodes = async () => {
            setLoadingLastMileCodes(true);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/last-mile`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch last-mile codes.");
                }
                const data = await response.json();
                setLastMileCodes([data.data] || []);
            } catch (error) {
                console.error("Error fetching last-mile codes:", error);
                setError("Could not load last-mile codes.");
            } finally {
                setLoadingLastMileCodes(false);
            }
        };

        fetchLastMileCodes();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === "ForwarderId" || name === "LMCode" || name === "WarehouseId"
                ? parseInt(value) || ""
                : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.ForwarderId || isNaN(Number(formData.ForwarderId))) {
            setError("ForwarderId must be a valid number.");
            setLoading(false);
            return;
        }

        if (!formData.LMCode || isNaN(Number(formData.LMCode))) {
            setError("LMCode must be a valid number.");
            setLoading(false);
            return;
        }

        try {
            console.log("Submitting data:", formData);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-quotations`,
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
                    errorData.message || "Failed to create CX-Quotation."
                );
            }

            router.push("/transaction/cx-quotation");
        } catch (error: any) {
            console.error("Error Submitting CX-Quotation:", error);
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Add CX-Quotation</h1>
            <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-3">
                    <label htmlFor="Date" className="form-label">Date</label>
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
                    <label htmlFor="ForwarderId" className="form-label">Forwarder Id</label>
                    <input
                        type="number"
                        id="ForwarderId"
                        name="ForwarderId"
                        className="form-control"
                        value={formData.ForwarderId}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="LMCode" className="form-label">Last Mile Code</label>
                    <select
                        id="LMCode"
                        name="LMCode"
                        className="form-select"
                        value={formData.LMCode}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a Last Mile Code</option>
                        {loadingLastMileCodes ? (
                            <option disabled>Loading Last Mile Codes...</option>
                        ) : lastMileCodes.length > 0 ? (
                            lastMileCodes.map((lm) => (
                                <option key={lm.Code} value={lm.Code}>
                                    {lm.Code} - {lm.Note}
                                </option>
                            ))
                        ) : (
                            <option disabled>No Last Mile Codes Available</option>
                        )}
                    </select>
                </div>

                <div className="mb-3">
                    <label htmlFor="WarehouseId" className="form-label">Warehouse Id</label>
                    <input
                        type="number"
                        id="WarehouseId"
                        name="WarehouseId"
                        className="form-control"
                        value={formData.WarehouseId}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="Notes" className="form-label">Notes</label>
                    <textarea
                        id="Notes"
                        name="Notes"
                        className="form-control"
                        value={formData.Notes}
                        onChange={handleChange}
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Add CX-Quotation"}
                </button>
            </form>

            {error && <div className="alert alert-danger mt-4">{error}</div>}
        </div>
    );
}
