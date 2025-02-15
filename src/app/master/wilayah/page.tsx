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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{
        endpoint: string;
        id: number;
    } | null>(null);
    const [loadingDelete, setLoadingDelete] = useState(false); // Track deletion loading state

    const [countryStartIndex, setCountryStartIndex] = useState(0);
    const countryItemsPerPage = 5;

    const [cityStartIndex, setCityStartIndex] = useState(0);
    const cityItemsPerPage = 5;

    const [provinceStartIndex, setProvinceStartIndex] = useState(0);
    const provinceItemsPerPage = 5;

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

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return; // Ensure there is an item selected for deletion
        setLoadingDelete(true); // Show loading state

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/${itemToDelete.endpoint}/${itemToDelete.id}`,
                { method: "DELETE" }
            );

            if (!response.ok) {
                throw new Error("Failed to delete item.");
            }

            // Show success message inside modal
            setDeleteSuccessMessage("Item deleted successfully!");

            // Wait 3 seconds before reloading the page
            setTimeout(() => {
                window.location.reload(); // Reload the browser
            }, 1000);
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        } finally {
            setLoadingDelete(false); // Remove loading state
            setShowDeleteModal(false); // Hide modal
            setItemToDelete(null);
        }
    };

    // Get the current slice of cities
    const displayedCities = cities.slice(
        cityStartIndex,
        cityStartIndex + cityItemsPerPage
    );

    // Get the current slice of provinces
    const displayedProvinces = provinces.slice(
        provinceStartIndex,
        provinceStartIndex + provinceItemsPerPage
    );

    // Get the current slice of countries
    const displayedCountries = countries.slice(
        countryStartIndex,
        countryStartIndex + countryItemsPerPage
    );

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
                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && (
                        <div
                            className="modal show d-block"
                            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                        >
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">
                                            Confirm Delete
                                        </h5>
                                        <button
                                            className="btn-close"
                                            onClick={() =>
                                                setShowDeleteModal(false)
                                            }
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        {deleteSuccessMessage ? (
                                            <div className="alert alert-success text-center">
                                                {deleteSuccessMessage}
                                            </div>
                                        ) : (
                                            <p>
                                                Are you sure you want to delete
                                                this item?
                                            </p>
                                        )}
                                    </div>
                                    <div className="modal-footer">
                                        {!deleteSuccessMessage && (
                                            <>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() =>
                                                        setShowDeleteModal(
                                                            false
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={
                                                        handleConfirmDelete
                                                    }
                                                    disabled={loadingDelete}
                                                >
                                                    {loadingDelete ? (
                                                        <span className="spinner-border spinner-border-sm"></span>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-trash"></i>{" "}
                                                            Confirm Delete
                                                        </>
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
                                    {/* Display Cities */}
                                    {displayedCities.map((city, index) => (
                                        <tr
                                            key={city.Code}
                                            style={{ height: "60px" }}
                                        >
                                            <td className="fw-bold">
                                                {cityStartIndex + index + 1}
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
                                                        city.Status === "Active"
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
                                                    onClick={() => {
                                                        setItemToDelete({
                                                            endpoint: "cities",
                                                            id: city.Code,
                                                        });
                                                        setShowDeleteModal(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    <i className="bi bi-trash"></i>{" "}
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {/* Fill empty rows to maintain table structure */}
                                    {displayedCities.length <
                                        cityItemsPerPage &&
                                        [
                                            ...Array(
                                                cityItemsPerPage -
                                                    displayedCities.length
                                            ),
                                        ].map((_, i) => (
                                            <tr
                                                key={`empty-city-${i}`}
                                                style={{ height: "60px" }}
                                            >
                                                <td colSpan={6}></td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Buttons */}
                        <div className="d-flex justify-content-between mt-3">
                            <button
                                className="btn btn-outline-dark"
                                disabled={cityStartIndex === 0}
                                onClick={() =>
                                    setCityStartIndex((prev) =>
                                        Math.max(prev - cityItemsPerPage, 0)
                                    )
                                }
                            >
                                <i className="bi bi-arrow-left"></i> Previous
                            </button>
                            <button
                                className="btn btn-outline-dark"
                                disabled={
                                    cityStartIndex + cityItemsPerPage >=
                                    cities.length
                                }
                                onClick={() =>
                                    setCityStartIndex(
                                        (prev) => prev + cityItemsPerPage
                                    )
                                }
                            >
                                Next <i className="bi bi-arrow-right"></i>
                            </button>
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
                                    {/* Display Provinces */}
                                    {displayedProvinces.map(
                                        (province, index) => (
                                            <tr
                                                key={province.Code}
                                                style={{ height: "60px" }}
                                            >
                                                <td className="fw-bold">
                                                    {provinceStartIndex +
                                                        index +
                                                        1}
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
                                                        onClick={() => {
                                                            setItemToDelete({
                                                                endpoint:
                                                                    "provinces",
                                                                id: province.Code,
                                                            });
                                                            setShowDeleteModal(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        <i className="bi bi-trash"></i>{" "}
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )}

                                    {/* Fill empty rows to maintain table structure */}
                                    {displayedProvinces.length <
                                        provinceItemsPerPage &&
                                        [
                                            ...Array(
                                                provinceItemsPerPage -
                                                    displayedProvinces.length
                                            ),
                                        ].map((_, i) => (
                                            <tr
                                                key={`empty-province-${i}`}
                                                style={{ height: "60px" }}
                                            >
                                                <td colSpan={5}></td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Buttons */}
                        <div className="d-flex justify-content-between mt-3">
                            <button
                                className="btn btn-outline-dark"
                                disabled={provinceStartIndex === 0}
                                onClick={() =>
                                    setProvinceStartIndex((prev) =>
                                        Math.max(prev - provinceItemsPerPage, 0)
                                    )
                                }
                            >
                                <i className="bi bi-arrow-left"></i> Previous
                            </button>
                            <button
                                className="btn btn-outline-dark"
                                disabled={
                                    provinceStartIndex + provinceItemsPerPage >=
                                    provinces.length
                                }
                                onClick={() =>
                                    setProvinceStartIndex(
                                        (prev) => prev + provinceItemsPerPage
                                    )
                                }
                            >
                                Next <i className="bi bi-arrow-right"></i>
                            </button>
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
                                    {/* Display Countries */}
                                    {displayedCountries.map(
                                        (country, index) => (
                                            <tr
                                                key={country.Code}
                                                style={{ height: "60px" }}
                                            >
                                                <td className="fw-bold">
                                                    {countryStartIndex +
                                                        index +
                                                        1}
                                                </td>
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
                                                        onClick={() => {
                                                            setItemToDelete({
                                                                endpoint:
                                                                    "countries",
                                                                id: country.Code,
                                                            });
                                                            setShowDeleteModal(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        <i className="bi bi-trash"></i>{" "}
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )}

                                    {/* Fill empty rows to maintain table structure */}
                                    {displayedCountries.length <
                                        countryItemsPerPage &&
                                        [
                                            ...Array(
                                                countryItemsPerPage -
                                                    displayedCountries.length
                                            ),
                                        ].map((_, i) => (
                                            <tr
                                                key={`empty-country-${i}`}
                                                style={{ height: "60px" }}
                                            >
                                                <td colSpan={4}></td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Buttons */}
                        <div className="d-flex justify-content-between mt-3">
                            <button
                                className="btn btn-outline-dark"
                                disabled={countryStartIndex === 0}
                                onClick={() =>
                                    setCountryStartIndex((prev) =>
                                        Math.max(prev - countryItemsPerPage, 0)
                                    )
                                }
                            >
                                <i className="bi bi-arrow-left"></i> Previous
                            </button>
                            <button
                                className="btn btn-outline-dark"
                                disabled={
                                    countryStartIndex + countryItemsPerPage >=
                                    countries.length
                                }
                                onClick={() =>
                                    setCountryStartIndex(
                                        (prev) => prev + countryItemsPerPage
                                    )
                                }
                            >
                                Next <i className="bi bi-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
