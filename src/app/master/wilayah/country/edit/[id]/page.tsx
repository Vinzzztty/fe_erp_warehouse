"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

async function fetchData(endpoint: string) {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`
    );
    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${endpoint}`);
    }
    return response.json();
}

export default function EditCountryPage() {
    const { id } = useParams();
    const router = useRouter();

    const [formData, setFormData] = useState({
        Name: "",
        Status: "Active",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCountryData = async () => {
            try {
                const { data } = await fetchData(`/master/countries/${id}`);
                setFormData({
                    Name: data.Name || "",
                    Status: data.Status || "Active",
                });
            } catch (error: any) {
                setError(error.message || "Failed to load country data.");
            }
        };

        fetchCountryData();
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/countries/${id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );
            if (!response.ok) {
                throw new Error("Failed to update country.");
            }
            router.push("/master/wilayah");
        } catch (error: any) {
            setError(error.message || "Failed to update country.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Edit Country</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="Name" className="form-label">
                        Country Name
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
                    <label htmlFor="Status" className="form-label">
                        Status
                    </label>
                    <select
                        id="Status"
                        name="Status"
                        className="form-select"
                        value={formData.Status}
                        onChange={handleChange}
                        required
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
        </div>
    );
}
