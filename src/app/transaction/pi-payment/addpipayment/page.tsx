"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompanyPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        Date: "",
        SupplierId: "",
        Notes: "",
        Status:"Active",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
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
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/pi-payments`,
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

            router.push("/transaction/pi-payment");
        } catch (error: any) {
            console.error("Error Submitting PI:", error);
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Add Proforma Invoice Payment</h1>
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
                    <label htmlFor="Notes" className="form-label">Notes</label>
                    <textarea
                        id="Notes"
                        name="Notes"
                        className="form-control"
                        value={formData.Notes}
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="SupplierId" className="form-label">Supplier Id</label>
                    <input
                        type="number"
                        id="SupplierId"
                        name="SupplierId"
                        className="form-control"
                        value={formData.SupplierId}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="Status" className="form-label">Status</label>
                    <select
                        id="Status"
                        name="Status"
                        className="form-select"
                        value={formData.Status}
                        onChange={handleChange}
                        required
                    >
                        <option value="Unpaid">Unpaid</option>
                        <option value="Paid">Paid</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Arrived">Arrived</option>
                        <option value="Inbound">Inbound</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Add PI-Payment"}
                </button>
            </form>

            {error && <div className="alert alert-danger mt-4">{error}</div>}
        </div>
    );
}
