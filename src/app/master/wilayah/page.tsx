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

    const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<
        string | null
    >(null);

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

                setCities(
                    (citiesData?.data || []).sort((a: any, b: any) =>
                        a.Status.localeCompare(b.Status)
                    )
                );
                setProvinces(
                    (provincesData?.data || []).sort((a: any, b: any) =>
                        a.Status.localeCompare(b.Status)
                    )
                );
                setCountries(
                    (countriesData?.data || []).sort((a: any, b: any) =>
                        a.Status.localeCompare(b.Status)
                    )
                );
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

            // Show success message
            setDeleteSuccessMessage("Item deleted successfully!");

            // Hide the message after 3 seconds
            setTimeout(() => setDeleteSuccessMessage(null), 3000);
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    return (
        <div className="container-fluid mt-4">
            <div className="text-center card shadow-lg p-4 rounded">
                <h1>
                    <i className="bi-map me-2"></i> Wilayah
                </h1>
                <p>View and manage your geographical settings here.</p>
                {errorMessage && (
                    <div className="alert alert-danger">{errorMessage}</div>
                )}
                {deleteSuccessMessage && (
                    <div className="alert alert-success text-center">
                        {deleteSuccessMessage}
                    </div>
                )}
            </div>

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
                                <button className="btn btn-dark">
                                    Add City
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
                                <button className="btn btn-dark">
                                    Add Province
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
                                <button className="btn btn-dark">
                                    Add Country
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
                    {/* Cities Table */}
                    <div className="card shadow-lg p-4 rounded mt-4">
                        <p className="mb-4 fw-bold">Cities</p>
                        {errorMessage && (
                            <div className="alert alert-danger">
                                {errorMessage}
                            </div>
                        )}
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover align-middle text-center">
                                <thead className="table-dark">
                                    <tr>
                                        <th>No</th>
                                        <th>Name</th>
                                        <th>Province</th>
                                        <th>Country</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cities.length > 0 ? (
                                        cities.map(
                                            (city: any, index: number) => (
                                                <tr key={city.Code}>
                                                    <td className="fw-bold">
                                                        {index + 1}
                                                    </td>
                                                    <td>{city.Name}</td>
                                                    <td>
                                                        {provinces.find(
                                                            (p: any) =>
                                                                p.Code ===
                                                                city.ProvinceId
                                                        )?.Name || "N/A"}
                                                    </td>
                                                    <td>
                                                        {countries.find(
                                                            (c: any) =>
                                                                c.Code ===
                                                                city.CountryId
                                                        )?.Name || "N/A"}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                city.Status ===
                                                                "Active"
                                                                    ? "bg-success"
                                                                    : "bg-secondary"
                                                            }`}
                                                        >
                                                            {city.Status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-warning btn-sm me-2"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/master/wilayah/city/edit/${city.Code}`
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-pencil-square"></i>{" "}
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
                                                            <i className="bi bi-trash"></i>{" "}
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td colSpan={6}>
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Provinces Table */}
                    <div className="card shadow-lg p-4 rounded mt-4">
                        <p className="mb-4 fw-bold">Provinces</p>
                        {errorMessage && (
                            <div className="alert alert-danger">
                                {errorMessage}
                            </div>
                        )}
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover align-middle text-center">
                                <thead className="table-dark">
                                    <tr>
                                        <th>No</th>
                                        <th>Name</th>
                                        <th>Country</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {provinces.length > 0 ? (
                                        provinces.map(
                                            (province: any, index: number) => (
                                                <tr key={province.Code}>
                                                    <td className="fw-bold">
                                                        {index + 1}
                                                    </td>
                                                    <td>{province.Name}</td>
                                                    <td>
                                                        {countries.find(
                                                            (c: any) =>
                                                                c.Code ===
                                                                province.CountryId
                                                        )?.Name || "N/A"}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                province.Status ===
                                                                "Active"
                                                                    ? "bg-success"
                                                                    : "bg-secondary"
                                                            }`}
                                                        >
                                                            {province.Status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-warning btn-sm me-2"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/master/wilayah/province/edit/${province.Code}`
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-pencil-square"></i>{" "}
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
                                                            <i className="bi bi-trash"></i>{" "}
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td colSpan={5}>
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Countries Table */}
                    <div className="card shadow-lg p-4 rounded mt-4">
                        <p className="mb-4 fw-bold">Countries</p>
                        {errorMessage && (
                            <div className="alert alert-danger">
                                {errorMessage}
                            </div>
                        )}
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover align-middle text-center">
                                <thead className="table-dark">
                                    <tr>
                                        <th>No</th>
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
                                                <td>
                                                    <span
                                                        className={`badge ${
                                                            country.Status ===
                                                            "Active"
                                                                ? "bg-success"
                                                                : "bg-secondary"
                                                        }`}
                                                    >
                                                        {country.Status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-warning btn-sm me-2"
                                                        onClick={() =>
                                                            router.push(
                                                                `/master/wilayah/country/edit/${country.Code}`
                                                            )
                                                        }
                                                    >
                                                        <i className="bi bi-pencil-square"></i>{" "}
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
                                                        <i className="bi bi-trash"></i>{" "}
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4}>
                                                No data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
