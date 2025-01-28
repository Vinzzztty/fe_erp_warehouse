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

export default function EditSettingPricePage() {
    const { id } = useParams();
    const router = useRouter();

    const [formData, setFormData] = useState<{
        Date: Date | null;
        BPCode: string;
        Note: string;
    }>({
        Date: null,
        BPCode: "",
        Note: "",
    });
    const [buyingPrices, setBuyingPrices] = useState<
        { Code: number; Date: string; Note: string }[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettingPriceData = async () => {
            try {
                const { data: settingPrice } = await fetchData(
                    `/product_pricing/setting-prices/${id}`
                );
                const { data: buyingPrices } = await fetchData(
                    `/product_pricing/buying-prices`
                );

                setFormData({
                    Date: settingPrice.Date
                        ? new Date(settingPrice.Date)
                        : null,
                    BPCode: settingPrice.BPCode || "",
                    Note: settingPrice.Note || "",
                });
                setBuyingPrices(buyingPrices);
            } catch (error: any) {
                setError(error.message || "Failed to load setting price data.");
            }
        };

        fetchSettingPriceData();
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date: Date | null) => {
        setFormData((prev) => ({ ...prev, Date: date }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/product_pricing/setting-prices/${id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...formData,
                        Date: formData.Date
                            ? formData.Date.toISOString().split("T")[0]
                            : null,
                    }),
                }
            );
            if (!response.ok) {
                throw new Error("Failed to update setting price.");
            }
            router.push("/pricing");
        } catch (error: any) {
            setError(error.message || "Failed to update setting price.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Edit Setting Price</h1>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="Date" className="form-label">
                        Date
                    </label>
                    <input
                        type="date"
                        id="Date"
                        name="Date"
                        className="form-control"
                        value={
                            formData.Date
                                ? formData.Date.toISOString().split("T")[0]
                                : ""
                        }
                        onChange={(e) =>
                            handleDateChange(
                                e.target.value ? new Date(e.target.value) : null
                            )
                        }
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="BPCode" className="form-label">
                        Approved Buying Price
                    </label>
                    <select
                        id="BPCode"
                        name="BPCode"
                        className="form-select"
                        value={formData.BPCode}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>
                            Select an approved buying price
                        </option>
                        {buyingPrices.map((bp) => (
                            <option key={bp.Code} value={bp.Code}>
                                {`Code: ${bp.Code} | Date: ${bp.Date} | Note: ${bp.Note}`}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="Note" className="form-label">
                        Note
                    </label>
                    <textarea
                        id="Note"
                        name="Note"
                        className="form-control"
                        value={formData.Note}
                        onChange={handleChange}
                        rows={4}
                    />
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
