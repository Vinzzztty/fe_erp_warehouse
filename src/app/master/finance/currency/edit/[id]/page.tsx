"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditCurrencyPage() {
    const { id } = useParams(); // Get currency ID from the route
    const router = useRouter();
    const [formData, setFormData] = useState({
        Name: "",
        Notes: "",
        Status: "Active",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCurrency = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/currencies/${id}`
                );
                if (!response.ok)
                    throw new Error("Failed to fetch currency details.");
                const { data } = await response.json();
                setFormData({
                    Name: data.Name || "",
                    Notes: data.Notes || "",
                    Status: data.Status || "Active",
                });
            } catch (error: any) {
                setError(error.message || "An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchCurrency();
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/currencies/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );
            if (!response.ok) throw new Error("Failed to update currency.");
            router.push("/master/finance/currency"); // Redirect after success
        } catch (error: any) {
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Edit Currency</h1>
            {loading && <p>Loading...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && (
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="Name" className="form-label">
                            Currency Name
                        </label>
                        <input
                            type="text"
                            id="Name"
                            name="Name"
                            className="form-control"
                            value={formData.Name}
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
                            value={formData.Notes || ""}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="Status" className="form-label">
                            Status
                        </label>
                        <select
                            id="Status"
                            name="Status"
                            className="form-select"
                            value={formData.Status}
                            onChange={handleChange}
                        >
                            <option value="Active">Active</option>
                            <option value="Non-Active">Non-Active</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            )}
        </div>
    );
}
