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

export default function EditForwarderPage() {
    const { id } = useParams();
    const router = useRouter();

    const [formData, setFormData] = useState({
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
    const [countries, setCountries] = useState([]);
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchForwarderData = async () => {
            try {
                const { data: forwarder } = await fetchData(
                    `/master/forwarders/${id}`
                );
                const { data: countries } = await fetchData(
                    `/master/countries`
                );
                const { data: banks } = await fetchData(`/master/banks`);

                setFormData({
                    Name: forwarder.Name || "",
                    Notes: forwarder.Notes || "",
                    CountryId: forwarder.CountryId || "",
                    AddressIndonesia: forwarder.AddressIndonesia || "",
                    CoordinateIndonesia: forwarder.CoordinateIndonesia || "",
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
                setCountries(countries);
                setBanks(banks);
            } catch (error: any) {
                setError(error.message || "Failed to load forwarder data.");
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
                throw new Error("Failed to update forwarder.");
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
            <h1>Edit Forwarder</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                {/* Name Field */}
                <div className="mb-3">
                    <label htmlFor="Name" className="form-label">
                        Forwarder Name
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

                {/* ContactMethod Field */}
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
                        <option value="" disabled>
                            Select a bank
                        </option>
                        {banks.map((bank: any) => (
                            <option key={bank.Code} value={bank.Code}>
                                {bank.Name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status Field */}
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
