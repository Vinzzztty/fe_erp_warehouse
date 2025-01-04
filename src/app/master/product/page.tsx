"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardProductPage() {
    const router = useRouter();

    // State for each entity
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [channels, setChannels] = useState([]);
    const [uoms, setUoms] = useState([]);
    const [variants, setVariants] = useState([]);

    // Loading states
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingChannels, setLoadingChannels] = useState(false);
    const [loadingUoms, setLoadingUoms] = useState(false);
    const [loadingVariants, setLoadingVariants] = useState(false);

    // Error states
    const [errorProducts, setErrorProducts] = useState<string | null>(null);
    const [errorCategories, setErrorCategories] = useState<string | null>(null);
    const [errorChannels, setErrorChannels] = useState<string | null>(null);
    const [errorUoms, setErrorUoms] = useState<string | null>(null);
    const [errorVariants, setErrorVariants] = useState<string | null>(null);

    // Reusable fetch function
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

    // Fetch data on component mount
    useEffect(() => {
        fetchData(
            "/master/products",
            setProducts,
            setLoadingProducts,
            setErrorProducts
        );
        fetchData(
            "/master/categories",
            setCategories,
            setLoadingCategories,
            setErrorCategories
        );
        fetchData(
            "/master/channels",
            setChannels,
            setLoadingChannels,
            setErrorChannels
        );
        fetchData("/master/uoms", setUoms, setLoadingUoms, setErrorUoms);
        fetchData(
            "/master/variants",
            setVariants,
            setLoadingVariants,
            setErrorVariants
        );
    }, []);

    // Reusable delete function
    const deleteItem = async (
        endpoint: string,
        id: any,
        refreshData: () => void
    ) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}/${id}`,
                {
                    method: "DELETE",
                }
            );
            if (!response.ok) throw new Error("Failed to delete item.");
            refreshData(); // Refresh data
        } catch (error: any) {
            alert(error.message || "Failed to delete item.");
        }
    };

    // Reusable table renderer
    const renderTable = (
        data: any[],
        loading: boolean,
        error: string | null,
        entity: string,
        fields: { key: string; label: string }[],
        endpoint: string,
        refreshData: () => void
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
                                    {/* Edit Button */}
                                    <button
                                        className="btn btn-warning btn-sm me-2"
                                        onClick={() =>
                                            router.push(
                                                `/master/${entity.toLowerCase()}/edit/${
                                                    item.id
                                                }`
                                            )
                                        }
                                    >
                                        Edit
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() =>
                                            deleteItem(
                                                endpoint,
                                                item.id,
                                                refreshData
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
            <h1>Product Dashboard</h1>
            <p>View and manage your product-related settings here.</p>

            <div className="row mt-4">
                <div className="row mt-4">
                    {/* Product */}
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
                                <h5 className="card-title mt-3">Product</h5>
                                <p className="card-text">
                                    Manage your product details and inventory.
                                </p>
                                <Link href="/master/product/product">
                                    <button className="btn btn-primary">
                                        Go to Product
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Category */}
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
                                <h5 className="card-title mt-3">Category</h5>
                                <p className="card-text">
                                    Manage product categories and
                                    classification.
                                </p>
                                <Link href="/master/product/category">
                                    <button className="btn btn-primary">
                                        Go to Category
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Channel */}
                    <div className="col-md-4">
                        <div className="card text-center shadow-sm">
                            <div className="card-body">
                                <i
                                    className="bi bi-cart"
                                    style={{
                                        fontSize: "2rem",
                                        color: "#6c757d",
                                    }}
                                ></i>
                                <h5 className="card-title mt-3">Channel</h5>
                                <p className="card-text">
                                    Manage sales and distribution channels.
                                </p>
                                <Link href="/master/product/channel">
                                    <button className="btn btn-primary">
                                        Go to Channel
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* UOM */}
                    <div className="col-md-4 mt-4">
                        <div className="card text-center shadow-sm">
                            <div className="card-body">
                                <i
                                    className="bi bi-rulers"
                                    style={{
                                        fontSize: "2rem",
                                        color: "#6c757d",
                                    }}
                                ></i>
                                <h5 className="card-title mt-3">UOM</h5>
                                <p className="card-text">
                                    Manage units of measure for your products.
                                </p>
                                <Link href="/master/product/uom">
                                    <button className="btn btn-primary">
                                        Go to UOM
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Variant */}
                    <div className="col-md-4 mt-4">
                        <div className="card text-center shadow-sm">
                            <div className="card-body">
                                <i
                                    className="bi bi-palette"
                                    style={{
                                        fontSize: "2rem",
                                        color: "#6c757d",
                                    }}
                                ></i>
                                <h5 className="card-title mt-3">Variant</h5>
                                <p className="card-text">
                                    Manage product variants and options.
                                </p>
                                <Link href="/master/product/variant">
                                    <button className="btn btn-primary">
                                        Go to Variant
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tables */}
            {renderTable(
                products,
                loadingProducts,
                errorProducts,
                "Products",
                [
                    { key: "code", label: "Code" },
                    { key: "name", label: "Name" },
                    { key: "category", label: "Category" },
                    { key: "stock", label: "Stock" },
                    { key: "status", label: "Status" },
                ],
                "/master/products",
                () =>
                    fetchData(
                        "/master/products",
                        setProducts,
                        setLoadingProducts,
                        setErrorProducts
                    )
            )}

            {renderTable(
                categories,
                loadingCategories,
                errorCategories,
                "Categories",
                [
                    { key: "code", label: "Code" },
                    { key: "name", label: "Name" },
                    { key: "description", label: "Description" },
                    { key: "status", label: "Status" },
                ],
                "/master/categories",
                () =>
                    fetchData(
                        "/master/categories",
                        setCategories,
                        setLoadingCategories,
                        setErrorCategories
                    )
            )}

            {renderTable(
                channels,
                loadingChannels,
                errorChannels,
                "Channels",
                [
                    { key: "code", label: "Code" },
                    { key: "name", label: "Name" },
                    { key: "type", label: "Type" },
                    { key: "status", label: "Status" },
                ],
                "/master/channels",
                () =>
                    fetchData(
                        "/master/channels",
                        setChannels,
                        setLoadingChannels,
                        setErrorChannels
                    )
            )}

            {renderTable(
                uoms,
                loadingUoms,
                errorUoms,
                "UOMs",
                [
                    { key: "code", label: "Code" },
                    { key: "name", label: "Name" },
                    { key: "description", label: "Description" },
                    { key: "status", label: "Status" },
                ],
                "/master/uoms",
                () =>
                    fetchData(
                        "/master/uoms",
                        setUoms,
                        setLoadingUoms,
                        setErrorUoms
                    )
            )}

            {renderTable(
                variants,
                loadingVariants,
                errorVariants,
                "Variants",
                [
                    { key: "code", label: "Code" },
                    { key: "name", label: "Name" },
                    { key: "attributes", label: "Attributes" },
                    { key: "status", label: "Status" },
                ],
                "/master/variants",
                () =>
                    fetchData(
                        "/master/variants",
                        setVariants,
                        setLoadingVariants,
                        setErrorVariants
                    )
            )}
        </div>
    );
}
