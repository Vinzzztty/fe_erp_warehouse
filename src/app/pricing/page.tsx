"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface BuyingPrice {
    Code: string;
    Date: string;
    Warehouse: { Name: string };
    Note: string;
}

interface SettingPrice {
    Code: string;
    Date: string;
    BPCode: string;
    Note: string;
}

export default function ProductPricingPage() {
    const router = useRouter();

    const [buyingPricings, setBuyingPricings] = useState<BuyingPrice[]>([]);
    const [settingPricings, setSettingPricings] = useState<SettingPrice[]>([]);
    const [selectedBP, setSelectedBP] = useState<BuyingPrice | null>(null);
    const [selectedSP, setSelectedSP] = useState<SettingPrice | null>(null);
    const [details, setDetails] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [buyingPriceRes, settingPriceRes] = await Promise.all([
                    fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/product_pricing/buying-prices`
                    ),
                    fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/product_pricing/setting-prices`
                    ),
                ]);

                if (!buyingPriceRes.ok || !settingPriceRes.ok) {
                    throw new Error("Failed to fetch data.");
                }

                const [buyingPricingsData, settingPricingsData] =
                    await Promise.all([
                        buyingPriceRes.json(),
                        settingPriceRes.json(),
                    ]);

                setBuyingPricings(buyingPricingsData?.data || []);
                setSettingPricings(settingPricingsData?.data || []);
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

    const fetchDetails = async (endpoint: string, code: string) => {
        setDetailsLoading(true);
        setDetails(null);
        try {
            // Fetch the ID for SettingPriceDetil
            const idResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/product_pricing/${endpoint}/${code}`
            );

            if (!idResponse.ok) {
                throw new Error("Failed to fetch SettingPriceDetil ID.");
            }

            const { id } = await idResponse.json();

            // Use the fetched ID to get the actual details
            const detailsResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/product_pricing/details/${id}`
            );

            if (!detailsResponse.ok) {
                throw new Error("Failed to fetch details.");
            }

            const detailsData = await detailsResponse.json();
            setDetails(detailsData);
        } catch (error: any) {
            setDetails(null); // No details found or error
        } finally {
            setDetailsLoading(false);
        }
    };
    const handleViewDetails = async (
        endpoint: string,
        item: any,
        setSelected: any
    ) => {
        setSelected(item);
        await fetchDetails(endpoint, item.Code);
    };
    // Delete an item
    const handleDelete = async (endpoint: string, id: number) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/product_pricing/${endpoint}/${id}`,
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
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/product_pricing/${endpoint}`
                );
                const data = await res.json();
                return data?.data || [];
            };

            if (endpoint === "buying-prices")
                setBuyingPricings(await fetchData());
            if (endpoint === "setting-prices")
                setSettingPricings(await fetchData());
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    return (
        <div className="container mt-4">
            <h1>Product Pricing</h1>
            <p>Dapat mengatur Harga Product</p>
            {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
            )}

            {/* CARDS */}
            <div className="row mt-4">
                <div className="row mt-4">
                    {/* Buying Price */}
                    <div className="col-md-4">
                        <div className="card text-center shadow-sm">
                            <div className="card-body">
                                <i
                                    className="bi bi-box-seam"
                                    style={{
                                        fontSize: "2rem",
                                        color: "#6c757d",
                                    }}
                                ></i>
                                <h5 className="card-title mt-3">
                                    Buying Price
                                </h5>
                                <p className="card-text">
                                    Mengatur Harga Pembelian
                                </p>
                                <Link href="/pricing/buying-price">
                                    <button className="btn btn-primary">
                                        Go to Buying Price
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Setting Price */}
                    <div className="col-md-4">
                        <div className="card text-center shadow-sm">
                            <div className="card-body">
                                <i
                                    className="bi bi-tags"
                                    style={{
                                        fontSize: "2rem",
                                        color: "#6c757d",
                                    }}
                                ></i>
                                <h5 className="card-title mt-3">
                                    Setting Price
                                </h5>
                                <p className="card-text">Mengatur Harga</p>
                                <Link href="/pricing/setting-price">
                                    <button className="btn btn-primary">
                                        Go to Setting Price
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Tables */}
            {loading ? (
                <p className="text-center mt-5">Loading data...</p>
            ) : (
                <>
                    {/* Buying Pricing Table */}
                    <h2>Buying Pricing</h2>
                    <table className="table table-bordered mt-3">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Date</th>
                                <th>Warehouse</th>
                                <th>Note</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {buyingPricings.length > 0 ? (
                                buyingPricings.map((buyingPricing: any) => (
                                    <tr key={buyingPricing.Code}>
                                        <td>{buyingPricing.Code}</td>
                                        <td>{buyingPricing.Date}</td>
                                        <td>{buyingPricing.Warehouse.Name}</td>
                                        <td>{buyingPricing.Note}</td>
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() =>
                                                    router.push(
                                                        `/pricing/buying-price/edit/${buyingPricing.Code}`
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm me-2"
                                                onClick={() =>
                                                    handleDelete(
                                                        "buying-prices",
                                                        buyingPricing.Code
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                            {buyingPricing.Details ? (
                                                <button
                                                    className="btn btn-info btn-sm"
                                                    onClick={() =>
                                                        setSelectedBP(
                                                            buyingPricing
                                                        )
                                                    }
                                                >
                                                    View Details
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() =>
                                                        router.push(
                                                            `/pricing/buying-price/add-details/${buyingPricing.Code}`
                                                        )
                                                    }
                                                >
                                                    Add Details
                                                </button>
                                            )}
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

                    {/* Setting Pricing Table */}
                    <h2>Setting Pricing</h2>
                    <table className="table table-bordered mt-3">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Date</th>
                                <th>Buying Price Code</th>
                                <th>Note</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {settingPricings.length > 0 ? (
                                settingPricings.map((settingPricing: any) => (
                                    <tr key={settingPricing.Code}>
                                        <td>{settingPricing.Code}</td>
                                        <td>{settingPricing.Date}</td>
                                        <td>{settingPricing.BPCode}</td>
                                        <td>{settingPricing.Note}</td>
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() =>
                                                    router.push(
                                                        `/pricing/setting-price/edit/${settingPricing.Code}`
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm me-2"
                                                onClick={() =>
                                                    handleDelete(
                                                        "setting-prices",
                                                        settingPricing.Code
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                            <button
                                                className="btn btn-info btn-sm"
                                                onClick={() =>
                                                    handleViewDetails(
                                                        "setting-price-details",
                                                        settingPricing,
                                                        setSelectedSP
                                                    )
                                                }
                                            >
                                                View Details
                                            </button>

                                            {settingPricing.Details ? (
                                                <button
                                                    className="btn btn-info btn-sm"
                                                    onClick={() =>
                                                        setSelectedSP(
                                                            settingPricing
                                                        )
                                                    }
                                                >
                                                    View Details
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() =>
                                                        router.push(
                                                            `/pricing/setting-price/add-details/${settingPricing.Code}`
                                                        )
                                                    }
                                                >
                                                    Add Details
                                                </button>
                                            )}
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
                </>
            )}

            {/* Modal for Viewing Details */}
            {(selectedBP || selectedSP) && (
                <div
                    className="modal show"
                    style={{
                        display: "block",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                    }}
                >
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {selectedBP
                                        ? "Buying Price Details"
                                        : "Setting Price Details"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setSelectedBP(null);
                                        setSelectedSP(null);
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {detailsLoading ? (
                                    <p>Loading details...</p>
                                ) : details ? (
                                    <>
                                        <p>
                                            <strong>Code:</strong>{" "}
                                            {details.Code}
                                        </p>
                                        <p>
                                            <strong>Date:</strong>{" "}
                                            {details.Date}
                                        </p>
                                        {details.WarehouseName && (
                                            <p>
                                                <strong>Warehouse:</strong>{" "}
                                                {details.WarehouseName}
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <div>
                                        <p>No details found.</p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() =>
                                                router.push(
                                                    `/pricing/${
                                                        selectedBP
                                                            ? "buying-price"
                                                            : "setting-price"
                                                    }/add-details/${
                                                        selectedBP
                                                            ? selectedBP.Code
                                                            : selectedSP?.Code
                                                    }`
                                                )
                                            }
                                        >
                                            Add Details
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setSelectedBP(null);
                                        setSelectedSP(null);
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Detail Buying Price Modal */}
            {/* {selectedBP && (
                <div
                    className="modal show"
                    style={{
                        display: "block",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                    }}
                >
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Buying Price Details
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setSelectedBP(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    <strong>Code:</strong> {selectedBP.Code}
                                </p>
                                <p>
                                    <strong>Date:</strong> {selectedBP.Date}
                                </p>
                                <p>
                                    <strong>Warehouse:</strong>{" "}
                                    {selectedBP.Warehouse.Name}
                                </p>
                                <p>
                                    <strong>Note:</strong> {selectedBP.Note}
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedBP(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )} */}

            {/* Modal for Viewing Setting Price Details */}
            {/* {selectedSP && (
                <div
                    className="modal show"
                    style={{
                        display: "block",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                    }}
                >
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Setting Price Details
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setSelectedSP(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {detailsLoading ? (
                                    <p>Loading details...</p>
                                ) : details ? (
                                    <>
                                        <p>
                                            <strong>Code:</strong>{" "}
                                            {details.Code}
                                        </p>
                                        <p>
                                            <strong>Date:</strong>{" "}
                                            {details.Date}
                                        </p>
                                        <p>
                                            <strong>Buying Price Code:</strong>{" "}
                                            {details.BPCode}
                                        </p>
                                    </>
                                ) : (
                                    <div>
                                        <p>No details found.</p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() =>
                                                router.push(
                                                    `/pricing/setting-price/add-details/${selectedSP.Code}`
                                                )
                                            }
                                        >
                                            Add Details
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )} */}
        </div>
    );
}
