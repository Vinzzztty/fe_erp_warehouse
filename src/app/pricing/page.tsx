"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductPricingPage() {
    const router = useRouter();

    const [buyingPricings, setBuyingPricings] = useState<any[]>([]);
    const [settingPricings, setSettingPricings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
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
                                                className="btn btn-danger btn-sm"
                                                onClick={() =>
                                                    handleDelete(
                                                        "buying-prices",
                                                        buyingPricing.Code
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
                                                className="btn btn-danger btn-sm"
                                                onClick={() =>
                                                    handleDelete(
                                                        "setting-prices",
                                                        settingPricing.Code
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
                </>
            )}
        </div>
    );
}
