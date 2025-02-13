"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Define the type for a City object
interface City {
    Code: number;
    Name: string;
    ProvinceId: number | null;
    CountryId: number | null;
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
        CountryId: string | number; // Allow string or number
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
        CountryId: "",
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

        // Autofill ProvinceId and CountryId when CityId changes
        if (name === "CityId") {
            const selectedCity = cities.find(
                (city) => city.Code === parseInt(value, 10)
            );
            if (selectedCity) {
                setFormData((prev) => ({
                    ...prev,
                    CityId: value,
                    ProvinceId: selectedCity.ProvinceId || "",
                    CountryId: selectedCity.CountryId || "",
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
            <h1>Add New Supplier</h1>
            <p>
                Fill in the details below to add a new supplier to the system.
            </p>

            {/* Error Message */}
            {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
            )}

            {/* Supplier Details */}
            <table className="table table-bordered">
                <tbody>
                    {/* Location Section */}
                    <tr>
                        <td colSpan={2} className="fw-bold">
                            Location
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Address <span style={{ color: "red" }}>*</span>
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
                        <td>Postal Code:</td>
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
                        <td>
                            City <span style={{ color: "red" }}>*</span>
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
                                    <option key={city.Code} value={city.Code}>
                                        {city.Name}
                                    </option>
                                ))}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>Province:</td>
                        <td>
                            <input
                                type="text"
                                name="Province"
                                className="form-control bg-light"
                                value={formData.ProvinceId}
                                readOnly
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Country:</td>
                        <td>
                            <input
                                type="text"
                                name="Country"
                                className="form-control bg-light"
                                value={formData.CountryId}
                                readOnly
                            />
                        </td>
                    </tr>

                    <tr>
                        <td>Notes</td>
                        <td colSpan={3}>
                            <textarea
                                name="Notes"
                                className="form-control"
                                value={formData.Notes}
                                onChange={handleChange}
                            ></textarea>
                        </td>
                    </tr>
                    <tr>
                        <td>Status</td>
                        <td>
                            <select
                                name="Status"
                                className="form-select"
                                value={formData.Status}
                                onChange={handleChange}
                                required
                            >
                                <option value="Active">Active</option>
                                <option value="Non-Active">Non-Active</option>
                            </select>
                        </td>
                    </tr>

                    {/* PIC Section */}
                    <tr>
                        <td colSpan={4} className="fw-bold">
                            Tab-Grid
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={4} className="fw-bold">
                            PIC <span style={{ color: "red" }}>*</span>
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
                                name="Name"
                                className="form-control"
                                value={formData.Name}
                                onChange={handleChange}
                                required
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
                                <option value="Email">Email</option>
                                <option value="Telephone">Telephone</option>
                                <option value="WA">WA</option>
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
                        <td colSpan={4} className="fw-bold">
                            Bank
                        </td>
                    </tr>
                    <tr>
                        <td>Name</td>
                        <td>Account Number</td>
                    </tr>
                    <tr>
                        <td>
                            <select
                                name="BankId"
                                className="form-select"
                                value={formData.BankId}
                                onChange={handleChange}
                            >
                                <option value="">Select a Bank</option>
                                {banks.map((bank: any) => (
                                    <option key={bank.Code} value={bank.Code}>
                                        {bank.Name}
                                    </option>
                                ))}
                            </select>
                        </td>
                        <td>
                            <input
                                type="text"
                                name="AccountNumber"
                                className="form-control"
                                value={formData.AccountNumber}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>

                    {/* Additional Info Section */}
                    <tr>
                        <td colSpan={4} className="fw-bold">
                            Additional Info
                        </td>
                    </tr>
                    <tr>
                        <td>Name</td>
                        <td>Detail</td>
                    </tr>
                    <tr>
                        <td>Website</td>
                        <td>
                            <input
                                type="text"
                                name="Website"
                                className="form-control"
                                value={formData.Website}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Wechat</td>
                        <td>
                            <input
                                type="text"
                                name="Wechat"
                                className="form-control"
                                value={formData.Wechat}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Shipping Mark</td>
                        <td>
                            <input
                                type="text"
                                name="ShippingMark"
                                className="form-control"
                                value={formData.ShippingMark}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>

                    {/* Submit Button */}
                    <tr>
                        <td colSpan={4} className="text-center">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                onClick={handleSubmit} // Manually trigger submit function
                            >
                                {loading ? "Submitting..." : "Add Supplier"}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
