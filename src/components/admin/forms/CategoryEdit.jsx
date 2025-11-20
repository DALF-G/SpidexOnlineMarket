import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";

const EditCategory = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const category = location.state?.category;

  // Initialize hooks safely (category may be undefined)
  const [name, setName] = useState(category?.name || "");
  const [subcategories, setSubcategories] = useState(
    category?.subcategories?.join(", ") || ""
  );
  const [photo, setPhoto] = useState(null);

  // Now safely check after hooks
  if (!category) {
    return <p className="text-center mt-5">Invalid category selected</p>;
  }

  const url = `https://spidexmarket.onrender.com/api/category/update/${category._id}`;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      toast.info("Updating category...");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("subcategories", subcategories);
      if (photo) formData.append("photo", photo);

      await axios.put(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.dismiss();
      toast.success("Category updated!");

      setTimeout(() => {
        navigate("/admin-dashboard/categories");
      }, 1500);
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to update category");
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
            Edit Category
          </li>
        </ol>
      </nav>

      <div className="card shadow p-4">
        <h5 className="text-success mb-3">
          <i className="bi bi-pen-fill"></i> Edit Category
        </h5>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-control mb-3"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="text"
            className="form-control mb-3"
            value={subcategories}
            onChange={(e) => setSubcategories(e.target.value)}
          />

          <input
            type="file"
            className="form-control mb-3"
            onChange={(e) => setPhoto(e.target.files[0])}
          />

          <button className="btn btn-warning">Update Category</button>
        </form>
      </div>
    </div>
  );
};

export default EditCategory;
