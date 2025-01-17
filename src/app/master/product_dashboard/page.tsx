"use client";

import Link from "next/link";
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
    // Add any other fields from your product model as needed
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
        <div className="container mt-4">
            <h1>Product Dashboard</h1>
            <p>View and manage your product-related settings here.</p>
            {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
            )}

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
            {/* CARDS END */}

            {/* Tablesss */}
            {loading ? (
                <p className="text-center mt-5">Loading data .. </p>
            ) : (
                <>
                    {/* Products Table */}
                    <h2>Products</h2>
                    <table className="table table-bordered mt-3">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>SKU Code</th>
                                <th>Category Code</th>
                                <th>Status</th>
                                <th>Actions</th>
                                <th>Detail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length > 0 ? (
                                products.map((product: any) => (
                                    <tr key={product.Code}>
                                        <td>{product.Code}</td>
                                        <td>{product.Name}</td>
                                        <td>{product.SKUCode}</td>
                                        <td>{product.CategoryCode}</td>
                                        <td>{product.Status}</td>
                                        <td>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() =>
                                                    router.push(
                                                        `/master/product/edit/${product.Code}`
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() =>
                                                    handleDelete(
                                                        "products",
                                                        product.Code
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-info btn-sm"
                                                onClick={() =>
                                                    setSelectedProduct(product)
                                                }
                                            >
                                                View Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4}>No Data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {/* Categories Table */}
                    {/* Channels Table */}
                    {/* UoMs Table */}
                    {/* Variants Table */}
                </>
            )}

            {/* Detail Modal */}
            {selectedProduct && (
                <div className="modal show" style={{ display: "block" }}>
                    <div className="modal-dialog">
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
                                    <strong>Category Code:</strong>{" "}
                                    {selectedProduct.CategoryCode}
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
                                    <strong>UoM:</strong> {selectedProduct.UoM}
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
                                <p>
                                    <strong>Image URL:</strong>{" "}
                                    <a
                                        href={selectedProduct.ImageURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {selectedProduct.ImageURL}
                                    </a>
                                </p>
                                {/* Add more fields as needed */}
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
