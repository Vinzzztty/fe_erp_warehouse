"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditCurrencyPage() {
  const { id } = useParams(); // Get currency ID from the route
  const router = useRouter();
  const [formData, setFormData] = useState({
    Code: "",
    Name: "",
    Notes: "",
    Status: "Active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrency = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/currencies/${id}`
        );
        if (!response.ok) throw new Error("Failed to fetch currency details.");
        const { data } = await response.json();
        setFormData({
          Code: data.Code || "",
          Name: data.Name || "",
          Notes: data.Notes || "",
          Status: data.Status || "Active",
        });
      } catch (error: any) {
        setError(error.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrency();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/currencies/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) {
        const errorData = await response.json(); // Extract response JSON
        let apiMessage =
          errorData?.status?.message || "Failed to Update Currency";

        // ✅ Customize error message if "already exists"
        if (apiMessage.includes("already exists")) {
          apiMessage = "The name is Duplicate";
        }

        throw new Error(apiMessage); // Throw error so it goes to catch block
      }
      router.push("/master/finance"); // Redirect after success
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      {/* Back Button */}
      <button
        className="btn btn-outline-dark mb-3"
        onClick={() => router.push("/master/finance")}
      >
        <i className="bi bi-arrow-left"></i> Back
      </button>
      <h1>Edit Currency</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="Code" className="form-label">
              Currency Code
            </label>
            <input
              type="text"
              id="Code"
              name="Code"
              className="form-control"
              value={formData.Code}
              onChange={handleChange}
              readOnly
            />
          </div>
          <div className="mb-3">
            <label htmlFor="Name" className="form-label">
              Currency Name <span style={{ color: "red" }}>*</span>
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

          <div className="mb-3">
            <label htmlFor="Notes" className="form-label">
              Notes
            </label>
            <textarea
              id="Notes"
              name="Notes"
              className="form-control"
              value={formData.Notes || ""}
              onChange={handleChange}
            ></textarea>
          </div>

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
            >
              <option value="Active">Active</option>
              <option value="Non-Active">Non-Active</option>
            </select>
          </div>

          <button type="submit" className="btn btn-dark" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}
    </div>
  );
}
