"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditChannelPage() {
    const router = useRouter();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        Name: "",
        Initial: "",
        Category: "Parent",
        Notes: "",
        Status: "Active",
    });
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchChannelDetails = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/channels/${id}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch channel details.");
                }
                const channel = await response.json();

                setFormData({
                    Name: channel.data.Name || "",
                    Initial: channel.data.Initial || "",
                    Category: channel.data.Category || "Parent",
                    Notes: channel.data.Notes || "",
                    Status: channel.data.Status || "Active",
                });
            } catch (error: any) {
                console.error("Error fetching channel details:", error);
                setErrorMessage(
                    error.message || "Failed to load channel details."
                );
            }
        };

        fetchChannelDetails();
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/channels/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (!response.ok) {
                const responseData = await response.json();
                throw new Error(
                    responseData.message || "Failed to update channel."
                );
            }

            router.push("/master/product_dashboard");
        } catch (error: any) {
            console.error("Error updating channel:", error);
            setErrorMessage(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h1>Edit Channel</h1>

            {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
            )}

            <form onSubmit={handleSubmit} className="mt-4">
                {/* Name */}
                <div className="mb-3">
                    <label htmlFor="Name" className="form-label">
                        Channel Name <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                        type="text"
                        id="Name"
                        name="Name"
                        className="form-control"
                        value={formData.Name}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Initial */}
                <div className="mb-3">
                    <label htmlFor="Initial" className="form-label">
                        Initial
                    </label>
                    <textarea
                        id="Initial"
                        name="Initial"
                        className="form-control"
                        value={formData.Initial}
                        onChange={handleChange}
                    ></textarea>
                </div>

                {/* Category */}
                <div className="mb-3">
                    <label htmlFor="Category" className="form-label">
                        Category <span style={{ color: "red" }}>*</span>
                    </label>
                    <select
                        id="Category"
                        name="Category"
                        className="form-select"
                        value={formData.Category}
                        onChange={handleChange}
                        required
                    >
                        <option value="Parent">Parent</option>
                        <option value="Child">Child</option>
                    </select>
                </div>

                {/* Notes */}
                <div className="mb-3">
                    <label htmlFor="Notes" className="form-label">
                        Notes
                    </label>
                    <textarea
                        id="Notes"
                        name="Notes"
                        className="form-control"
                        value={formData.Notes}
                        onChange={handleChange}
                    ></textarea>
                </div>

                {/* Status */}
                <div className="mb-3">
                    <label htmlFor="Status" className="form-label">
                        Status <span style={{ color: "red" }}>*</span>
                    </label>
                    <select
                        id="Status"
                        name="Status"
                        className="form-select"
                        value={formData.Status}
                        onChange={handleChange}
                        required
                    >
                        <option value="Active">Active</option>
                        <option value="Non-Active">Non-Active</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? "Updating..." : "Update Channel"}
                </button>
            </form>
        </div>
    );
}
