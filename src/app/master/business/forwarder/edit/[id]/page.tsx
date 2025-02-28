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

// Define the type for Country and Bank objects
interface Country {
    Code: number;
    Name: string;
}

interface Bank {
    Code: number;
    Name: string;
}

export default function EditForwarderPage() {
    const { id } = useParams();
    const router = useRouter();

    const [formData, setFormData] = useState<{
        Name: string;
        Notes: string;
        CountryId: string | number;
        AddressChina: string;
        AddressIndonesia: string;
        CoordinateIndonesia: string;
        NamePIC: string;
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
        AddressChina: "",
        AddressIndonesia: "",
        CoordinateIndonesia: "",
        NamePIC: "",
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
    const [countries, setCountries] = useState<Country[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchForwarderData = async () => {
            setLoading(true); // ✅ Start Loading
            setError(null); // Clear previous errors
            try {
                const { data: forwarder } = await fetchData(
                    `/master/forwarders/${id}`
                );

                const countryResponse = await fetchData(`/master/countries`);
                const bankResponse = await fetchData(`/master/banks`);

                // Ensure countryResponse and bankResponse exist before filtering
                const activeCountries = countryResponse?.data
                    ? countryResponse.data.filter(
                          (country: any) => country.Status === "Active"
                      )
                    : [];

                const activeBanks = bankResponse?.data
                    ? bankResponse.data.filter(
                          (bank: any) => bank.Status === "Active"
                      )
                    : [];

                setFormData({
                    Name: forwarder.Name || "",
                    Notes: forwarder.Notes || "",
                    CountryId: forwarder.CountryId || "",
                    AddressChina: forwarder.AddressChina || "",
                    AddressIndonesia: forwarder.AddressIndonesia || "",
                    CoordinateIndonesia: forwarder.CoordinateIndonesia || "",
                    NamePIC: forwarder.NamePIC || "",
                    Department: forwarder.Department || "",
                    ContactMethod: forwarder.ContactMethod || "Email",
                    Description: forwarder.Description || "",
                    BankId: forwarder.BankId || "",
                    AccountNumber: forwarder.AccountNumber || "",
                    Website: forwarder.Website || "",
                    Wechat: forwarder.Wechat || "",
                    ShippingMark: forwarder.ShippingMark || "",
                    Status: forwarder.Status || "Active",
                });
                setCountries(activeCountries);
                setBanks(activeBanks);
            } catch (error: any) {
                setError(error.message || "Failed to load forwarder data.");
            } finally {
                setLoading(false); // ✅ Stop Loading
            }
        };

        fetchForwarderData();
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
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
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/forwarders/${id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );
            if (!response.ok) {
                const errorData = await response.json(); // Extract response JSON
                let apiMessage =
                    errorData?.status?.message || "Failed to update Forwarder";

                // ✅ Customize error message if "already exists"
                if (apiMessage.includes("already exists")) {
                    apiMessage = "The name is Duplicate";
                }

                throw new Error(apiMessage); // Throw error so it goes to catch block
            }
            router.push("/master/business");
        } catch (error: any) {
            setError(error.message || "Failed to update forwarder.");
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
                    {" "}
                    <h4>Edit Forwarder</h4>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="text-center my-4">
                            <div
                                className="spinner-border text-primary"
                                role="status"
                            >
                                <span className="visually-hidden">
                                    Loading...
                                </span>
                            </div>
                            <p>Fetching Forwarders data...</p>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger text-center">
                            {error}
                        </div>
                    ) : (
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
                                            <strong>Address in China</strong>
                                            <input
                                                type="text"
                                                id="AddressChina"
                                                name="AddressChina"
                                                className="form-control"
                                                value={formData.AddressChina}
                                                onChange={handleChange}
                                            />
                                        </td>
                                        {/* <td>
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
                                        </td> */}
                                        <td>
                                            <strong>Name PIC</strong>
                                            <input
                                                type="text"
                                                id="NamePIC"
                                                name="NamePIC"
                                                className="form-control"
                                                value={formData.NamePIC}
                                                onChange={handleChange}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>
                                                Address in Indonesia
                                            </strong>
                                            <input
                                                type="text"
                                                id="AddressIndonesia"
                                                name="AddressIndonesia"
                                                className="form-control"
                                                value={
                                                    formData.AddressIndonesia
                                                }
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
                                            <strong>
                                                Coordinate in Indonesia
                                            </strong>
                                            <input
                                                type="text"
                                                id="CoordinateIndonesia"
                                                name="CoordinateIndonesia"
                                                className="form-control"
                                                value={
                                                    formData.CoordinateIndonesia
                                                }
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
                                                <option value="Email">
                                                    Email
                                                </option>
                                                <option value="Telephone">
                                                    Telephone
                                                </option>
                                                <option value="WA">WA</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>
                                            <strong>Description</strong>
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

                                    {/* BANK */}
                                    <tr>
                                        <td
                                            colSpan={2}
                                            className="fw-bold text-center bg-light"
                                        >
                                            Bank
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
                                            <strong>Account Number</strong>
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
                                    {loading
                                        ? "Submitting..."
                                        : "Submit Edit Forwarder"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
