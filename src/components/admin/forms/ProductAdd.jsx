import React, { useCallback, useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { AuthContext } from "../../../context/AuthContext";

const ProductAdd = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const PRODUCT_API = "https://spidexmarket.onrender.com/api/product";
  const CATEGORY_API = "https://spidexmarket.onrender.com/api/category";
  const USERS_API = "https://spidexmarket.onrender.com/api/admin/users";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  const [condition, setCondition] = useState("new");
  const [location, setLocation] = useState("");

  const [sellerId, setSellerId] = useState("");
  const [useLoggedInSeller, setUseLoggedInSeller] = useState(false);

  const [isFeatured, setIsFeatured] = useState(false);
  const [files, setFiles] = useState([]);

  const [categories, setCategories] = useState([]);
  const [subcategoriesList, setSubcategoriesList] = useState([]);

  const [sellers, setSellers] = useState([]);

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${CATEGORY_API}/`);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Fetch sellers
  const fetchSellers = useCallback(async () => {
    try {
      const res = await axios.get(`${USERS_API}`, authHeader);
      const sellerList = res.data.users.filter(
        (u) => u.role === "seller" && u.isApprovedSeller
      );
      setSellers(sellerList);
    } catch (err) {
      console.error("Error loading sellers", err);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
    fetchSellers();
  }, [fetchCategories, fetchSellers]);

  // When category changes → load its subcategories
  useEffect(() => {
    const selected = categories.find((c) => c.name === category);
    setSubcategoriesList(selected?.subcategories || []);
  }, [category, categories]);

  const handleFiles = (e) => setFiles([...e.target.files]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !price || !category || !condition || !location) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!sellerId) {
      toast.error("Please select a seller");
      return;
    }

    try {
      toast.info("Uploading product...");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("condition", condition);
      formData.append("location", location);
      formData.append("sellerId", sellerId);
      formData.append("isFeatured", isFeatured);

      files.forEach((file) => formData.append("photos", file));

      const res = await axios.post(`${PRODUCT_API}/add`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      toast.dismiss();
      toast.success(res.data.message || "Product added successfully!");
      navigate("/admin-dashboard/products");

    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || "Product upload failed");
    }
  };

  return (
    <div className="container mt-3">
      <ToastContainer position="top-right" autoClose={2200} />

      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin-dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item"><Link to="/admin-dashboard/products">Products</Link></li>
          <li className="breadcrumb-item active">Add Product</li>
        </ol>
      </nav>

      <div className="card shadow p-4">
        <h5 className="text-success mb-3">Add New Product</h5>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-3">
            <label className="form-label">Title *</label>
            <input type="text" className="form-control" value={title} onChange={(e)=>setTitle(e.target.value)} required />
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows={3} value={description} onChange={(e)=>setDescription(e.target.value)} />
          </div>

          {/* Price + Category + Subcategory */}
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Price (KES) *</label>
              <input type="number" className="form-control" value={price} onChange={(e)=>setPrice(e.target.value)} required />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Category *</label>
              <select className="form-select" value={category} onChange={(e)=>setCategory(e.target.value)} required>
                <option value="">Choose category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Subcategory</label>
              <select className="form-select" value={subCategory} onChange={(e)=>setSubCategory(e.target.value)}>
                <option value="">Choose subcategory</option>
                {subcategoriesList.map((s, i) => (
                  <option key={i} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition + Location */}
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Condition *</label>
              <select className="form-select" value={condition} onChange={(e)=>setCondition(e.target.value)} required>
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Location *</label>
              <input type="text" className="form-control" value={location} onChange={(e)=>setLocation(e.target.value)} required />
            </div>

            {/* Seller Selection */}
            <div className="col-md-4 mb-3">
              <label className="form-label">Seller *</label>
              <select className="form-select" value={sellerId} onChange={(e)=>setSellerId(e.target.value)} required>
                <option value="">Select seller</option>
                {sellers.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Photos */}
          <div className="mb-3">
            <label className="form-label">Photos (max 5)</label>
            <input type="file" className="form-control" multiple accept="image/*" onChange={handleFiles} />
          </div>

          {/* Featured checkbox */}
          <div className="form-check mb-3">
            <input type="checkbox" className="form-check-input" checked={isFeatured} onChange={(e)=>setIsFeatured(e.target.checked)} />
            <label className="form-check-label">Featured</label>
          </div>

          {/* Submit */}
          <button className="btn btn-warning w-100">Add Product</button>
        </form>
      </div>
    </div>
  );
};

export default ProductAdd;
