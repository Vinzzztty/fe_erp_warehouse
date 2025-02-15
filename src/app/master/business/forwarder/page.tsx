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

                setCountries(
                    countriesData?.data.filter(
                        (countriesData: any) =>
                            countriesData.Status === "Active"
                    ) || []
                );
                setBanks(
                    banksData?.data.filter(
                        (banksData: any) => banksData.Status == "Active"
                    ) || []
                );
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
            <div className="card shadow-sm">
                <div className="card-header bg-dark text-white text-center">
                    <h4 className="mb-0">Add New Forwarder</h4>
                    <p>
                        Fill in the details below to add a new forwarder to the
                        system.
                    </p>
                </div>
                <div className="card-body">
                    {/* Error Message */}
                    {errorMessage && (
                        <div className="alert alert-danger">{errorMessage}</div>
                    )}

                    {/* Forwarder Form */}
                    <form onSubmit={handleSubmit} className="mt-4">
                        {/* Name Field */}
                        <table
                            className="table table-bordered"
                            style={{ width: "100%", tableLayout: "fixed" }}
                        >
                            <tbody>
                                <tr>
                                    <td>
                                        <strong>
                                            Forwarder Name{" "}
                                            <span style={{ color: "red" }}>
                                                *
                                            </span>
                                        </strong>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            id="Name"
                                            name="Name"
                                            className="form-control"
                                            value={formData.Name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <strong>Notes</strong>
                                    </td>
                                    <td>
                                        <textarea
                                            id="Notes"
                                            name="Notes"
                                            className="form-control"
                                            value={formData.Notes}
                                            onChange={handleChange}
                                            rows={3}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <strong>
                                            Status{" "}
                                            <span style={{ color: "red" }}>
                                                *
                                            </span>
                                        </strong>
                                    </td>
                                    <td>
                                        <select
                                            id="Status"
                                            name="Status"
                                            className="form-select"
                                            value={formData.Status}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="Active">
                                                Active
                                            </option>
                                            <option value="Non-Active">
                                                Non-Active
                                            </option>
                                        </select>
                                    </td>
                                </tr>

                                {/* Warehouse Section */}
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="fw-bold text-center bg-light"
                                    >
                                        Warehouse Location
                                    </td>
                                </tr>
                                <tr>
                                    <td
                                        colSpan={1}
                                        className="fw-bold table text-center bg-light"
                                    >
                                        Address{" "}
                                    </td>
                                    <td
                                        colSpan={1}
                                        className="fw-bold table text-center bg-light"
                                    >
                                        PIC{" "}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <strong>
                                            Country{" "}
                                            <span style={{ color: "red" }}>
                                                *
                                            </span>
                                        </strong>
                                        <select
                                            id="CountryId"
                                            name="CountryId"
                                            className="form-select"
                                            value={formData.CountryId}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">
                                                Select a Country
                                            </option>
                                            {countries.map((country) => (
                                                <option
                                                    key={country.Code}
                                                    value={country.Code}
                                                >
                                                    {country.Name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <strong>Name PIC</strong>
                                        <input
                                            type="text"
                                            id="Description"
                                            name="Description"
                                            className="form-control"
                                            value={formData.Description}
                                            onChange={handleChange}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <strong>Address in Indonesia</strong>
                                        <input
                                            type="text"
                                            id="AddressIndonesia"
                                            name="AddressIndonesia"
                                            className="form-control"
                                            value={formData.AddressIndonesia}
                                            onChange={handleChange}
                                        />
                                    </td>
                                    <td>
                                        <strong>Department</strong>
                                        <input
                                            type="text"
                                            id="Department"
                                            name="Department"
                                            className="form-control"
                                            value={formData.Department}
                                            onChange={handleChange}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <strong>Coordinate in Indonesia</strong>
                                        <input
                                            type="text"
                                            id="CoordinateIndonesia"
                                            name="CoordinateIndonesia"
                                            className="form-control"
                                            value={formData.CoordinateIndonesia}
                                            onChange={handleChange}
                                        />
                                    </td>
                                    <td>
                                        <strong>Contact Method</strong>
                                        <select
                                            id="ContactMethod"
                                            name="ContactMethod"
                                            className="form-select"
                                            value={formData.ContactMethod}
                                            onChange={handleChange}
                                        >
                                            <option value="Email">Email</option>
                                            <option value="Telephone">
                                                Telephone
                                            </option>
                                            <option value="WA">WA</option>
                                        </select>
                                    </td>
                                </tr>

                                {/* BANK */}
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="fw-bold text-center bg-light"
                                    >
                                        Bank{" "}
                                        <span style={{ color: "red" }}>*</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <strong>
                                            Name Bank{" "}
                                            <span style={{ color: "red" }}>
                                                *
                                            </span>
                                        </strong>
                                    </td>
                                    <td>
                                        <select
                                            id="BankId"
                                            name="BankId"
                                            className="form-select"
                                            value={formData.BankId}
                                            onChange={handleChange}
                                        >
                                            <option value="">
                                                Select a Bank
                                            </option>
                                            {banks.map((bank) => (
                                                <option
                                                    key={bank.Code}
                                                    value={bank.Code}
                                                >
                                                    {bank.Name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <strong>
                                            Account Number{" "}
                                            <span style={{ color: "red" }}>
                                                *
                                            </span>
                                        </strong>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            id="AccountNumber"
                                            name="AccountNumber"
                                            className="form-control"
                                            value={formData.AccountNumber}
                                            onChange={handleChange}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="fw-bold text-center bg-light"
                                    >
                                        Additional Information
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <strong>Website</strong>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            id="Website"
                                            name="Website"
                                            className="form-control"
                                            value={formData.Website}
                                            onChange={handleChange}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <strong>Wechat</strong>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            id="Wechat"
                                            name="Wechat"
                                            className="form-control"
                                            value={formData.Wechat}
                                            onChange={handleChange}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <strong>Shipping Mark</strong>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            id="ShippingMark"
                                            name="ShippingMark"
                                            className="form-control"
                                            value={formData.ShippingMark}
                                            onChange={handleChange}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        {/* Submit Button */}
                        <div className="text-center">
                            <button
                                type="submit"
                                className="btn btn-dark"
                                disabled={loading}
                            >
                                {loading ? "Submitting..." : "Add Forwarder"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
