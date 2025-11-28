import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

const Categories = () => {
  const { token } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const url = "https://spidexmarket.onrender.com/api/category";

  console.log(categories)

  // Fetch categories
  const fetchCategories = async () => {
    try {
      toast.info("Loading categories...");
      const res = await axios.get(`${url}/`);
      setCategories(res.data.categories);
      toast.dismiss();
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to load categories");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this category?")) return;

    try {
      toast.warning("Deleting category...");
      await axios.delete(`${url}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCategories();
      toast.success("Category deleted successfully");
    } 
    catch (err) {
      toast.dismiss();
      toast.error("Failed to delete category");
      console.error(err);
    }
  };

  // Edit category
  const handleEdit = (category) => {
    navigate("/admin-dashboard/categories/edit", { state: { category } });
  };

  return (
    <div className="container mt-2">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to={"/admin-dashboard"}>Dashboard</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Categories
          </li>
        </ol>
      </nav>

      {/* Card */}
      <div className="card shadow p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="text-success mb-0">
            <i className="bi bi-list-ul"></i> Categories List
          </h5>

          {/* Add button */}
          <button
            className="btn btn-success"
            onClick={() =>
              navigate("/admin-dashboard/categories/add")
            } >
            <i className="bi bi-plus-circle"></i> Add Category
          </button>
        </div>

        {/* Table */}
        <div className="table-responsive">
          {categories.length === 0 ? (
            <div className="alert alert-warning text-center mb-0">
              <h5>
                <i className="bi bi-patch-exclamation-fill"></i> No Categories
                Found
              </h5>
            </div>
          ) : (
            <table className="table table-striped table-hover table-bordered">
              <thead className="table-success">
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Subcategories</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((cat, index) => (
                  <tr key={cat._id}>
                    <td>{index + 1}</td>
                    <td style={{ width: "120px" }}>
                      {cat.photo ? (
                        <img
                          src={`https://spidexmarket.onrender.com/${cat.photo}`}
                          className="img-fluid rounded"
                          alt="category"/>):("No Image")}
                    </td>
                    <td className="fw-bold">{cat.name}</td>
                    <td>
                      {cat.subcategories?.length > 0
                        ? cat.subcategories.join(", "):"None"}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(cat)}>
                        <i className="bi bi-pen-fill"></i> Edit
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(cat._id)} >
                        <i className="bi bi-trash-fill"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
