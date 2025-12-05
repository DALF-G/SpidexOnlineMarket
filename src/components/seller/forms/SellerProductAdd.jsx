import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { AuthContext } from "../../../context/AuthContext";

const SellerProductAdd = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const API = "https://spidexmarket.onrender.com/api/product";
  const CATEGORY_API = "https://spidexmarket.onrender.com/api/category";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [condition, setCondition] = useState("new");
  const [location, setLocation] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [files, setFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategoriesList, setSubCategoriesList] = useState([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(CATEGORY_API);
        const list = res.data.categories || [];
        setCategories(list);
      } catch (err) {
        toast.error("Failed to load categories");
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  // When category changes → load its subcategories
  useEffect(() => {
    if (!category) {
      setSubCategoriesList([]);
      setSubCategory("");
      return;
    }

    const selectedCategory = categories.find((c) => c._id === category);

    if (selectedCategory) {
      setSubCategoriesList(selectedCategory.subcategories || []);
    }
  }, [category, categories]);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files).slice(0, 5);
    setFiles(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedCategory = categories.find((c) => c._id === category);

    if (selectedCategory) {
      setSubCategoriesList(selectedCategory.subcategories || []);
    }

    console.log("The selected category contains: ", selectedCategory)

    if (!title || !price || !category || !condition || !location) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!user?._id) {
      toast.error("User information missing");
      return;
    }

    console.log("this is what is contained in category:",category)

    try {
      toast.info("Uploading product...");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", selectedCategory.name);
      formData.append("subCategory", subCategory);
      formData.append("condition", condition);
      formData.append("location", location);
      formData.append("isFeatured", isFeatured);
      formData.append("sellerId", user._id); // AUTO-SET THE SELLER ID

      files.forEach((file) => formData.append("photos", file));

      const res = await axios.post(`${API}/add`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.dismiss();
      toast.success("Product added successfully");

      navigate("/seller-dashboard/products");
    } catch (err) {
      toast.dismiss();
      toast.error(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Product upload failed"
      );
      console.error(err);
    }
  };

  return (
    <div className="container mt-3">
      <ToastContainer position="top-right" autoClose={2500} />

      <div className="card shadow p-4">
        <h5 className="text-success mb-3">Add New Product</h5>

        <form onSubmit={handleSubmit}>
          {/* TITLE */}
          <div className="mb-3">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          {/* PRICE – CATEGORY – SUBCATEGORY */}
          <div className="row">
            {/* PRICE */}
            <div className="col-md-4 mb-3">
              <label className="form-label">Price (KES) *</label>
              <input
                type="number"
                className="form-control"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            {/* CATEGORY */}
            <div className="col-md-4 mb-3">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Choose category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SUBCATEGORY DROPDOWN */}
            <div className="col-md-4 mb-3">
              <label className="form-label">Subcategory</label>

              <select
                className="form-select"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                disabled={subCategoriesList.length === 0}
              >
                <option value="">Choose subcategory</option>

                {subCategoriesList.map((sub, i) => (
                  <option key={i} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CONDITION – LOCATION – FEATURED */}
          <div className="row">
            {/* CONDITION */}
            <div className="col-md-4 mb-3">
              <label className="form-label">Condition *</label>
              <select
                className="form-select"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                required
              >
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>

            {/* LOCATION */}
            <div className="col-md-4 mb-3">
              <label className="form-label">Location *</label>
              <input
                type="text"
                className="form-control"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            {/* FEATURED */}
            <div className="col-md-4 mb-3">
              <div className="form-check mt-4">
                <input
                  id="featured"
                  className="form-check-input"
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="featured">
                  Mark as featured
                </label>
              </div>
            </div>
          </div>

          {/* PHOTOS */}
          <div className="mb-3">
            <label className="form-label">Photos (max 5)</label>
            <input
              type="file"
              className="form-control"
              multiple
              accept="image/*"
              onChange={handleFiles}
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="d-grid">
            <button className="btn btn-warning">Add Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerProductAdd;
