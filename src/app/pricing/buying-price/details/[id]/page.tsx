"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

type BuyingPriceDetail = {
    Id: number;
    PICode: number;
    SKUFull: string;
    SKUParent: string;
    SKUCode: string;
    SKUCodeChild: string;
    Name: string;
    ProdCost: string;
    FirstMileCost: string;
    LastMileCost: string;
    DDPCost: string;
    TrueCost: string;
    SellingPrice: string;
};

export default function BuyingPriceDetailsPage() {
    const { id } = useParams(); // BuyingPriceId
    const router = useRouter();
    const [details, setDetails] = useState<BuyingPriceDetail[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBuyingPriceDetails = async () => {
            try {
                console.log("Fetching details for BuyingPriceId:", id);
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/product_pricing/buying-price-details/${id}`
                );

                if (!response.ok) {
                    console.error("Failed to fetch. Status:", response.status);
                    throw new Error("Failed to fetch buying price details.");
                }

                const { data } = await response.json();

                if (Array.isArray(data) && data.length === 0) {
                    setError("No details found. Please add new details.");
                } else {
                    setDetails(data);
                }
            } catch (error: any) {
                console.error("Error fetching buying price details:", error);
                setError(error.message || "An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchBuyingPriceDetails();
    }, [id]);

    if (loading) {
        return <div className="container mt-4">Loading...</div>;
    }

    return (
        <div className="container mt-4">
            <h1>Buying Price Details</h1>
            {error && <div className="alert alert-warning">{error}</div>}
            {details.length === 0 && (
                <div className="mt-3">
                    <button
                        className="btn btn-primary"
                        onClick={() =>
                            router.push(
                                `/pricing/buying-price/details/${id}/add-details`
                            )
                        }
                    >
                        Add New Details
                    </button>
                </div>
            )}
            {details.length > 0 && (
                <table className="table table-bordered mt-4">
                    <thead>
                        <tr>
                            <th>PI Code</th>
                            <th>SKU Full</th>
                            <th>SKU Parent</th>
                            <th>SKU Code</th>
                            <th>Prod Cost</th>
                            <th>First Mile Cost</th>
                            <th>Last Mile Cost</th>
                            <th>DDP Cost</th>
                            <th>True Cost</th>
                            <th>Selling Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {details.map((detail) => (
                            <tr key={detail.Id}>
                                <td>{detail.PICode}</td>
                                <td>{detail.SKUFull}</td>
                                <td>{detail.SKUParent}</td>
                                <td>{detail.SKUCode}</td>
                                <td>{detail.ProdCost}</td>
                                <td>{detail.FirstMileCost}</td>
                                <td>{detail.LastMileCost}</td>
                                <td>{detail.DDPCost}</td>
                                <td>{detail.TrueCost}</td>
                                <td>{detail.SellingPrice}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
