import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { AuthContext } from "../../../context/AuthContext";

const SellerProductEdit = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const productId = location?.state?.productId || params?.id;

  const API = "https://spidexmarket.onrender.com/api/product";
  const CATEGORY_API = "https://spidexmarket.onrender.com/api/category";
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    subCategory: "",
    condition: "new",
    location: "",
    isFeatured: false,
    photos: [], // existing photo urls
  });

  const [newFiles, setNewFiles] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${CATEGORY_API}/`),
          axios.get(`${API}/${productId}`, authHeader),
        ]);
        setCategories(catRes.data.categories || catRes.data || []);
        const p = prodRes.data.product || prodRes.data || {};
        setForm({
          title: p.title || "",
          description: p.description || "",
          price: p.price || "",
          category: p.category || "",
          subCategory: p.subCategory || "",
          condition: p.condition || "new",
          location: p.location || "",
          isFeatured: p.isFeatured || false,
          photos: p.photo || [],
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product data");
        setLoading(false);
      }
    };

    if (!productId) {
      toast.error("No product specified");
      navigate("/seller-dashboard");
      return;
    }

    fetch();
  }, [productId, token]);

  const handleFiles = (e) => setNewFiles(Array.from(e.target.files || []).slice(0, 5));

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const handleRemoveExistingPhoto = (index) => {
    setForm(f => ({ ...f, photos: f.photos.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      toast.info("Updating product...");
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("subCategory", form.subCategory);
      formData.append("condition", form.condition);
      formData.append("location", form.location);
      formData.append("isFeatured", form.isFeatured);
      // send remaining old photo urls as JSON string (backend must handle if you support this)
      formData.append("existingPhotos", JSON.stringify(form.photos || []));
      newFiles.forEach(f => formData.append("photos", f));

      const res = await axios.put(`${API}/update/${productId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.dismiss();
      toast.success(res.data.message || "Product updated");
      navigate("/seller-dashboard");
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || "Error updating product");
      console.error(err);
    }
  };

  if (loading) return <p className="text-center mt-4">Loading product...</p>;

  return (
    <div className="container mt-3">
      <ToastContainer position="top-right" autoClose={2500} />
      <div className="card shadow p-4">
        <h5 className="text-success mb-3">Edit Product</h5>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Title *</label>
            <input className="form-control" value={form.title} onChange={handleChange("title")} required />
          </div>

          <div className="mb-3">
            <label>Description</label>
            <textarea className="form-control" rows={4} value={form.description} onChange={handleChange("description")} />
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label>Price</label>
              <input type="number" className="form-control" value={form.price} onChange={handleChange("price")} required />
            </div>

            <div className="col-md-4 mb-3">
              <label>Category</label>
              <select className="form-select" value={form.category} onChange={handleChange("category")} required>
                <option value="">Choose category</option>
                {categories.map(c => <option key={c._id || c.name} value={c.name || c._id}>{c.name}</option>)}
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label>Subcategory</label>
              <input className="form-control" value={form.subCategory} onChange={handleChange("subCategory")} />
            </div>
          </div>

          <div className="mb-3">
            <label>Existing Photos</label>
            <div className="d-flex gap-2 flex-wrap mb-2">
              {form.photos && form.photos.length > 0 ? form.photos.map((src, idx) => (
                <div key={idx} style={{ width: 80 }}>
                  <img src={src.startsWith("http") ? src : `https://spidexmarket.onrender.com/${src}`} alt="photo" className="img-fluid rounded" />
                  <button type="button" className="btn btn-sm btn-outline-danger mt-1" onClick={() => handleRemoveExistingPhoto(idx)}>Remove</button>
                </div>
              )) : <div className="text-muted">No photos</div>}
            </div>

            <label>Add New Photos</label>
            <input type="file" className="form-control" multiple accept="image/*" onChange={handleFiles} />
          </div>

          <div className="d-grid">
            <button className="btn btn-primary">Update Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerProductEdit;
