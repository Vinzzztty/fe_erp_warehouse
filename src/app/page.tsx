"use client";

import { useEffect, useState } from "react";

interface MasterData {
    bank: number;
    category: number;
    channel: number;
    city: number;
    company: number;
    cost: number;
    country: number;
    currency: number;
    forwarder: number;
    ppnSetting: number;
    product: number;
    province: number;
    store: number;
    supplier: number;
    uom: number;
    variant: number;
    warehouse: number;
}

interface TransactionData {
    purchaseOrder: number;
    proformaInvoice: number;
    piPayment: number;
    cxQuotation: number;
    cxInvoice: number;
    lastMile: number;
    goodsReceipt: number;
}

interface CardProps {
    title: string;
    description: string;
    total: number | string;
    iconClass: string;
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
    const [masters, setMasters] = useState<MasterData | null>(null);
    const [transactions, setTransactions] = useState<TransactionData | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null); // Reset error state

        const fetchAllData = async () => {
            const results = await Promise.allSettled([
                fetchData("/home/total-masters"),
                fetchData("/home/total-transactions"),
            ]);

            results.forEach((result, index) => {
                if (result.status === "fulfilled") {
                    if (index === 0) setMasters(result.value?.data || {});
                    if (index === 1) setTransactions(result.value?.data || {});
                } else {
                    setError((prev) =>
                        prev
                            ? prev + "\n" + result.reason.message
                            : result.reason.message
                    );
                }
            });

            setLoading(false);
        };

        fetchAllData();
    }, []);

    if (loading) {
        return <p className="text-center">Loading data...</p>;
    }

    if (error) {
        return <div className="alert alert-danger text-center">{error}</div>;
    }

    return (
        <div>
            <h1 className="text-center">Selamat Datang di ERP Importir</h1>
            <p className="text-center">
                Kelola inventaris dan pesanan Anda dengan lebih efisien!
            </p>

            <div className="container my-5">
                {/* Transactions Section */}
                <div className="text-center mb-4">
                    <hr className="my-3" />
                    <h1 className="fw-bold text-dark">
                        <i className="bi bi-cash me-2 text-secondary"></i>{" "}
                        Transactions
                    </h1>
                    <hr className="my-3" />
                </div>

                <div className="row">
                    <Card
                        title="Total Purchase Orders"
                        description="Jumlah pesanan pembelian yang dibuat."
                        total={transactions?.purchaseOrder ?? 0}
                        iconClass="bi bi-cart"
                    />
                    <Card
                        title="Total Proforma Invoices"
                        description="Jumlah faktur proforma yang diterbitkan."
                        total={transactions?.proformaInvoice ?? 0}
                        iconClass="bi bi-receipt"
                    />
                    <Card
                        title="Total PI Payments"
                        description="Jumlah pembayaran faktur proforma."
                        total={transactions?.piPayment ?? 0}
                        iconClass="bi bi-cash"
                    />
                </div>

                <div className="row mt-4">
                    <Card
                        title="Total Customer Quotations"
                        description="Jumlah penawaran harga kepada pelanggan."
                        total={transactions?.cxQuotation ?? 0}
                        iconClass="bi bi-clipboard"
                    />
                    <Card
                        title="Total Customer Invoices"
                        description="Jumlah faktur pelanggan yang dibuat."
                        total={transactions?.cxInvoice ?? 0}
                        iconClass="bi bi-file-earmark-text"
                    />
                    <Card
                        title="Total Last Mile Deliveries"
                        description="Jumlah pengiriman last-mile yang diproses."
                        total={transactions?.lastMile ?? 0}
                        iconClass="bi bi-truck-flatbed"
                    />
                </div>

                <div className="row mt-4">
                    <Card
                        title="Total Goods Receipts"
                        description="Jumlah barang yang telah diterima."
                        total={transactions?.goodsReceipt ?? 0}
                        iconClass="bi bi-box-seam"
                    />
                </div>
            </div>

            <div className="container my-5">
                {/* Master Data Section */}
                <div className="text-center mb-4">
                    <hr className="my-3" />
                    <h1 className="fw-bold text-dark">
                        <i className="bi bi-database me-2 text-secondary"></i>{" "}
                        Master Data
                    </h1>
                    <hr className="my-3" />
                </div>

                <div className="row">
                    <Card
                        title="Total Perusahaan"
                        description="Jumlah perusahaan terdaftar."
                        total={masters?.company ?? 0}
                        iconClass="bi bi-building"
                    />
                    <Card
                        title="Total Toko"
                        description="Jumlah toko yang terdaftar."
                        total={masters?.store ?? 0}
                        iconClass="bi bi-shop"
                    />
                    <Card
                        title="Total Supplier"
                        description="Jumlah pemasok yang terdaftar."
                        total={masters?.supplier ?? 0}
                        iconClass="bi bi-people"
                    />
                </div>

                <div className="row mt-4">
                    <Card
                        title="Total Forwarders"
                        description="Jumlah forwarder untuk pengiriman."
                        total={masters?.forwarder ?? 0}
                        iconClass="bi bi-truck"
                    />
                    <Card
                        title="Total Warehouses"
                        description="Jumlah gudang yang tersedia."
                        total={masters?.warehouse ?? 0}
                        iconClass="bi bi-box-seam"
                    />
                    <Card
                        title="Total Produk"
                        description="Jumlah produk dalam sistem."
                        total={masters?.product ?? 0}
                        iconClass="bi bi-box"
                    />
                </div>

                <div className="row mt-4">
                    <Card
                        title="Total Variants"
                        description="Jumlah varian produk yang tersedia."
                        total={masters?.variant ?? 0}
                        iconClass="bi bi-palette"
                    />
                    <Card
                        title="Total UOM"
                        description="Jumlah unit ukuran yang digunakan."
                        total={masters?.uom ?? 0}
                        iconClass="bi bi-rulers"
                    />
                    <Card
                        title="Total Banks"
                        description="Jumlah bank yang terdaftar."
                        total={masters?.bank ?? 0}
                        iconClass="bi bi-bank"
                    />
                </div>

                <div className="row mt-4">
                    <Card
                        title="Total Countries"
                        description="Jumlah negara dalam sistem."
                        total={masters?.country ?? 0}
                        iconClass="bi bi-globe"
                    />
                    <Card
                        title="Total Provinces"
                        description="Jumlah provinsi dalam sistem."
                        total={masters?.province ?? 0}
                        iconClass="bi bi-map"
                    />
                    <Card
                        title="Total Cities"
                        description="Jumlah kota dalam sistem."
                        total={masters?.city ?? 0}
                        iconClass="bi bi-geo-alt"
                    />
                </div>
            </div>
        </div>
    );
}
