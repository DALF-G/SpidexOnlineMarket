import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const Categories = () => {
  const { token } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [subcategories, setSubcategories] = useState("");
  const [photo, setPhoto] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const url = "https://spidexmarket.onrender.com/api/category";

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${url}/`);
      setCategories(res.data.categories);
      setLoading(false);
    } 
    catch (err) {
      console.error("Fetch Error:", err);
      setLoading(false);
    }
  };

  // Handle create category
  const handleCreateCategory = async (e) => {
    e.preventDefault();

    if (!name) {
      setMessage("Category name is required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);

    if (subcategories.trim()) {
      formData.append("subcategories", subcategories); // comma-separated
    }

    if (photo) formData.append("photo", photo);

    try {
      const res = await axios.post(`${url}/add`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(res.data.message);
      setName("");
      setSubcategories("");
      setPhoto(null);
      fetchCategories();
    } catch (err) {
      console.error("Create Error:", err.response || err);
      setMessage(err.response?.data?.message || "Error creating category");
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await axios.delete(`${url}/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchCategories();
      alert("Category deleted successfully");
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Failed to delete category");
    }
  };

    useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="container mt-4 mb-5">

      <h3 className="text-warning">Manage Categories</h3>
      <hr />

      {message && <div className="alert alert-info">{message}</div>}

      {/* CREATE CATEGORY FORM */}
      <form
        onSubmit={handleCreateCategory}
        className="card shadow p-4 mb-4 border-0 rounded"
      >
        <h5 className="text-success mb-3">Add New Category</h5>

        <input
          type="text"
          placeholder="Category Name"
          className="form-control mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Enter subcategories separated by commas"
          className="form-control mb-3"
          value={subcategories}
          onChange={(e) => setSubcategories(e.target.value)}
        />

        <input
          type="file"
          className="form-control mb-3"
          onChange={(e) => setPhoto(e.target.files[0])}
        />

        <button className="btn btn-warning fw-bold" type="submit">
          Add Category
        </button>
      </form>

      {/* CATEGORY LIST */}
      <h4 className="text-success">All Categories</h4>
      <hr />

      {loading ? (
        <p>Loading categories...</p>
      ) : categories.length === 0 ? (
        <div className="alert alert-info">No categories found.</div>
      ) : (
        <table className="table table-bordered table-striped">
          <thead className="table-warning">
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Subcategories</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id}>
                <td style={{ width: "120px" }}>
                  {cat.photo ? (
                    <img
                      src={`https://spidexmarket.onrender.com/${cat.photo}`}
                      alt="category"
                      className="img-fluid rounded"
                    />
                  ) : (
                    <span className="text-muted">No Image</span>
                  )}
                </td>

                <td className="fw-bold">{cat.name}</td>

                <td>
                  {cat.subcategories?.length > 0 ? (
                    cat.subcategories.join(", ")
                  ) : (
                    <span className="text-muted">None</span>
                  )}
                </td>

                <td className="text-center">
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteCategory(cat._id)}
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
};

export default Categories
