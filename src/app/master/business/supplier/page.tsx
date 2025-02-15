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
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add supplier.");
            }

            // Navigate back to the main page on success
            router.push("/master/business");
        } catch (error: any) {
            setErrorMessage(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    // return (
    //     <div className="container mt-4">
    //         <h1>Add New Supplier</h1>
    //         <p>
    //             Fill in the details below to add a new supplier to the system.
    //         </p>

    //         {/* Error Message */}
    //         {errorMessage && (
    //             <div className="alert alert-danger">{errorMessage}</div>
    //         )}

    //         {/* Supplier Form */}
    //         <form onSubmit={handleSubmit} className="mt-4">
    //             {/* Name Field */}
    //             <div className="mb-3">
    //                 <label htmlFor="Name" className="form-label">
    //                     Supplier Name <span style={{ color: "red" }}>*</span>
    //                 </label>
    //                 <input
    //                     type="text"
    //                     id="Name"
    //                     name="Name"
    //                     className="form-control"
    //                     value={formData.Name}
    //                     onChange={handleChange}
    //                     required
    //                 />
    //             </div>

    //             {/* Address Field */}
    //             <div className="mb-3">
    //                 <label htmlFor="Address" className="form-label">
    //                     Address
    //                 </label>
    //                 <input
    //                     type="text"
    //                     id="Address"
    //                     name="Address"
    //                     className="form-control"
    //                     value={formData.Address}
    //                     onChange={handleChange}
    //                 />
    //             </div>

    //             {/* City Field */}
    //             <div className="mb-3">
    //                 <label htmlFor="CityId" className="form-label">
    //                     City <span style={{ color: "red" }}>*</span>
    //                 </label>
    //                 <select
    //                     id="CityId"
    //                     name="CityId"
    //                     className="form-select"
    //                     value={formData.CityId}
    //                     onChange={handleChange}
    //                     required
    //                 >
    //                     <option value="">Select a City</option>
    //                     {cities.map((city: any) => (
    //                         <option key={city.Code} value={city.Code}>
    //                             {city.Name}
    //                         </option>
    //                     ))}
    //                 </select>
    //             </div>

    //             {/* Postal Code Field */}
    //             <div className="mb-3">
    //                 <label htmlFor="PostalCode" className="form-label">
    //                     Postal Code
    //                 </label>
    //                 <input
    //                     type="text"
    //                     id="PostalCode"
    //                     name="PostalCode"
    //                     className="form-control"
    //                     value={formData.PostalCode}
    //                     onChange={handleChange}
    //                 />
    //             </div>

    //             {/* Notes Field */}
    //             <div className="mb-3">
    //                 <label htmlFor="Notes" className="form-label">
    //                     Notes
    //                 </label>
    //                 <textarea
    //                     id="Notes"
    //                     name="Notes"
    //                     className="form-control"
    //                     value={formData.Notes}
    //                     onChange={handleChange}
    //                     rows={4}
    //                 />
    //             </div>

    //             {/* Status Field */}
    //             <div className="mb-3">
    //                 <label htmlFor="Status" className="form-label">
    //                     Status <span style={{ color: "red" }}>*</span>
    //                 </label>
    //                 <select
    //                     id="Status"
    //                     name="Status"
    //                     className="form-select"
    //                     value={formData.Status}
    //                     onChange={handleChange}
    //                     required
    //                 >
    //                     <option value="Active">Active</option>
    //                     <option value="Non-Active">Non-Active</option>
    //                 </select>
    //             </div>

    //             {/* Department Field */}
    //             <div className="mb-3">
    //                 <label htmlFor="Department" className="form-label">
    //                     Department
    //                 </label>
    //                 <input
    //                     type="text"
    //                     id="Department"
    //                     name="Department"
    //                     className="form-control"
    //                     value={formData.Department}
    //                     onChange={handleChange}
    //                 />
    //             </div>

    //             {/* Contact Method Field */}
    //             <div className="mb-3">
    //                 <label htmlFor="ContactMethod" className="form-label">
    //                     Contact Method
    //                 </label>
    //                 <select
    //                     id="ContactMethod"
    //                     name="ContactMethod"
    //                     className="form-select"
    //                     value={formData.ContactMethod}
    //                     onChange={handleChange}
    //                 >
    //                     <option value="Email">Email</option>
    //                     <option value="Telephone">Telephone</option>
    //                     <option value="WA">WA</option>
    //                 </select>
    //             </div>

    //             {/* Description Field */}
    //             <div className="mb-3">
    //                 <label htmlFor="Description" className="form-label">
    //                     Description
    //                 </label>
    //                 <input
    //                     type="text"
    //                     id="Description"
    //                     name="Description"
    //                     className="form-control"
    //                     value={formData.Description}
    //                     onChange={handleChange}
    //                 />
    //             </div>

    //             {/* Bank Field */}
    //             <div className="mb-3">
    //                 <label htmlFor="BankId" className="form-label">
    //                     Bank
    //                 </label>
    //                 <select
    //                     id="BankId"
    //                     name="BankId"
    //                     className="form-select"
    //                     value={formData.BankId}
    //                     onChange={handleChange}
    //                 >
    //                     <option value="">Select a Bank</option>
    //                     {banks.map((bank: any) => (
    //                         <option key={bank.Code} value={bank.Code}>
    //                             {bank.Name}
    //                         </option>
    //                     ))}
    //                 </select>
    //             </div>

    //             {/* Account Number Field */}
    //             <div className="mb-3">
    //                 <label htmlFor="AccountNumber" className="form-label">
    //                     Account Number
    //                 </label>
    //                 <input
    //                     type="text"
    //                     id="AccountNumber"
    //                     name="AccountNumber"
    //                     className="form-control"
    //                     value={formData.AccountNumber}
    //                     onChange={handleChange}
    //                 />
    //             </div>

    //             {/* Website Field */}
    //             <div className="mb-3">
    //                 <label htmlFor="Website" className="form-label">
    //                     Website
    //                 </label>
    //                 <input
    //                     type="text"
    //                     id="Website"
    //                     name="Website"
    //                     className="form-control"
    //                     value={formData.Website}
    //                     onChange={handleChange}
    //                 />
    //             </div>

    //             {/* Wechat Field */}
    //             <div className="mb-3">
    //                 <label htmlFor="Wechat" className="form-label">
    //                     Wechat
    //                 </label>
    //                 <input
    //                     type="text"
    //                     id="Wechat"
    //                     name="Wechat"
    //                     className="form-control"
    //                     value={formData.Wechat}
    //                     onChange={handleChange}
    //                 />
    //             </div>

    //             {/* Shipping Mark Field */}
    //             <div className="mb-3">
    //                 <label htmlFor="ShippingMark" className="form-label">
    //                     Shipping Mark
    //                 </label>
    //                 <input
    //                     type="text"
    //                     id="ShippingMark"
    //                     name="ShippingMark"
    //                     className="form-control"
    //                     value={formData.ShippingMark}
    //                     onChange={handleChange}
    //                 />
    //             </div>

    //             {/* Submit Button */}
    //             <button
    //                 type="submit"
    //                 className="btn btn-primary"
    //                 disabled={loading}
    //             >
    //                 {loading ? "Submitting..." : "Add Supplier"}
    //             </button>
    //         </form>
    //     </div>
    // );

    return (
        <div className="container mt-4">
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
                                        name="Description"
                                        className="form-control"
                                        value={formData.Description}
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
                                        className="form-control"
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
