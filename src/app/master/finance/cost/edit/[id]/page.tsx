"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditCostPage() {
    const { id } = useParams();
    const router = useRouter();
    const [formData, setFormData] = useState({
        Name: "",
        Percentage: 0,
        Status: "Active",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCost = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/costs/${id}`
                );
                if (!response.ok)
                    throw new Error("Failed to fetch Cost setting.");
                const { data } = await response.json();
                setFormData({
                    Name: data.Name || "",
                    Percentage: data.Percentage || 0,
                    Status: data.Status || "Active",
                });
            } catch (error: any) {
                setError(error.message || "An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchCost();
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "Percentage" ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/costs/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );
            if (!response.ok) throw new Error("Failed to update Cost setting.");
            router.push("/master/finance");
        } catch (error: any) {
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Edit Cost Setting</h1>
            {loading && <p>Loading...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && (
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="Name" className="form-label">
                            Name <span style={{ color: "red" }}>*</span>
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
                        <label htmlFor="Percentage" className="form-label">
                            Percentage (%){" "}
                            <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                            type="number"
                            id="Percentage"
                            name="Percentage"
                            className="form-control"
                            value={formData.Percentage}
                            onChange={handleChange}
                            required
                            step="0.01"
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="Status" className="form-label">
                            Status <span style={{ color: "red" }}>*</span>
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
