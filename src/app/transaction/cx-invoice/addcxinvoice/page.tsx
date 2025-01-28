"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CompanyPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        Date: "",
        ForwarderId: "",
        Notes: "",
        Status: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [forwarders, setForwarders] = useState<{ Code: number; Name: string }[]>(
        []
    );

    useEffect(() => {
        // Fetch forwarder data from API
        const fetchForwarders = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/forwarders`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch forwarder data.");
                }
                const data = await response.json();
                setForwarders(data.data || []);
            } catch (error) {
                console.error("Error fetching forwarders:", error);
                setError("Could not load forwarder data.");
            }
        };

        fetchForwarders();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === "ForwarderId" ? parseInt(value) || "" : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.ForwarderId || isNaN(Number(formData.ForwarderId))) {
            setError("Forwarder must be selected.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/cx-invoices`,
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
                throw new Error(
                    errorData.message || "Failed to create CX-Invoice."
                );
            }

            router.push("/transaction/cx-invoice");
        } catch (error: any) {
            console.error("Error submitting CX-Invoice:", error);
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Add CX-Invoice</h1>
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
                    <label htmlFor="ForwarderId" className="form-label">Forwarder</label>
                    <select
                        id="ForwarderId"
                        name="ForwarderId"
                        className="form-select"
                        value={formData.ForwarderId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a Forwarder</option>
                        {forwarders.map((forwarder) => (
                            <option key={forwarder.Code} value={forwarder.Code}>
                                {forwarder.Name}
                            </option>
                        ))}
                    </select>
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
                    {loading ? "Submitting..." : "Add CX-Invoice"}
                </button>
            </form>

            {error && <div className="alert alert-danger mt-4">{error}</div>}
        </div>
    );
}
