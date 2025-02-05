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

    const handleViewDetails = async (
        endpoint: "setting-price" | "buying-price",
        item: any,
        setSelected: (item: any) => void
    ) => {
        setSelected(item); // Set the selected item for the modal
        setDetailsLoading(true); // Show loading while fetching
        setDetails(null); // Reset details

        try {
            // Determine the appropriate API endpoint based on the type
            const url =
                endpoint === "setting-price"
                    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/product_pricing/setting-price-details/setting-price/${item.Code}`
                    : `${process.env.NEXT_PUBLIC_API_BASE_URL}/product_pricing/buying-price-details/buying-price/${item.Code}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Failed to fetch details.");
            }

            const responseData = await response.json();

            // Extract the `data` field
            const detailsData = responseData.data;
            setDetails(detailsData); // Set the fetched details in the state
        } catch (error: any) {
            console.error(error.message || "An unexpected error occurred.");
            setDetails(null); // No details found or error
        } finally {
            setDetailsLoading(false); // Stop loading indicator
        }
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
        <div className="container-fluid mt-4">
            <div className="text-center card shadow-lg p-4 rounded">
                <h1>
                    <i className="bi bi-box me-2"></i> Product Pricing
                </h1>
                <p>Dapat mengatur Harga Product</p>
            </div>

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
                                    <button className="btn btn-dark">
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
                                    <button className="btn btn-dark">
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
                    <div className="card shadow-lg p-4 rounded mt-4">
                        <p className="mb-4 fw-bold">Buying Pricing</p>
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover align-middle text-center">
                                <thead className="table-dark">
                                    <tr>
                                        <th>No</th>
                                        <th>Date</th>
                                        <th>Warehouse</th>
                                        <th>Note</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {buyingPricings.length > 0 ? (
                                        buyingPricings.map(
                                            (
                                                buyingPricing: any,
                                                index: number
                                            ) => (
                                                <tr key={buyingPricing.Code}>
                                                    <td className="fw-bold">
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        {buyingPricing.Date}
                                                    </td>
                                                    <td>
                                                        {
                                                            buyingPricing
                                                                .Warehouse.Name
                                                        }
                                                    </td>
                                                    <td>
                                                        {buyingPricing.Note ||
                                                            "N/A"}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-warning btn-sm me-2"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/pricing/buying-price/edit/${buyingPricing.Code}`
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-pencil-square"></i>{" "}
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
                                                            <i className="bi bi-trash"></i>{" "}
                                                            Delete
                                                        </button>
                                                        <button
                                                            className="btn btn-info btn-sm"
                                                            onClick={() =>
                                                                handleViewDetails(
                                                                    "buying-price",
                                                                    buyingPricing,
                                                                    setSelectedBP
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-search"></i>{" "}
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        )
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

                    {/* Setting Pricing Table */}
                    <div className="card shadow-lg p-4 rounded mt-4">
                        <p className="mb-4 fw-bold">Setting Pricing</p>
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover align-middle text-center">
                                <thead className="table-dark">
                                    <tr>
                                        <th>No</th>
                                        <th>Date</th>
                                        <th>Buying Price Code</th>
                                        <th>Note</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {settingPricings.length > 0 ? (
                                        settingPricings.map(
                                            (
                                                settingPricing: any,
                                                index: number
                                            ) => (
                                                <tr key={settingPricing.Code}>
                                                    <td className="fw-bold">
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        {settingPricing.Date}
                                                    </td>
                                                    <td>
                                                        {
                                                            settingPricing
                                                                .BuyingPrice
                                                                .Code
                                                        }
                                                    </td>
                                                    <td>
                                                        {settingPricing.Note}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-warning btn-sm me-2"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/pricing/setting-price/edit/${settingPricing.Code}`
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-pencil-square"></i>{" "}
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
                                                            <i className="bi bi-trash"></i>{" "}
                                                            Delete
                                                        </button>
                                                        <button
                                                            className="btn btn-info btn-sm"
                                                            onClick={() =>
                                                                handleViewDetails(
                                                                    "setting-price",
                                                                    settingPricing,
                                                                    setSelectedSP
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-search"></i>{" "}
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        )
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

            {/* Modal for Viewing Details */}
            {(selectedBP || selectedSP) && (
                <div
                    className="modal show d-flex align-items-center justify-content-center"
                    style={{
                        display: "block",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                    }}
                >
                    <div className="modal-dialog modal-xl">
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
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped align-middle text-center">
                                            <thead className="table-dark">
                                                <tr>
                                                    {selectedSP ? (
                                                        <>
                                                            <th>SKU Full</th>
                                                            <th>SKU Parent</th>
                                                            <th>SKU Code</th>
                                                            <th>
                                                                SKU Code Child
                                                            </th>
                                                            <th>
                                                                Product Name
                                                            </th>
                                                            <th>
                                                                Selling Price
                                                            </th>
                                                            <th>
                                                                Normal Price
                                                            </th>
                                                            <th>
                                                                Strikethrough
                                                                Price
                                                            </th>
                                                            <th>
                                                                Campaign Price
                                                            </th>
                                                            <th>
                                                                Bottom Price
                                                            </th>
                                                            <th>Note</th>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <th>
                                                                Buying Price
                                                                Code
                                                            </th>
                                                            <th>
                                                                Proforma Invoice
                                                            </th>
                                                            <th>Cost</th>
                                                            <th>Note</th>
                                                        </>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    {selectedSP ? (
                                                        <>
                                                            <td>
                                                                {details.SKUFull ||
                                                                    "N/A"}
                                                            </td>
                                                            <td>
                                                                {details.SKUParent ||
                                                                    "N/A"}
                                                            </td>
                                                            <td>
                                                                {details.SKUCode ||
                                                                    "N/A"}
                                                            </td>
                                                            <td>
                                                                {details.SKUCodeChild ||
                                                                    "N/A"}
                                                            </td>
                                                            <td>
                                                                {details.ProductName ||
                                                                    "N/A"}
                                                            </td>
                                                            <td>
                                                                {details.SellingPrice ||
                                                                    "N/A"}
                                                            </td>
                                                            <td>
                                                                {details.NormalPrice ||
                                                                    "N/A"}
                                                            </td>
                                                            <td>
                                                                {details.StrikethroughPrice ||
                                                                    "N/A"}
                                                            </td>
                                                            <td>
                                                                {details.CampaignPrice ||
                                                                    "N/A"}
                                                            </td>
                                                            <td>
                                                                {details.BottomPrice ||
                                                                    "N/A"}
                                                            </td>
                                                            <td>
                                                                {details
                                                                    .SettingPrice
                                                                    ?.Note ||
                                                                    "N/A"}
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td>
                                                                {details
                                                                    .BuyingPrice
                                                                    ?.Code ||
                                                                    "N/A"}
                                                            </td>
                                                            <td>
                                                                {details
                                                                    .ProformaInvoice
                                                                    ?.number ||
                                                                    "N/A"}
                                                            </td>
                                                            <td>
                                                                {details.Cost
                                                                    ? `$${details.Cost.amount}`
                                                                    : "N/A"}
                                                            </td>
                                                            <td>
                                                                {details
                                                                    .BuyingPrice
                                                                    ?.Note ||
                                                                    "N/A"}
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div>
                                        <p>
                                            No details found or failed to fetch
                                            details.
                                        </p>
                                        <button
                                            className="btn btn-dark"
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
        </div>
    );
}
