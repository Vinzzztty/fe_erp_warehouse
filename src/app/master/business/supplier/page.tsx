"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface City {
    Code: number;
    Name: string;
    ProvinceId: number | null;
    CountryId: number | null;
    Province?: {
        // Add Province object (optional)
        Code: number;
        Name: string;
        CountryId: number;
        Status: string;
    };
    Country?: {
        // Add Country object (optional)
        Code: number;
        Name: string;
        Status: string;
    };
}

interface Bank {
    Code: number;
    Name: string;
}

export default function AddSupplierPage() {
    const router = useRouter();
    const [cities, setCities] = useState<City[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [formData, setFormData] = useState<{
        Name: string;
        Address: string;
        CityId: string;
        ProvinceId: string | number; // Allow string or number
        ProvinceName: string;
        CountryId: string | number; // Allow string or number
        CountryName: string;
        PostalCode: string;
        Notes: string;
        Status: string;
        NamePIC: string;
        Department: string;
        ContactMethod: string;
        Description: string;
        BankId: string;
        AccountNumber: string;
        Website: string;
        Wechat: string;
        ShippingMark: string;
    }>({
        Name: "",
        Address: "",
        CityId: "",
        ProvinceId: "",
        ProvinceName: "", // Store Province Name for display
        CountryId: "",
        CountryName: "", // Store Country Name for display
        PostalCode: "",
        Notes: "",
        Status: "Active",
        NamePIC: "",
        Department: "",
        ContactMethod: "Email",
        Description: "",
        BankId: "",
        AccountNumber: "",
        Website: "",
        Wechat: "",
        ShippingMark: "",
    });
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Fetch Cities and Banks
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [citiesRes, banksRes] = await Promise.all([
                    fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/cities`
                    ),
                    fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/banks`
                    ),
                ]);

                if (!citiesRes.ok || !banksRes.ok) {
                    throw new Error("Failed to fetch metadata.");
                }

                const [citiesData, banksData] = await Promise.all([
                    citiesRes.json(),
                    banksRes.json(),
                ]);

                setCities(
                    citiesData?.data.filter(
                        (citiesData: any) => citiesData.Status == "Active"
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

        // When CityId changes, update ProvinceId, ProvinceName, CountryId, and CountryName
        if (name === "CityId") {
            const selectedCity = cities.find(
                (city) => city.Code === parseInt(value, 10)
            );

            if (selectedCity) {
                setFormData((prev) => ({
                    ...prev,
                    CityId: value,
                    ProvinceId: selectedCity.ProvinceId || "", // Keep Province ID for backend
                    ProvinceName: selectedCity.Province
                        ? selectedCity.Province.Name
                        : "", // Display Province Name
                    CountryId: selectedCity.CountryId || "", // Keep Country ID for backend
                    CountryName: selectedCity.Country
                        ? selectedCity.Country.Name
                        : "", // Display Country Name
                }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/suppliers`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (!response.ok) {
                const errorData = await response.json(); // Extract response JSON
                let apiMessage =
                    errorData?.status?.message || "Failed to add Supplier";

                // ✅ Customize error message if "already exists"
                if (apiMessage.includes("already exists")) {
                    apiMessage = "The name is Duplicate";
                }

                throw new Error(apiMessage); // Throw error so it goes to catch block
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
            {/* Back Button */}
            <button
                className="btn btn-outline-dark mb-3"
                onClick={() => router.push("/master/business")}
            >
                <i className="bi bi-arrow-left"></i> Back
            </button>
            <div className="card shadow-sm">
                <div className="card-header bg-dark text-white text-center">
                    <h4>Add New Supplier</h4>
                    <p>
                        Fill in the details below to add a new supplier to the
                        system.
                    </p>
                </div>
                <div className="card-body">
                    {/* Error Message */}
                    {errorMessage && (
                        <div className="alert alert-danger">{errorMessage}</div>
                    )}

                    {/* Supplier Details */}
                    <table className="table table-bordered">
                        <tbody>
                            <tr>
                                <td className="align-middle w-25">
                                    <strong>
                                        Supplier Name{" "}
                                        <span className="text-danger">*</span>
                                    </strong>
                                </td>
                                <td colSpan={3}>
                                    <div className="input-group w-100">
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
                                </td>
                            </tr>

                            {/* Location Section */}
                            <tr>
                                <td
                                    colSpan={4}
                                    className="fw-bold text-center bg-light"
                                >
                                    Location
                                </td>
                            </tr>
                            <tr>
                                <td className="align-middle w-25">
                                    <strong>
                                        Address{" "}
                                        <span className="text-danger">*</span>
                                    </strong>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        name="Address"
                                        className="form-control"
                                        value={formData.Address}
                                        onChange={handleChange}
                                        required
                                    />
                                </td>
                                <td className="align-middle w-25">
                                    <strong>Postal Code:</strong>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        name="PostalCode"
                                        className="form-control"
                                        value={formData.PostalCode}
                                        onChange={handleChange}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="align-middle w-25">
                                    <strong>
                                        City{" "}
                                        <span className="text-danger">*</span>
                                    </strong>
                                </td>
                                <td>
                                    <select
                                        name="CityId"
                                        className="form-select"
                                        value={formData.CityId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select a City</option>
                                        {cities.map((city: any) => (
                                            <option
                                                key={city.Code}
                                                value={city.Code}
                                            >
                                                {city.Name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                {/* Corrected rowSpan Usage */}
                                <td rowSpan={2} className="align-middle w-25">
                                    <strong>Notes:</strong>
                                </td>
                                <td rowSpan={2}>
                                    <textarea
                                        name="Notes"
                                        className="form-control"
                                        value={formData.Notes}
                                        onChange={handleChange}
                                        style={{ height: "100%" }}
                                    ></textarea>
                                </td>
                            </tr>
                            <tr>
                                <td className="align-middle w-25">
                                    <strong>Province:</strong>
                                </td>
                                <td>
                                    {/* Hidden input for storing Province ID */}
                                    <input
                                        type="hidden"
                                        name="ProvinceId"
                                        value={formData.ProvinceId}
                                    />
                                    {/* Display Province Name */}
                                    <input
                                        type="text"
                                        name="ProvinceName"
                                        className="form-control bg-light"
                                        value={formData.ProvinceName}
                                        readOnly
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="align-middle w-25">
                                    <strong>Country:</strong>
                                </td>
                                <td>
                                    {/* Hidden input for storing Country ID */}
                                    <input
                                        type="hidden"
                                        name="CountryId"
                                        value={formData.CountryId}
                                    />
                                    {/* Display Country Name */}
                                    <input
                                        type="text"
                                        name="CountryName"
                                        className="form-control bg-light"
                                        value={formData.CountryName}
                                        readOnly
                                    />
                                </td>
                                <td className="align-middle w-25">
                                    <strong>Status:</strong>
                                </td>
                                <td>
                                    <select
                                        name="Status"
                                        className="form-select"
                                        value={formData.Status}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Non-Active">
                                            Non-Active
                                        </option>
                                    </select>
                                </td>
                            </tr>

                            {/* PIC Section */}
                            <tr>
                                <td
                                    colSpan={4}
                                    className="fw-bold text-center bg-light"
                                >
                                    PIC
                                </td>
                            </tr>
                            <tr>
                                <td>Name</td>
                                <td>Department</td>
                                <td>Contact Method</td>
                                <td>Description</td>
                            </tr>
                            <tr>
                                <td>
                                    <input
                                        type="text"
                                        name="NamePIC"
                                        className="form-control"
                                        value={formData.NamePIC}
                                        onChange={handleChange}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        name="Department"
                                        className="form-control"
                                        value={formData.Department}
                                        onChange={handleChange}
                                    />
                                </td>
                                <td>
                                    <select
                                        name="ContactMethod"
                                        className="form-select"
                                        value={formData.ContactMethod}
                                        onChange={handleChange}
                                    >
                                        {["Email", "Telephone", "WA"].map(
                                            (method) => (
                                                <option
                                                    key={method}
                                                    value={method}
                                                >
                                                    {method}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        name="Description"
                                        className="form-control"
                                        value={formData.Description}
                                        onChange={handleChange}
                                    />
                                </td>
                            </tr>

                            {/* Bank Section */}
                            <tr>
                                <td
                                    colSpan={4}
                                    className="fw-bold text-center bg-light"
                                >
                                    Bank Details{" "}
                                    <span className="text-danger">*</span>
                                </td>
                            </tr>
                            <tr>
                                <td className="align-middle w-25">
                                    <strong>
                                        Bank Name{" "}
                                        <span className="text-danger">*</span>
                                    </strong>
                                </td>
                                <td colSpan={3}>
                                    <div className="input-group w-100">
                                        <span className="input-group-text">
                                            <i className="bi bi-bank"></i>
                                        </span>
                                        <select
                                            id="BankId"
                                            name="BankId"
                                            className="form-select"
                                            value={formData.BankId}
                                            onChange={handleChange}
                                            required
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
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="align-middle w-25">
                                    <strong>
                                        Account Number{" "}
                                        <span className="text-danger">*</span>
                                    </strong>
                                </td>
                                <td colSpan={3}>
                                    <div className="input-group w-100">
                                        <span className="input-group-text">
                                            <i className="bi bi-credit-card"></i>
                                        </span>
                                        <input
                                            type="text"
                                            id="AccountNumber"
                                            name="AccountNumber"
                                            className="form-control"
                                            value={formData.AccountNumber}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </td>
                            </tr>

                            {/* Additional Info Section */}
                            {/* Additional Info Section */}
                            <tr>
                                <td
                                    colSpan={4}
                                    className="fw-bold text-center bg-light"
                                >
                                    Additional Info
                                </td>
                            </tr>
                            <tr>
                                <td className="align-middle w-25">
                                    <strong>Website</strong>
                                </td>
                                <td colSpan={3}>
                                    <div className="input-group w-100">
                                        <span className="input-group-text">
                                            <i className="bi bi-globe"></i>
                                        </span>
                                        <input
                                            type="text"
                                            name="Website"
                                            className="form-control"
                                            value={formData.Website}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="align-middle w-25">
                                    <strong>Wechat</strong>
                                </td>
                                <td colSpan={3}>
                                    <div className="input-group w-100">
                                        <span className="input-group-text">
                                            <i className="bi bi-chat-dots"></i>
                                        </span>
                                        <input
                                            type="text"
                                            name="Wechat"
                                            className="form-control"
                                            value={formData.Wechat}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="align-middle w-25">
                                    <strong>Shipping Mark</strong>
                                </td>
                                <td colSpan={3}>
                                    <div className="input-group w-100">
                                        <span className="input-group-text">
                                            <i className="bi bi-box-seam"></i>
                                        </span>
                                        <input
                                            type="text"
                                            name="ShippingMark"
                                            className="form-control"
                                            value={formData.ShippingMark}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </td>
                            </tr>

                            {/* Submit Button */}
                            <tr>
                                <td colSpan={4} className="text-center">
                                    <button
                                        type="submit"
                                        className="btn btn-dark"
                                        disabled={loading}
                                        onClick={handleSubmit} // Manually trigger submit function
                                    >
                                        {loading
                                            ? "Submitting..."
                                            : "Add Supplier"}
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
