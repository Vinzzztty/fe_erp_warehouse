"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Define the type for Country and Bank objects
interface Country {
    Code: number;
    Name: string;
}

interface Bank {
    Code: number;
    Name: string;
}

export default function AddForwarderPage() {
    const router = useRouter();
    const [countries, setCountries] = useState<Country[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [formData, setFormData] = useState<{
        Name: string;
        Notes: string;
        CountryId: string | number;
        AddressIndonesia: string;
        CoordinateIndonesia: string;
        Department: string;
        ContactMethod: string;
        Description: string;
        BankId: string | number;
        AccountNumber: string;
        Website: string;
        Wechat: string;
        ShippingMark: string;
        Status: string;
    }>({
        Name: "",
        Notes: "",
        CountryId: "",
        AddressIndonesia: "",
        CoordinateIndonesia: "",
        Department: "",
        ContactMethod: "Email",
        Description: "",
        BankId: "",
        AccountNumber: "",
        Website: "",
        Wechat: "",
        ShippingMark: "",
        Status: "Active",
    });
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Fetch Countries and Banks
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [countriesRes, banksRes] = await Promise.all([
                    fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/countries`
                    ),
                    fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/banks`
                    ),
                ]);

                if (!countriesRes.ok || !banksRes.ok) {
                    throw new Error("Failed to fetch metadata.");
                }

                const [countriesData, banksData] = await Promise.all([
                    countriesRes.json(),
                    banksRes.json(),
                ]);

                setCountries(countriesData?.data || []);
                setBanks(banksData?.data || []);
            } catch (error: any) {
                setErrorMessage(
                    error.message || "Failed to fetch required data."
                );
            }
        };

        fetchMetadata();
    }, []);

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
        setErrorMessage(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/forwarders`,
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
                    errorData.message || "Failed to add forwarder."
                );
            }

            // Navigate back to the main page on success
            router.push("/master/business");
        } catch (error: any) {
            setErrorMessage(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Add New Forwarder</h1>
            <p>
                Fill in the details below to add a new forwarder to the system.
            </p>

            {/* Error Message */}
            {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
            )}

            {/* Forwarder Form */}
            <form onSubmit={handleSubmit} className="mt-4">
                {/* Name Field */}
                <div className="mb-3">
                    <label htmlFor="Name" className="form-label">
                        Forwarder Name <span style={{ color: "red" }}>*</span>
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

                {/* Notes Field */}
                <div className="mb-3">
                    <label htmlFor="Notes" className="form-label">
                        Notes
                    </label>
                    <textarea
                        id="Notes"
                        name="Notes"
                        className="form-control"
                        value={formData.Notes}
                        onChange={handleChange}
                        rows={4}
                    />
                </div>

                {/* Country Field */}
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
                        <option value="">Select a Country</option>
                        {countries.map((country) => (
                            <option key={country.Code} value={country.Code}>
                                {country.Name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* AddressIndonesia Field */}
                <div className="mb-3">
                    <label htmlFor="AddressIndonesia" className="form-label">
                        Address in Indonesia
                    </label>
                    <input
                        type="text"
                        id="AddressIndonesia"
                        name="AddressIndonesia"
                        className="form-control"
                        value={formData.AddressIndonesia}
                        onChange={handleChange}
                    />
                </div>

                {/* CoordinateIndonesia Field */}
                <div className="mb-3">
                    <label htmlFor="CoordinateIndonesia" className="form-label">
                        Coordinate in Indonesia
                    </label>
                    <input
                        type="text"
                        id="CoordinateIndonesia"
                        name="CoordinateIndonesia"
                        className="form-control"
                        value={formData.CoordinateIndonesia}
                        onChange={handleChange}
                    />
                </div>

                {/* Department Field */}
                <div className="mb-3">
                    <label htmlFor="Department" className="form-label">
                        Department
                    </label>
                    <input
                        type="text"
                        id="Department"
                        name="Department"
                        className="form-control"
                        value={formData.Department}
                        onChange={handleChange}
                    />
                </div>

                {/* Contact Method Field */}
                <div className="mb-3">
                    <label htmlFor="ContactMethod" className="form-label">
                        Contact Method
                    </label>
                    <select
                        id="ContactMethod"
                        name="ContactMethod"
                        className="form-select"
                        value={formData.ContactMethod}
                        onChange={handleChange}
                    >
                        <option value="Email">Email</option>
                        <option value="Telephone">Telephone</option>
                        <option value="WA">WA</option>
                    </select>
                </div>

                {/* Bank Field */}
                <div className="mb-3">
                    <label htmlFor="BankId" className="form-label">
                        Bank
                    </label>
                    <select
                        id="BankId"
                        name="BankId"
                        className="form-select"
                        value={formData.BankId}
                        onChange={handleChange}
                    >
                        <option value="">Select a Bank</option>
                        {banks.map((bank) => (
                            <option key={bank.Code} value={bank.Code}>
                                {bank.Name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Account Number Field */}
                <div className="mb-3">
                    <label htmlFor="AccountNumber" className="form-label">
                        Account Number
                    </label>
                    <input
                        type="text"
                        id="AccountNumber"
                        name="AccountNumber"
                        className="form-control"
                        value={formData.AccountNumber}
                        onChange={handleChange}
                    />
                </div>

                {/* Website Field */}
                <div className="mb-3">
                    <label htmlFor="Website" className="form-label">
                        Website
                    </label>
                    <input
                        type="text"
                        id="Website"
                        name="Website"
                        className="form-control"
                        value={formData.Website}
                        onChange={handleChange}
                    />
                </div>

                {/* Wechat Field */}
                <div className="mb-3">
                    <label htmlFor="Wechat" className="form-label">
                        Wechat
                    </label>
                    <input
                        type="text"
                        id="Wechat"
                        name="Wechat"
                        className="form-control"
                        value={formData.Wechat}
                        onChange={handleChange}
                    />
                </div>

                {/* Shipping Mark Field */}
                <div className="mb-3">
                    <label htmlFor="ShippingMark" className="form-label">
                        Shipping Mark
                    </label>
                    <input
                        type="text"
                        id="ShippingMark"
                        name="ShippingMark"
                        className="form-control"
                        value={formData.ShippingMark}
                        onChange={handleChange}
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
                    {loading ? "Submitting..." : "Add Forwarder"}
                </button>
            </form>
        </div>
    );
}
