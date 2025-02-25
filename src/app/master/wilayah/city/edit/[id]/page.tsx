"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

async function fetchData(endpoint: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${endpoint}`);
  }
  return response.json();
}

export default function EditCityPage() {
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    Name: "",
    ProvinceId: "",
    CountryId: "",
    Status: "Active",
  });
  const [provinces, setProvinces] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        const { data: city } = await fetchData(`/master/cities/${id}`);
        const { data: provinces } = await fetchData(`/master/provinces`);
        const { data: countries } = await fetchData(`/master/countries`);

        setFormData({
          Name: city.Name || "",
          ProvinceId: city.ProvinceId || "",
          CountryId: city.CountryId || "",
          Status: city.Status || "Active",
        });
        setProvinces(provinces);
        setCountries(countries);
      } catch (error: any) {
        setError(error.message || "Failed to load city data.");
      }
    };

    fetchCityData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/master/cities/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) {
        const errorData = await response.json(); // Extract response JSON
        let apiMessage = errorData?.status?.message || "Failed to Update city.";

        // ✅ Customize error message if "already exists"
        if (apiMessage.includes("already exists")) {
          apiMessage = "The name is Duplicate";
        }

        throw new Error(apiMessage); // Throw error so it goes to catch block
      }
      router.push("/master/wilayah");
    } catch (error: any) {
      setError(error.message || "Failed to update city.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      {/* Back Button */}
      <button
        className="btn btn-outline-dark mb-3"
        onClick={() => router.push("/master/wilayah")}
      >
        <i className="bi bi-arrow-left"></i> Back
      </button>
      <h1>Edit City</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="Name" className="form-label">
            City Name
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
          <label htmlFor="CountryId" className="form-label">
            Country
          </label>
          <select
            id="CountryId"
            name="CountryId"
            className="form-select"
            value={formData.CountryId}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select a country
            </option>
            {countries
              .filter((country: any) => country.Status === "Active")
              .map((country: any) => (
                <option key={country.Code} value={country.Code}>
                  {country.Name}
                </option>
              ))}
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="ProvinceId" className="form-label">
            Province
          </label>
          <select
            id="ProvinceId"
            name="ProvinceId"
            className="form-select"
            value={formData.ProvinceId}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select a province
            </option>
            {provinces
              .filter((province: any) => province.Status === "Active") // ✅ Show only active provinces
              .map((province: any) => (
                <option key={province.Code} value={province.Code}>
                  {province.Name}
                </option>
              ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="Status" className="form-label">
            Status
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
        <button type="submit" className="btn btn-dark" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
