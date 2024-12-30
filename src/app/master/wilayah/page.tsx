"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function WilayahPage() {
    const router = useRouter();

    const [cities, setCities] = useState<any[]>([]);
    const [provinces, setProvinces] = useState<any[]>([]);
    const [countries, setCountries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Fetch data for cities, provinces, and countries
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [citiesRes, provincesRes, countriesRes] =
                    await Promise.all([
                        fetch(
                            `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/cities`
                        ),
                        fetch(
                            `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/provinces`
                        ),
                        fetch(
                            `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/countries`
                        ),
                    ]);

                if (!citiesRes.ok || !provincesRes.ok || !countriesRes.ok) {
                    throw new Error("Failed to fetch data.");
                }

                const [citiesData, provincesData, countriesData] =
                    await Promise.all([
                        citiesRes.json(),
                        provincesRes.json(),
                        countriesRes.json(),
                    ]);

                setCities(citiesData?.data || []);
                setProvinces(provincesData?.data || []);
                setCountries(countriesData?.data || []);
            } catch (error: any) {
                setErrorMessage(
                    error.message || "An unexpected error occurred."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Delete an item
    const handleDelete = async (endpoint: string, id: number) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/${endpoint}/${id}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete item.");
            }

            // Refresh the data after deletion
            const fetchData = async () => {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/${endpoint}`
                );
                const data = await res.json();
                return data?.data || [];
            };

            if (endpoint === "cities") setCities(await fetchData());
            if (endpoint === "provinces") setProvinces(await fetchData());
            if (endpoint === "countries") setCountries(await fetchData());
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    return (
        <div className="container mt-4">
            <h1>Wilayah</h1>
            <p>View and manage your geographical settings here.</p>
            {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
            )}

            {/* Cards */}
            <div className="row mt-4">
                {/* City Card */}
                <div className="col-md-4">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <i
                                className="bi bi-building"
                                style={{ fontSize: "2rem", color: "#6c757d" }}
                            ></i>
                            <h5 className="card-title mt-3">City</h5>
                            <p className="card-text">
                                Manage your city information and settings.
                            </p>
                            <Link href="/master/wilayah/city">
                                <button className="btn btn-primary">
                                    Go to City
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Province Card */}
                <div className="col-md-4">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <i
                                className="bi bi-geo"
                                style={{ fontSize: "2rem", color: "#6c757d" }}
                            ></i>
                            <h5 className="card-title mt-3">Province</h5>
                            <p className="card-text">
                                Manage your province information and settings.
                            </p>
                            <Link href="/master/wilayah/province">
                                <button className="btn btn-primary">
                                    Go to Province
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Country Card */}
                <div className="col-md-4">
                    <div className="card text-center shadow-sm">
                        <div className="card-body">
                            <i
                                className="bi bi-flag"
                                style={{ fontSize: "2rem", color: "#6c757d" }}
                            ></i>
                            <h5 className="card-title mt-3">Country</h5>
                            <p className="card-text">
                                Manage your country information and settings.
                            </p>
                            <Link href="/master/wilayah/country">
                                <button className="btn btn-primary">
                                    Go to Country
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Tables */}
            {loading ? (
                <p className="text-center mt-5">Loading data...</p>
            ) : (
                <>
                    {/* Countries Table */}
                    <h2>Countries</h2>
                    <table className="table table-bordered mt-3">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {countries.length > 0 ? (
                                countries.map((country: any) => (
                                    <tr key={country.Code}>
                                        <td>{country.Code}</td>
                                        <td>{country.Name}</td>
                                        <td>{country.Status}</td>
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() =>
                                                    router.push(
                                                        `/master/wilayah/country/edit/${country.Code}`
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() =>
                                                    handleDelete(
                                                        "countries",
                                                        country.Code
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4}>No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Provinces Table */}
                    <h2>Provinces</h2>
                    <table className="table table-bordered mt-3">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Country</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {provinces.length > 0 ? (
                                provinces.map((province: any) => (
                                    <tr key={province.Code}>
                                        <td>{province.Code}</td>
                                        <td>{province.Name}</td>
                                        <td>
                                            {countries.find(
                                                (c: any) =>
                                                    c.Code ===
                                                    province.CountryId
                                            )?.Name || "N/A"}
                                        </td>
                                        <td>{province.Status}</td>
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() =>
                                                    router.push(
                                                        `/master/wilayah/province/edit/${province.Code}`
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() =>
                                                    handleDelete(
                                                        "provinces",
                                                        province.Code
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5}>No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Cities Table */}
                    <h2>Cities</h2>
                    <table className="table table-bordered mt-3">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Province</th>
                                <th>Country</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cities.length > 0 ? (
                                cities.map((city: any) => (
                                    <tr key={city.Code}>
                                        <td>{city.Code}</td>
                                        <td>{city.Name}</td>
                                        <td>
                                            {provinces.find(
                                                (p: any) =>
                                                    p.Code === city.ProvinceId
                                            )?.Name || "N/A"}
                                        </td>
                                        <td>
                                            {countries.find(
                                                (c: any) =>
                                                    c.Code === city.CountryId
                                            )?.Name || "N/A"}
                                        </td>
                                        <td>{city.Status}</td>
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() =>
                                                    router.push(
                                                        `/master/wilayah/city/edit/${city.Code}`
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() =>
                                                    handleDelete(
                                                        "cities",
                                                        city.Code
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6}>No data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}
