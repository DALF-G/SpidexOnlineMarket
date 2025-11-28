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

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${CATEGORY_API}/`);
        setCategories(res.data.categories || res.data || []);
      } 
      catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files || []).slice(0, 5));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !price || !category || !condition || !location) {
      toast.error("Please fill required fields");
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
      formData.append("sellerId", user?._id);
      formData.append("isFeatured", isFeatured);

      files.forEach((f) => formData.append("photos", f));

      const res = await axios.post(`${API}/add`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.dismiss();
      toast.success(res.data.message || "Product added");
      navigate("/seller-dashboard");
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || "Error adding product");
      console.error(err);
    }
  };

  return (
    <div className="container mt-3">
      <ToastContainer position="top-right" autoClose={2500} />
      <div className="card shadow p-4">
        <h5 className="text-success mb-3">Add New Product</h5>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Title *</label>
            <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows={4} value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Price (KES) *</label>
              <input type="number" className="form-control" value={price} onChange={e => setPrice(e.target.value)} required />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Category *</label>
              <select className="form-select" value={category} onChange={e => setCategory(e.target.value)} required>
                <option value="">Choose category</option>
                {categories.map(c => <option key={c._id || c.name} value={c.name || c._id}>{c.name}</option>)}
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Subcategory</label>
              <input type="text" className="form-control" value={subCategory} onChange={e => setSubCategory(e.target.value)} />
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Condition *</label>
              <select className="form-select" value={condition} onChange={e => setCondition(e.target.value)} required>
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Location *</label>
              <input type="text" className="form-control" value={location} onChange={e => setLocation(e.target.value)} required />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Featured</label>
              <div className="form-check">
                <input id="featured" className="form-check-input" type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
                <label className="form-check-label" htmlFor="featured">Mark as featured</label>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Photos (max 5)</label>
            <input type="file" className="form-control" multiple accept="image/*" onChange={handleFiles} />
          </div>

          <div className="d-grid">
            <button className="btn btn-warning">Add Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerProductAdd;
