"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CityPage() {
    const router = useRouter();

    // Form data and state
    const [formData, setFormData] = useState({
        Name: "",
        ProvinceId: "",
        CountryId: "",
        Status: "Active",
    });
    const [provinces, setProvinces] = useState([]); // List of provinces
    const [countries, setCountries] = useState([]); // List of countries
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Fetch countries and provinces for the dropdowns
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/provinces`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch provinces.");
                }
                const data = await response.json();
                setProvinces(
                    data.data.filter(
                        (province: any) => province.Status === "Active"
                    )
                );
            } catch (error: any) {
                setErrorMessage(
                    error.message || "An unexpected error occurred."
                );
            }
        };

        const fetchCountries = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/countries`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch countries.");
                }
                const data = await response.json();
                setCountries(
                    data.data.filter(
                        (Country: any) => Country.Status === "Active"
                    )
                );
            } catch (error: any) {
                setErrorMessage(
                    error.message || "An unexpected error occurred."
                );
            }
        };

        fetchProvinces();
        fetchCountries();
    }, []);

    // Handle input changes
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/cities`,
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
                throw new Error(errorData.message || "Failed to add city.");
            }

            // Navigate back to Wilayah page on success
            router.push("/master/wilayah");
        } catch (error: any) {
            setErrorMessage(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            {/* Back Button */}
            <button
                className="btn btn-outline-dark mb-3"
                onClick={() => router.push("/master/wilayah")}
            >
                <i className="bi bi-arrow-left"></i> Back
            </button>
            <h1>Manage Cities</h1>
            <p>Add new cities to your system.</p>

            {/* Error Message */}
            {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
            )}

            {/* City Form */}
            <form onSubmit={handleSubmit} className="mt-4">
                {/* Name Field */}
                <div className="mb-3">
                    <label htmlFor="Name" className="form-label">
                        City Name <span style={{ color: "red" }}>*</span>
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

                {/* Province Dropdown */}
                <div className="mb-3">
                    <label htmlFor="ProvinceId" className="form-label">
                        Province <span style={{ color: "red" }}>*</span>
                    </label>
                    <select
                        id="ProvinceId"
                        name="ProvinceId"
                        className="form-select"
                        value={formData.ProvinceId}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>
                            Select a province
                        </option>
                        {provinces.map((province: any) => (
                            <option key={province.Code} value={province.Code}>
                                {province.Name}
                            </option>
                        ))}
                    </select>
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
                    {loading ? "Submitting..." : "Add City"}
                </button>
            </form>
        </div>
    );
}
