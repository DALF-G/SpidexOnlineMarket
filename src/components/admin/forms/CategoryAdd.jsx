import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";

const CategoryAdd = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [subcategories, setSubcategories] = useState("");
  const [photo, setPhoto] = useState(null);

  const url = "https://spidexmarket.onrender.com/api/category/add";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      toast.info("Creating category...");

      const formData = new FormData();
      formData.append("name", name);
      if (subcategories) formData.append("subcategories", subcategories);
      if (photo) formData.append("photo", photo);

      await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.dismiss();
      toast.success("Category created!");

      setTimeout(() => {
        navigate("/admin-dashboard/categories");
      }, 1500);
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to create category");
      console.error(err);
    }
  };

  return (
    <div className="container mt-2">
      <ToastContainer position="top-right" autoClose={3000} />

      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to={"/admin-dashboard/categories"}>Categories</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Add Category
          </li>
        </ol>
      </nav>

      <div className="card shadow p-4">
        <h5 className="text-success mb-3">
          <i className="bi bi-plus-circle"></i> Add Category
        </h5>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="text"
            className="form-control mb-3"
            placeholder="Subcategories separated by commas"
            value={subcategories}
            onChange={(e) => setSubcategories(e.target.value)}
          />

          <input
            type="file"
            className="form-control mb-3"
            onChange={(e) => setPhoto(e.target.files[0])}
          />

          <button className="btn btn-success">Create Category</button>
        </form>
      </div>
    </div>
  );
};

export default CategoryAdd;
