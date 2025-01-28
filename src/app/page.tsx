"use client";

import { useEffect, useState } from "react";

interface CardProps {
    title: string;
    description: string;
    total: number | string;
    iconClass: string; // e.g., "bi bi-building"
}

const Card: React.FC<CardProps> = ({
    title,
    description,
    total,
    iconClass,
}) => {
    return (
        <div className="col-md-4">
            <div className="card text-center shadow-sm">
                <div className="card-body">
                    <i
                        className={iconClass}
                        style={{ fontSize: "2rem", color: "#6c757d" }}
                    ></i>
                    <h5 className="card-title mt-3">{title}</h5>
                    <p className="card-text">{description}</p>
                    <h2>{total}</h2>
                </div>
            </div>
        </div>
    );
};

async function fetchData(endpoint: string) {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`
    );
    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${endpoint}`);
    }
    return response.json();
}

export default function Home() {
    const [totals, setTotals] = useState({
        companies: 0,
        stores: 0,
        suppliers: 0,
        forwarders: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTotals = async () => {
            try {
                const [
                    companiesData,
                    storesData,
                    suppliersData,
                    forwardersData,
                ] = await Promise.all([
                    fetchData("/master/companies"),
                    fetchData("/master/stores"),
                    fetchData("/master/suppliers"),
                    fetchData("/master/forwarders"),
                ]);

                setTotals({
                    companies: companiesData?.data?.length || 0,
                    stores: storesData?.data?.length || 0,
                    suppliers: suppliersData?.data?.length || 0,
                    forwarders: forwardersData?.data?.length || 0,
                });
            } catch (error: any) {
                setError(error.message || "Failed to fetch totals.");
            } finally {
                setLoading(false);
            }
        };

        fetchTotals();
    }, []);

    if (loading) {
        return <p className="text-center">Loading data...</p>;
    }

    if (error) {
        return <div className="alert alert-danger text-center">{error}</div>;
    }

    return (
        <div>
            <h1 className="text-center">Selamat Datang di ERP Warehouse!</h1>
            <p className="text-center">
                Kelola inventaris dan pesanan Anda dengan lebih efisien!
            </p>

            <div className="container my-5">
                {/* Product Section Heading */}
                <div className="text-center mb-4">
                    <hr className="my-3" />
                    <h1 className="fw-bold text-dark">
                        <i className="bi bi-building me-2 text-secondary"></i>
                        Business
                    </h1>
                    <hr className="my-3" />
                </div>

                {/* Product Cards */}
                <div className="row">
                    <Card
                        title="Total Perusahaan"
                        description="Kelola informasi perusahaan Anda."
                        total={totals.companies}
                        iconClass="bi bi-building"
                    />
                    <Card
                        title="Total Toko"
                        description="Kelola lokasi dan informasi toko Anda."
                        total={totals.stores}
                        iconClass="bi bi-shop"
                    />
                    <Card
                        title="Total Supplier"
                        description="Kelola informasi dan detail supplier."
                        total={totals.suppliers}
                        iconClass="bi bi-people"
                    />
                </div>

                <div className="row mt-4">
                    <Card
                        title="Total Forwarder"
                        description="Kelola forwarder untuk pengiriman barang."
                        total={totals.forwarders}
                        iconClass="bi bi-truck"
                    />
                </div>
            </div>

            <div className="container my-5">
                {/* Finance Section Heading */}
                <div className="text-center mb-4">
                    <hr className="my-3" />
                    <h1 className="fw-bold text-dark">
                        <i className="bi bi-building me-2 text-secondary"></i>
                        Business
                    </h1>
                    <hr className="my-3" />
                </div>

                {/* Finance Cards */}
                <div className="row">
                    <Card
                        title="Total Perusahaan"
                        description="Kelola informasi perusahaan Anda."
                        total={totals.companies}
                        iconClass="bi bi-building"
                    />
                    <Card
                        title="Total Toko"
                        description="Kelola lokasi dan informasi toko Anda."
                        total={totals.stores}
                        iconClass="bi bi-shop"
                    />
                    <Card
                        title="Total Supplier"
                        description="Kelola informasi dan detail supplier."
                        total={totals.suppliers}
                        iconClass="bi bi-people"
                    />
                </div>

                <div className="row mt-4">
                    <Card
                        title="Total Forwarder"
                        description="Kelola forwarder untuk pengiriman barang."
                        total={totals.forwarders}
                        iconClass="bi bi-truck"
                    />
                </div>
            </div>

            <div className="container my-5">
                {/* Business Section Heading */}
                <div className="text-center mb-4">
                    <hr className="my-3" />
                    <h1 className="fw-bold text-dark">
                        <i className="bi bi-building me-2 text-secondary"></i>
                        Business
                    </h1>
                    <hr className="my-3" />
                </div>

                {/* Business Cards */}
                <div className="row">
                    <Card
                        title="Total Perusahaan"
                        description="Kelola informasi perusahaan Anda."
                        total={totals.companies}
                        iconClass="bi bi-building"
                    />
                    <Card
                        title="Total Toko"
                        description="Kelola lokasi dan informasi toko Anda."
                        total={totals.stores}
                        iconClass="bi bi-shop"
                    />
                    <Card
                        title="Total Supplier"
                        description="Kelola informasi dan detail supplier."
                        total={totals.suppliers}
                        iconClass="bi bi-people"
                    />
                </div>

                <div className="row mt-4">
                    <Card
                        title="Total Forwarder"
                        description="Kelola forwarder untuk pengiriman barang."
                        total={totals.forwarders}
                        iconClass="bi bi-truck"
                    />
                </div>
            </div>
        </div>
    );
}
