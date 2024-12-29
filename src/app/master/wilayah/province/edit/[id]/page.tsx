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

export default function EditProvincePage() {
    const { id } = useParams();
    const router = useRouter();

    const [formData, setFormData] = useState({
        Name: "",
        CountryId: "",
        Status: "Active",
    });
    const [countries, setCountries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProvinceData = async () => {
            try {
                // Fetch province data by ID
                const { data: province } = await fetchData(
                    `/master/provinces/${id}`
                );
                // Fetch all countries for the dropdown
                const { data: countries } = await fetchData(
                    `/master/countries`
                );

                setFormData({
                    Name: province.Name || "",
                    CountryId: province.CountryId || "",
                    Status: province.Status || "Active",
                });
                setCountries(countries);
            } catch (error: any) {
                setError(error.message || "Failed to load province data.");
            }
        };

        fetchProvinceData();
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
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/provinces/${id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );
            if (!response.ok) {
                throw new Error("Failed to update province.");
            }
            router.push("/master/wilayah");
        } catch (error: any) {
            setError(error.message || "Failed to update province.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Edit Province</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                {/* Province Name */}
                <div className="mb-3">
                    <label htmlFor="Name" className="form-label">
                        Province Name
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

                {/* Country Dropdown */}
                <div className="mb-3">
                    <label htmlFor="CountryId" className="form-label">
                        Country
                    </label>
                    <select
                        id="CountryId"
                        name="CountryId"
                        className="form-select"
                        value={formData.CountryId}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>
                            Select a country
                        </option>
                        {countries.map((country: any) => (
                            <option key={country.Code} value={country.Code}>
                                {country.Name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status Dropdown */}
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

                {/* Submit Button */}
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
