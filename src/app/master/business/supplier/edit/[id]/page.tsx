"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

// Define types for City and Bank
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

async function fetchData(endpoint: string) {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`
    );
    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${endpoint}`);
    }
    return response.json();
}

export default function EditSupplierPage() {
    const { id } = useParams();
    const router = useRouter();

    const [formData, setFormData] = useState<{
        Name: string;
        Address: string;
        CityId: string | number;
        ProvinceId: string | number;
        CountryId: string | number;
        PostalCode: string;
        Notes: string;
        Status: string;
        Department: string;
        ContactMethod: string;
        Description: string;
        BankId: string | number;
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

    const [cities, setCities] = useState<City[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSupplierData = async () => {
            try {
                const { data: supplier } = await fetchData(
                    `/master/suppliers/${id}`
                );
                const { data: cities } = await fetchData(`/master/cities`);
                const { data: banks } = await fetchData(`/master/banks`);

                setFormData({
                    Name: supplier.Name || "",
                    Address: supplier.Address || "",
                    CityId: supplier.CityId || "",
                    ProvinceId: supplier.ProvinceId || "",
                    CountryId: supplier.CountryId || "",
                    PostalCode: supplier.PostalCode || "",
                    Notes: supplier.Notes || "",
                    Status: supplier.Status || "Active",
                    Department: supplier.Department || "",
                    ContactMethod: supplier.ContactMethod || "Email",
                    Description: supplier.Description || "",
                    BankId: supplier.BankId || "",
                    AccountNumber: supplier.AccountNumber || "",
                    Website: supplier.Website || "",
                    Wechat: supplier.Wechat || "",
                    ShippingMark: supplier.ShippingMark || "",
                });
                setCities(cities);
                setBanks(banks);
            } catch (error: any) {
                setError(error.message || "Failed to load supplier data.");
            }
        };

        fetchSupplierData();
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

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
        setError(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/suppliers/${id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );
            if (!response.ok) {
                throw new Error("Failed to update supplier.");
            }
            router.push("/master/business");
        } catch (error: any) {
            setError(error.message || "Failed to update supplier.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Edit Supplier</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                {/* Name Field */}
                <div className="mb-3">
                    <label htmlFor="Name" className="form-label">
                        Supplier Name
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

                {/* Address Field */}
                <div className="mb-3">
                    <label htmlFor="Address" className="form-label">
                        Address
                    </label>
                    <input
                        type="text"
                        id="Address"
                        name="Address"
                        className="form-control"
                        value={formData.Address}
                        onChange={handleChange}
                    />
                </div>

                {/* City Field */}
                <div className="mb-3">
                    <label htmlFor="CityId" className="form-label">
                        City
                    </label>
                    <select
                        id="CityId"
                        name="CityId"
                        className="form-select"
                        value={formData.CityId}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>
                            Select a city
                        </option>
                        {cities.map((city: any) => (
                            <option key={city.Code} value={city.Code}>
                                {city.Name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Province Field
                <div className="mb-3">
                    <label htmlFor="ProvinceId" className="form-label">
                        Province
                    </label>
                    <input
                        type="text"
                        id="ProvinceId"
                        name="ProvinceId"
                        className="form-control"
                        value={formData.ProvinceId}
                        readOnly
                    />
                </div> */}

                {/* Country Field */}
                {/* <div className="mb-3">
                    <label htmlFor="CountryId" className="form-label">
                        Country
                    </label>
                    <input
                        type="text"
                        id="CountryId"
                        name="CountryId"
                        className="form-control"
                        value={formData.CountryId}
                        readOnly
                    />
                </div> */}

                {/* Other Fields */}
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
