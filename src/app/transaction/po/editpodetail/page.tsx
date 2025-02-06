"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditProformaInvoiceDetail() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id"); // Get `id` from query parameters

    const [formData, setFormData] = useState({
        QTY: 0,
        CartonQty: 0,
    });

    const [loading, setLoading] = useState(true); // Tambahkan state untuk loading

    const fetchDetail = async () => {
        if (!id) return; // Ensure `id` is available
        try {
            setLoading(true); // Set loading saat fetch data

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/purchase-order-details/${id}`
            );
            if (!response.ok) throw new Error("Failed to fetch data.");

            const data = await response.json();
            console.log("Fetched Proforma Invoice Detail:", data.data);
            setFormData({
                QTY: data.data?.QTYApproved ?? 0, // Gunakan fallback jika undefined
                CartonQty: data.data?.CartonQty ?? 0,
            });
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false); // Matikan loading setelah fetch selesai
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/transaction/purchase-order-details/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to update proforma invoice detail."
                );
            }

            alert("Purchase Order Detail updated successfully.");
            router.push("/transaction/po"); // Redirect back to the proforma invoices list
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    if (loading) {
        return <p>Loading...</p>; // Tampilkan pesan loading sebelum data tersedia
    }

    return (
        <div className="container mt-4">
            <h1>Edit Purchase Order Detail</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="QTY" className="form-label">
                        QTY 
                    </label>
                    <input
                        type="number"
                        id="QTY"
                        name="QTY"
                        className="form-control"
                        value={formData.QTY ?? 0} // Pastikan nilai tidak undefined
                        onChange={(e) =>
                            setFormData({ ...formData, QTY: +e.target.value })
                        }
                        required
                    />
                </div>
               
                <div className="mb-3">
                    <label htmlFor="CartonQty" className="form-label">
                        Carton Quantity
                    </label>
                    <input
                        type="number"
                        id="CartonQty"
                        name="CartonQty"
                        className="form-control"
                        value={formData.CartonQty ?? 0} // Pastikan nilai tidak undefined
                        onChange={(e) =>
                            setFormData({ ...formData, CartonQty: +e.target.value })
                        }
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    Save Changes
                </button>
            </form>
        </div>
    );
}
