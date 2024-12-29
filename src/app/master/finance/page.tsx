"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function FinancePage() {
    const router = useRouter();

    // States for each entity
    const [banks, setBanks] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [ppnSettings, setPpnSettings] = useState([]);
    const [costs, setCosts] = useState([]);

    // Loading states
    const [loadingBanks, setLoadingBanks] = useState(false);
    const [loadingCurrencies, setLoadingCurrencies] = useState(false);
    const [loadingPpnSettings, setLoadingPpnSettings] = useState(false);
    const [loadingCosts, setLoadingCosts] = useState(false);

    // Error states
    const [errorBanks, setErrorBanks] = useState<string | null>(null);
    const [errorCurrencies, setErrorCurrencies] = useState<string | null>(null);
    const [errorPpnSettings, setErrorPpnSettings] = useState<string | null>(
        null
    );
    const [errorCosts, setErrorCosts] = useState<string | null>(null);

    // Fetch data
    const fetchData = async (
        endpoint: string,
        setState: any,
        setLoading: any,
        setError: any
    ) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`
            );
            if (!response.ok) throw new Error("Failed to fetch data.");
            const data = await response.json();
            setState(data.data);
        } catch (error: any) {
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    // Delete data
    const deleteItem = async (
        endpoint: string,
        id: any,
        updateState: () => void
    ) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}/${id}`,
                {
                    method: "DELETE",
                }
            );
            if (!response.ok) throw new Error("Failed to delete item.");
            updateState(); // Refresh data
        } catch (error) {
            alert(error.message || "Failed to delete item.");
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        fetchData("/master/banks", setBanks, setLoadingBanks, setErrorBanks);
        fetchData(
            "/master/currencies",
            setCurrencies,
            setLoadingCurrencies,
            setErrorCurrencies
        );
        fetchData(
            "/master/ppn-settings",
            setPpnSettings,
            setLoadingPpnSettings,
            setErrorPpnSettings
        );
        fetchData("/master/costs", setCosts, setLoadingCosts, setErrorCosts);
    }, []);

    // Reusable table renderer
    const renderTable = (
        data: any[],
        loading: boolean,
        error: string | null,
        entity: string,
        fields: { key: string; label: string }[],
        updateState: () => void
    ) => (
        <div className="mt-4">
            <h2>{entity}</h2>
            {loading && <p>Loading {entity.toLowerCase()}...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && data.length > 0 && (
                <table className="table table-bordered mt-3">
                    <thead>
                        <tr>
                            {fields.map((field, index) => (
                                <th key={index}>{field.label}</th>
                            ))}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, idx) => (
                            <tr key={idx}>
                                {fields.map((field, index) => (
                                    <td key={index}>
                                        {item[field.key] || "N/A"}
                                    </td>
                                ))}
                                <td>
                                    <button
                                        className="btn btn-warning btn-sm me-2"
                                        onClick={() => {
                                            const entityPath = entity
                                                .toLowerCase()
                                                .replace(/\s+/g, "-") // Convert spaces to dashes
                                                .replace(/_/g, "-"); // Ensure underscores are also replaced with dashes
                                            const itemId = item[fields[0].key]; // Retrieve the ID field dynamically
                                            router.push(
                                                `/master/finance/${entityPath}/edit/${itemId}`
                                            );
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() =>
                                            deleteItem(
                                                `/master/${entity.toLowerCase()}s`,
                                                item[fields[0].key],
                                                updateState
                                            )
                                        }
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );

    return (
        <div className="container mt-4">
            <h1>
                <i className="bi bi-cash-stack me-2"></i> Finance
            </h1>
            <p>View and manage your finance-related data here.</p>

            {/* Cards for Quick Navigation */}
            <div className="row mt-4">
                {[
                    {
                        title: "Bank",
                        icon: "bi-bank",
                        description: "Manage your bank details and accounts.",
                        link: "/master/finance/bank",
                    },
                    {
                        title: "Currency",
                        icon: "bi-currency-exchange",
                        description: "Manage currency and exchange rates.",
                        link: "/master/finance/currency",
                    },
                    {
                        title: "PPN Setting",
                        icon: "bi-file-text",
                        description: "Configure your PPN settings.",
                        link: "/master/finance/ppn-setting",
                    },
                    {
                        title: "Cost",
                        icon: "bi-wallet",
                        description: "Manage costs and financial records.",
                        link: "/master/finance/cost",
                    },
                ].map((card, idx) => (
                    <div className="col-md-3" key={idx}>
                        <div className="card text-center shadow-sm">
                            <div className="card-body">
                                <i
                                    className={`bi ${card.icon}`}
                                    style={{
                                        fontSize: "2rem",
                                        color: "#6c757d",
                                    }}
                                ></i>
                                <h5 className="card-title mt-3">
                                    {card.title}
                                </h5>
                                <p className="card-text">{card.description}</p>
                                <Link href={card.link}>
                                    <button className="btn btn-primary">
                                        Go to {card.title}
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tables */}
            {renderTable(
                banks,
                loadingBanks,
                errorBanks,
                "Bank",
                [
                    { key: "Code", label: "Code" },
                    { key: "Name", label: "Name" },
                    { key: "Notes", label: "Notes" },
                    { key: "Status", label: "Status" },
                ],
                () =>
                    fetchData(
                        "/master/banks",
                        setBanks,
                        setLoadingBanks,
                        setErrorBanks
                    )
            )}

            {renderTable(
                currencies,
                loadingCurrencies,
                errorCurrencies,
                "Currency",
                [
                    { key: "Code", label: "Code" },
                    { key: "Name", label: "Name" },
                    { key: "Notes", label: "Notes" },
                    { key: "Status", label: "Status" },
                ],
                () =>
                    fetchData(
                        "/master/currencies",
                        setCurrencies,
                        setLoadingCurrencies,
                        setErrorCurrencies
                    )
            )}

            {renderTable(
                ppnSettings,
                loadingPpnSettings,
                errorPpnSettings,
                "PPN-Setting",
                [
                    { key: "id", label: "id" },
                    { key: "Name", label: "Name" },
                    { key: "Rate", label: "Rate (%)" },
                    { key: "Status", label: "Status" },
                ],
                () =>
                    fetchData(
                        "/master/ppn-setting",
                        setPpnSettings,
                        setLoadingPpnSettings,
                        setErrorPpnSettings
                    )
            )}

            {renderTable(
                costs,
                loadingCosts,
                errorCosts,
                "Cost",
                [
                    { key: "Code", label: "Code" },
                    { key: "Name", label: "Name" },
                    { key: "Percentage", label: "Percentage" },
                    { key: "Note", label: "Note" },
                    { key: "Status", label: "Status" },
                ],
                () =>
                    fetchData(
                        "/master/costs",
                        setCosts,
                        setLoadingCosts,
                        setErrorCosts
                    )
            )}
        </div>
    );
}
