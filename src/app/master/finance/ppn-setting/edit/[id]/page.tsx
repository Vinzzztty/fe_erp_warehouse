"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditPpnSettingPage() {
    const { id } = useParams(); // Get the PPN Setting ID from the route
    const router = useRouter();
    const [formData, setFormData] = useState({
        Name: "",
        Rate: 0,
        Status: "Active",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPpnSetting = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/ppn-settings/${id}`
                );
                if (!response.ok)
                    throw new Error("Failed to fetch PPN setting.");
                const { data } = await response.json();
                setFormData({
                    Name: data.Name || "",
                    Rate: data.Rate || 0,
                    Status: data.Status || "Active",
                });
            } catch (error: any) {
                setError(error.message || "An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchPpnSetting();
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "Rate" ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/ppn-settings/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );
            if (!response.ok) throw new Error("Failed to update PPN setting.");
            router.push("/master/finance"); // Redirect after success
        } catch (error: any) {
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            {/* Back Button */}
            <button
                className="btn btn-outline-dark mb-3"
                onClick={() => router.push("/master/finance")}
            >
                <i className="bi bi-arrow-left"></i> Back
            </button>
            <h1>Edit PPN Setting</h1>
            {loading && <p>Loading...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && (
                <form onSubmit={handleSubmit}>
                    {/* Name Field */}
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

                    {/* Rate Field */}
                    <div className="mb-3">
                        <label htmlFor="Rate" className="form-label">
                            Rate (%) <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                            type="number"
                            id="Rate"
                            name="Rate"
                            className="form-control"
                            value={formData.Rate}
                            onChange={handleChange}
                            required
                            step="0.01"
                        />
                    </div>

                    {/* Status Field */}
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
                        className="btn btn-dark"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            )}
        </div>
    );
}
