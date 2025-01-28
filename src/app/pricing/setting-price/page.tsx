"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Define a TypeScript type for the form data
type FormData = {
    Date: Date | null; // Date or null for the date picker
    BPCode: string; // BPCode selected from approved buying prices
    Note: string; // Optional note field
};

type BuyingPrice = {
    Code: number;
    Date: string; // ISO Date string
    Note: string;
};

export default function SettingPricingPage() {
    const router = useRouter();

    // Form data and state
    const [formData, setFormData] = useState<FormData>({
        Date: null,
        BPCode: "",
        Note: "",
    });
    const [buyingPrices, setBuyingPrices] = useState<BuyingPrice[]>([]); // List of approved buying prices
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Fetch approved buying prices for the dropdown
    useEffect(() => {
        const fetchBuyingPrices = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/product_pricing/buying-prices`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch buying prices.");
                }
                const data = await response.json();
                setBuyingPrices(data.data);
            } catch (error: any) {
                setErrorMessage(
                    error.message || "An unexpected error occurred."
                );
            }
        };

        fetchBuyingPrices();
    }, []);

    // Handle input changes for other fields
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle date change
    const handleDateChange = (date: Date | null) => {
        setFormData((prev) => ({
            ...prev,
            Date: date,
        }));
    };

    // Set today's date
    const setTodayDate = () => {
        handleDateChange(new Date());
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/product_pricing/setting-prices`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...formData,
                        Date: formData.Date
                            ? formData.Date.toISOString().split("T")[0]
                            : null, // Format date as YYYY-MM-DD
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to add setting price."
                );
            }

            // Navigate back to the Setting Pricing page on success
            router.push("/pricing");
        } catch (error: any) {
            setErrorMessage(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Setting Pricing</h1>
            <p>Record a new setting price entry in the system.</p>

            {/* Error Message */}
            {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
            )}

            {/* Setting Price Form */}
            <form onSubmit={handleSubmit} className="mt-4">
                {/* Date Field */}
                <div className="mb-3">
                    <label htmlFor="Date" className="form-label">
                        Date
                    </label>
                    <div className="d-flex align-items-center">
                        <DatePicker
                            selected={formData.Date}
                            onChange={handleDateChange}
                            dateFormat="yyyy-MM-dd"
                            className="form-control"
                            placeholderText="Select a date"
                            id="Date"
                            name="Date"
                            required
                        />
                        <button
                            type="button"
                            className="btn btn-secondary ms-2"
                            onClick={setTodayDate}
                        >
                            Today
                        </button>
                    </div>
                </div>

                {/* Buying Price Dropdown */}
                <div className="mb-3">
                    <label htmlFor="BPCode" className="form-label">
                        Approved Buying Price
                    </label>
                    <select
                        id="BPCode"
                        name="BPCode"
                        className="form-select"
                        value={formData.BPCode}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>
                            Select an approved buying price
                        </option>
                        {buyingPrices.map((bp) => (
                            <option key={bp.Code} value={bp.Code}>
                                {`Code: ${bp.Code} | Date: ${bp.Date} | Note: ${bp.Note}`}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Note Field */}
                <div className="mb-3">
                    <label htmlFor="Note" className="form-label">
                        Note
                    </label>
                    <textarea
                        id="Note"
                        name="Note"
                        className="form-control"
                        value={formData.Note}
                        onChange={handleChange}
                        rows={4}
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Add Setting Price"}
                </button>
            </form>
        </div>
    );
}
