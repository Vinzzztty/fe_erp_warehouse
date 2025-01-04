"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductPage() {
    const router = useRouter();

    // State for products
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [errorProducts, setErrorProducts] = useState<string | null>(null);

    // Fetch data function
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
            setProducts(data.data); // Assuming your API returns data in { data: [] } format
        } catch (error: any) {
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    // Delete product function
    const deleteProduct = async (productId: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/products/${productId}`,
                {
                    method: "DELETE",
                }
            );
            if (!response.ok) throw new Error("Failed to delete product.");
            alert("Product deleted successfully.");
            // Refresh the product list
            fetchData(
                "/master/products",
                setProducts,
                setLoadingProducts,
                setErrorProducts
            );
        } catch (error: any) {
            alert(error.message || "Failed to delete product.");
        }
    };

    // Fetch product data on mount
    useEffect(() => {
        fetchData(
            "/master/products",
            setProducts,
            setLoadingProducts,
            setErrorProducts
        );
    }, []);

    // Table fields
    const productFields = [
        { key: "Code", label: "Code" },
        { key: "Name", label: "Name" },
        { key: "SKUCode", label: "SKU Code" },
        { key: "Category.Name", label: "Category" },
        { key: "UnitOfMeasure.Name", label: "Unit of Measure" },
        { key: "ChannelInfo.Name", label: "Channel" },
        { key: "ImageURL", label: "Image" }, // Display image
        { key: "Status", label: "Status" },
        { key: "createdAt", label: "Created At" },
        { key: "updatedAt", label: "Updated At" },
    ];

    // Table renderer
    const renderTable = (
        data: any[],
        loading: boolean,
        error: string | null,
        fields: { key: string; label: string }[]
    ) => (
        <div className="mt-4 table-responsive">
            <h2 className="mb-3">Products</h2>
            {loading && (
                <div className="alert alert-info">Loading products...</div>
            )}
            {error && <div className="alert alert-danger">{error}</div>}
            {!loading && data.length > 0 && (
                <table className="table table-striped table-hover align-middle">
                    <thead className="table-dark">
                        <tr>
                            {fields.map((field, index) => (
                                <th key={index} scope="col">
                                    {field.label}
                                </th>
                            ))}
                            <th scope="col" className="text-center">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, idx) => (
                            <tr key={idx}>
                                {fields.map((field, index) => (
                                    <td key={index}>
                                        {field.key === "ImageURL" ? (
                                            item[field.key] ? (
                                                <img
                                                    src={item[field.key]}
                                                    alt="Product Image"
                                                    style={{
                                                        width: "50px",
                                                        height: "50px",
                                                        objectFit: "cover",
                                                    }}
                                                    onError={(e) => {
                                                        (
                                                            e.target as HTMLImageElement
                                                        ).src =
                                                            "/placeholder-image.png"; // Fallback for broken images
                                                    }}
                                                />
                                            ) : (
                                                "No Image"
                                            )
                                        ) : field.key.includes(".") ? (
                                            field.key
                                                .split(".")
                                                .reduce(
                                                    (acc, key) =>
                                                        acc && acc[key],
                                                    item
                                                ) || "N/A"
                                        ) : (
                                            item[field.key] ?? "N/A"
                                        )}
                                    </td>
                                ))}
                                <td className="text-center">
                                    <button
                                        className="btn btn-sm btn-warning me-2"
                                        onClick={() =>
                                            router.push(
                                                `/master/product/product/edit/${item.Code}`
                                            )
                                        }
                                    >
                                        <i className="bi bi-pencil-fill"></i>{" "}
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => deleteProduct(item.Code)}
                                    >
                                        <i className="bi bi-trash-fill"></i>{" "}
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {!loading && data.length === 0 && (
                <div className="alert alert-warning">No products found.</div>
            )}
        </div>
    );

    return (
        <div className="container mt-4">
            <h1>Product Management</h1>
            <p>Manage your product data here with an intuitive interface.</p>
            {renderTable(
                products,
                loadingProducts,
                errorProducts,
                productFields
            )}
        </div>
    );
}
