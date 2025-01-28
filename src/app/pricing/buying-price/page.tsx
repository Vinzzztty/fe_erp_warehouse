"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Define a TypeScript type for the form data
type FormData = {
    Date: Date | null; // Date or null for the date picker
    WarehouseId: string;
    Note: string;
};

export default function AddBuyingPricePage() {
    const router = useRouter();

    // Form data and state
    const [formData, setFormData] = useState<FormData>({
        Date: null,
        WarehouseId: "",
        Note: "",
    });
    const [warehouses, setWarehouses] = useState<
        { Code: number; Name: string }[]
    >([]); // List of warehouses
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Fetch warehouses for the dropdown
    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/warehouses`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch warehouses.");
                }
                const data = await response.json();
                setWarehouses(data.data);
            } catch (error: any) {
                setErrorMessage(
                    error.message || "An unexpected error occurred."
                );
            }
        };

        fetchWarehouses();
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
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/product_pricing/buying-prices`,
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
                    errorData.message || "Failed to add buying price."
                );
            }

            // Navigate back to Buying Price page on success
            router.push("/pricing");
        } catch (error: any) {
            setErrorMessage(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Add Buying Price</h1>
            <p>Record a new buying price entry in the system.</p>

            {/* Error Message */}
            {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
            )}

            {/* Buying Price Form */}
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

                {/* Warehouse Dropdown */}
                <div className="mb-3">
                    <label htmlFor="WarehouseId" className="form-label">
                        Warehouse
                    </label>
                    <select
                        id="WarehouseId"
                        name="WarehouseId"
                        className="form-select"
                        value={formData.WarehouseId}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>
                            Select a warehouse
                        </option>
                        {warehouses.map((warehouse) => (
                            <option key={warehouse.Code} value={warehouse.Code}>
                                {warehouse.Name}
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
                    {loading ? "Submitting..." : "Add Buying Price"}
                </button>
            </form>
        </div>
    );
}
