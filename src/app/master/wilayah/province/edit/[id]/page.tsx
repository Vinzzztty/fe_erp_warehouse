"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";

// Type Definitions
interface Country {
    Code: string;
    Name: string;
}

interface Province {
    Name: string;
    CountryId: string;
    Status: string;
}

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

    // State Management
    const [formData, setFormData] = useState<Province>({
        Name: "",
        CountryId: "",
        Status: "Active",
    });
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProvinceAndCountries = async () => {
            try {
                // Fetch province and countries concurrently
                const [provinceResponse, countriesResponse] = await Promise.all(
                    [
                        fetchData(`/master/provinces/${id}`),
                        fetchData(`/master/countries`),
                    ]
                );

                // Update states
                setFormData({
                    Name: provinceResponse.data.Name || "",
                    CountryId: provinceResponse.data.CountryId || "",
                    Status: provinceResponse.data.Status || "Active",
                });
                setCountries(countriesResponse.data);
            } catch (error: any) {
                setError(error.message || "Failed to load province data.");
            } finally {
                setFetching(false);
            }
        };

        fetchProvinceAndCountries();
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
                const errorData = await response.json(); // Extract response JSON
                let apiMessage =
                    errorData?.status?.message || "Failed to Update province.";

                // ✅ Customize error message if "already exists"
                if (apiMessage.includes("already exists")) {
                    apiMessage = "The name is Duplicate";
                }

                throw new Error(apiMessage); // Throw error so it goes to catch block
            }

            router.push("/master/wilayah");
        } catch (error: any) {
            setError(error.message || "Failed to update province.");
        } finally {
            setLoading(false);
        }
    };

    // Memoized countries to prevent unnecessary re-renders
    const countryOptions = useMemo(() => {
        return countries.map((country) => (
            <option key={country.Code} value={country.Code}>
                {country.Name}
            </option>
        ));
    }, [countries]);

    return (
        <div className="container mt-4">
            {/* Back Button */}
            <button
                className="btn btn-outline-dark mb-3"
                onClick={() => router.push("/master/wilayah")}
            >
                <i className="bi bi-arrow-left"></i> Back
            </button>

            <h1>Edit Province</h1>

            {/* Show loading indicator while fetching data */}
            {fetching && <p className="text-center">Loading...</p>}

            {/* Error Message */}
            {error && <div className="alert alert-danger">{error}</div>}

            {!fetching && (
                <form onSubmit={handleSubmit}>
                    {/* Province Name */}
                    <div className="mb-3">
                        <label htmlFor="Name" className="form-label">
                            Province Name{" "}
                            <span style={{ color: "red" }}>*</span>
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
                            Country <span style={{ color: "red" }}>*</span>
                        </label>
                        <select
                            id="CountryId"
                            name="CountryId"
                            className="form-select"
                            value={formData.CountryId}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled style={{ color: "red" }}>
                                Select a country
                            </option>
                            {countryOptions}
                        </select>
                    </div>

                    {/* Status Dropdown */}
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
                            required
                        >
                            <option value="Active">Active</option>
                            <option value="Non-Active">Non-Active</option>
                        </select>
                    </div>

                    {/* Submit Button */}
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
