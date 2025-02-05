"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
interface Product {
    Code: number;
    Name: string;
    CodeName?: string;
    SKUCode?: string;
    CategoryCode?: number;
    Status: string;
    Content?: string;
    UoM?: string;
    Notes?: string;
    Length?: number;
    Width?: number;
    Height?: number;
    Weight?: number;
    Keyword?: string;
    ImageURL?: string;
    Category?: { Name: String };
}

export default function DashboardProductPage() {
    const router = useRouter();

    // State for each entity
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null
    );
    const [categories, setCategories] = useState([]);
    const [channels, setChannels] = useState([]);
    const [uoms, setUoms] = useState([]);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    productsRes,
                    categoriesRes,
                    channelsRes,
                    uomsRes,
                    variantsRes,
                ] = await Promise.all([
                    fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/products`
                    ),
                    fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/categories`
                    ),
                    fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/channels`
                    ),
                    fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/uoms`
                    ),
                    fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/variants`
                    ),
                ]);

                if (
                    !productsRes.ok ||
                    !categoriesRes.ok ||
                    !channelsRes.ok ||
                    !uomsRes.ok ||
                    !variantsRes.ok
                ) {
                    throw new Error("Faield to fetch data");
                }

                const [
                    productsData,
                    categoriesData,
                    channelsData,
                    uomsData,
                    variantsData,
                ] = await Promise.all([
                    productsRes.json(),
                    categoriesRes.json(),
                    channelsRes.json(),
                    uomsRes.json(),
                    variantsRes.json(),
                ]);

                setProducts(productsData?.data || []);
                setCategories(categoriesData?.data || []);
                setChannels(channelsData?.data || []);
                setUoms(uomsData?.data || []);
                setVariants(variantsData?.data || []);
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
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/${endpoint}/${id}`,
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
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/${endpoint}`
                );
                const data = await res.json();
                return data?.data || [];
            };

            if (endpoint === "products") setProducts(await fetchData());
            if (endpoint === "categories") setCategories(await fetchData());
            if (endpoint === "channels") setChannels(await fetchData());
            if (endpoint === "uoms") setUoms(await fetchData());
            if (endpoint === "variants") setVariants(await fetchData());
        } catch (error: any) {
            alert(error.message || "An unexpected error occurred.");
        }
    };

    return (
        <div className="container-fluid mt-4">
            <div className="text-center card shadow-lg p-4 rounded">
                <h1>Product Dashboard</h1>
                <p>View and manage your product-related settings here</p>
                {errorMessage && (
                    <div className="alert alert-danger">{errorMessage}</div>
                )}
            </div>

            {/* CARDS */}
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
                                        color: "#fffff",
                                    }}
                                ></i>
                                <h5 className="card-title mt-3">Product</h5>
                                <p className="card-text">
                                    Manage your product details and inventory.
                                </p>
                                <Link href="/master/product_dashboard/product">
                                    <button className="btn btn-dark">
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
                                        color: "#fffff",
                                    }}
                                ></i>
                                <h5 className="card-title mt-3">Category</h5>
                                <p className="card-text">
                                    Manage product categories and
                                    classification.
                                </p>
                                <Link href="/master/product_dashboard/category">
                                    <button className="btn btn-dark">
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
                                        color: "#fffff",
                                    }}
                                ></i>
                                <h5 className="card-title mt-3">Channel</h5>
                                <p className="card-text">
                                    Manage sales and distribution channels.
                                </p>
                                <Link href="/master/product_dashboard/channel">
                                    <button className="btn btn-dark">
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
                                        color: "#fffff",
                                    }}
                                ></i>
                                <h5 className="card-title mt-3">UOM</h5>
                                <p className="card-text">
                                    Manage units of measure for your products.
                                </p>
                                <Link href="/master/product_dashboard/uom">
                                    <button className="btn btn-dark">
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
                                        color: "#fffff",
                                    }}
                                ></i>
                                <h5 className="card-title mt-3">Variant</h5>
                                <p className="card-text">
                                    Manage product variants and options.
                                </p>
                                <Link href="/master/product_dashboard/variant">
                                    <button className="btn btn-dark">
                                        Go to Variant
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* CARDS END */}

            {/* Tablesss */}
            {loading ? (
                <p className="text-center mt-5">Loading data .. </p>
            ) : (
                <>
                    {/* Products Table */}
                    <div className="card shadow-lg p-4 rounded mt-4">
                        <p className="mb-4 fw-bold">Products</p>
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover align-middle text-center">
                                <thead className="table-dark">
                                    <tr>
                                        <th>No</th>
                                        <th>Name</th>
                                        <th>SKU Code</th>
                                        <th>Category Code</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length > 0 ? (
                                        products.map(
                                            (product: any, index: number) => (
                                                <tr key={product.Code}>
                                                    <td className="fw-bold">
                                                        {index + 1}
                                                    </td>
                                                    <td>{product.Name}</td>
                                                    <td>{product.SKUCode}</td>
                                                    <td>
                                                        {product.Category.Name}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                product.Status ===
                                                                "Active"
                                                                    ? "bg-success"
                                                                    : "bg-secondary"
                                                            }`}
                                                        >
                                                            {product.Status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-warning btn-sm me-2"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/master/product_dashboard/product/edit/${product.Code}`
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
                                                                    "products",
                                                                    product.Code
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-trash"></i>{" "}
                                                            Delete
                                                        </button>
                                                        <button
                                                            className="btn btn-info btn-sm"
                                                            onClick={() =>
                                                                setSelectedProduct(
                                                                    product
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-search"></i>{" "}
                                                            View Detail
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td colSpan={4}>
                                                No Data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Categories Table */}
                    <div className="card shadow-lg p-4 rounded mt-4">
                        <p className="mb-4 fw-bold">Categories</p>
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover align-middle text-center">
                                <thead className="table-dark">
                                    <tr>
                                        <th>No</th>
                                        <th>Name</th>
                                        <th>SKUCode</th>
                                        <th>Notes</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.length > 0 ? (
                                        categories.map(
                                            (category: any, index: number) => (
                                                <tr key={category.Code}>
                                                    <td className="fw-bold">
                                                        {index + 1}
                                                    </td>
                                                    <td>{category.Name}</td>
                                                    <td>{category.SKUCode}</td>
                                                    <td>
                                                        {category.Notes ||
                                                            "N/A"}{" "}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                category.Status ===
                                                                "Active"
                                                                    ? "bg-success"
                                                                    : "bg-secondary"
                                                            }`}
                                                        >
                                                            {category.Status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-warning btn-sm me-2"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/master/product_dashboard/category/edit/${category.Code}`
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-pencil-square"></i>{" "}
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    "categories",
                                                                    category.Code
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-trash"></i>{" "}
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td colSpan={6}>
                                                No Data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Channels Table */}
                    <div className="card shadow-lg p-4 rounded mt-4">
                        <p className="mb-4 fw-bold">Channels</p>
                        {errorMessage && (
                            <div className="alert alert-danger">
                                {errorMessage}
                            </div>
                        )}
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover align-middle text-center">
                                <thead className="table-dark">
                                    <tr>
                                        <th>No</th>
                                        <th>Name</th>
                                        <th>Initial</th>
                                        <th>Category</th>
                                        <th>Notes</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {channels.length > 0 ? (
                                        channels.map(
                                            (channel: any, index: number) => (
                                                <tr key={channel.Code}>
                                                    <td className="fw-bold">
                                                        {index + 1}
                                                    </td>
                                                    <td>{channel.Name}</td>
                                                    <td>{channel.Initial}</td>
                                                    <td>{channel.Category}</td>
                                                    <td>
                                                        {channel.Notes || "N/A"}{" "}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                channel.Status ===
                                                                "Active"
                                                                    ? "bg-success"
                                                                    : "bg-secondary"
                                                            }`}
                                                        >
                                                            {channel.Status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-warning btn-sm me-2"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/master/product_dashboard/channel/edit/${channel.Code}`
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-pencil-square"></i>{" "}
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    "channels",
                                                                    channel.Code
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-trash"></i>{" "}
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td colSpan={6}>
                                                No Data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* UoMs Table */}
                    <div className="card shadow-lg p-4 rounded mt-4">
                        <p className="mb-4 fw-bold">UoMS</p>
                        {errorMessage && (
                            <div className="alert alert-danger">
                                {errorMessage}
                            </div>
                        )}
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover align-middle text-center">
                                <thead className="table-dark">
                                    <tr>
                                        <th>No</th>
                                        <th>Name</th>
                                        <th>Notes</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {uoms.length > 0 ? (
                                        uoms.map((uom: any, index: number) => (
                                            <tr key={uom.Code}>
                                                <td className="fw-bold">
                                                    {index + 1}
                                                </td>
                                                <td>{uom.Name}</td>
                                                <td>{uom.Notes || "N/A"} </td>
                                                <td>
                                                    <span
                                                        className={`badge ${
                                                            uom.Status ===
                                                            "Active"
                                                                ? "bg-success"
                                                                : "bg-secondary"
                                                        }`}
                                                    >
                                                        {uom.Status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-warning btn-sm me-2"
                                                        onClick={() =>
                                                            router.push(
                                                                `/master/product_dashboard/uom/edit/${uom.Code}`
                                                            )
                                                        }
                                                    >
                                                        <i className="bi bi-pencil-square"></i>{" "}
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                "uoms",
                                                                uom.Code
                                                            )
                                                        }
                                                    >
                                                        <i className="bi bi-trash"></i>{" "}
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6}>
                                                No Data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Variants Table */}
                    <div className="card shadow-lg p-4 rounded mt-4">
                        <p className="mb-4 fw-bold">Variants</p>
                        {errorMessage && (
                            <div className="alert alert-danger">
                                {errorMessage}
                            </div>
                        )}

                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover align-middle text-center">
                                <thead className="table-dark">
                                    <tr>
                                        <th>No</th>
                                        <th>Name</th>
                                        <th>Notes</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {variants.length > 0 ? (
                                        variants.map(
                                            (variant: any, index: number) => (
                                                <tr key={variant.Code}>
                                                    <td className="fw-bold">
                                                        {index + 1}
                                                    </td>
                                                    <td>{variant.Name}</td>
                                                    <td>
                                                        {variant.Notes || "N/A"}{" "}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge ${
                                                                variant.Status ===
                                                                "Active"
                                                                    ? "bg-success"
                                                                    : "bg-secondary"
                                                            }`}
                                                        >
                                                            {variant.Status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-warning btn-sm me-2"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/master/product_dashboard/variant/edit/${variant.Code}`
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-pencil-square"></i>{" "}
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    "variants",
                                                                    variant.Code
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-trash"></i>{" "}
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td colSpan={6}>
                                                No Data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Detail Modal */}
            {selectedProduct && (
                <div
                    className="modal show"
                    style={{
                        display: "block",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                    }}
                >
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Product Details</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setSelectedProduct(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    {/* Product Image */}
                                    <div className="col-md-5">
                                        {selectedProduct.ImageURL ? (
                                            <div className="image-container">
                                                <Image
                                                    src={
                                                        selectedProduct.ImageURL
                                                    }
                                                    alt={selectedProduct.Name}
                                                    layout="responsive"
                                                    width={500}
                                                    height={500}
                                                    objectFit="contain"
                                                    priority // For faster LCP
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className="d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    backgroundColor: "#f5f5f5",
                                                    border: "1px solid #ddd",
                                                    borderRadius: "8px",
                                                }}
                                            >
                                                <p>No image available</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Details */}
                                    <div className="col-md-7">
                                        <p>
                                            <strong>Code:</strong>{" "}
                                            {selectedProduct.Code}
                                        </p>
                                        <p>
                                            <strong>Name:</strong>{" "}
                                            {selectedProduct.Name}
                                        </p>
                                        <p>
                                            <strong>CodeName:</strong>{" "}
                                            {selectedProduct.CodeName}
                                        </p>
                                        <p>
                                            <strong>SKU Code:</strong>{" "}
                                            {selectedProduct.SKUCode}
                                        </p>
                                        <p>
                                            <strong>Category:</strong>{" "}
                                            {selectedProduct.Category?.Name}
                                        </p>
                                        <p>
                                            <strong>Status:</strong>{" "}
                                            {selectedProduct.Status}
                                        </p>
                                        <p>
                                            <strong>Content:</strong>{" "}
                                            {selectedProduct.Content}
                                        </p>
                                        <p>
                                            <strong>UoM:</strong>{" "}
                                            {selectedProduct.UoM}
                                        </p>
                                        <p>
                                            <strong>Notes:</strong>{" "}
                                            {selectedProduct.Notes}
                                        </p>
                                        <p>
                                            <strong>Dimensions:</strong>{" "}
                                            {selectedProduct.Length} x{" "}
                                            {selectedProduct.Width} x{" "}
                                            {selectedProduct.Height}
                                        </p>
                                        <p>
                                            <strong>Weight:</strong>{" "}
                                            {selectedProduct.Weight}
                                        </p>
                                        <p>
                                            <strong>Keyword:</strong>{" "}
                                            {selectedProduct.Keyword}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedProduct(null)}
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
