import React, { useCallback, useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { AuthContext } from "../../../context/AuthContext";

const ProductEdit = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const productId = location.state?.productId;

  const API = "https://spidexmarket.onrender.com/api/product";
  const CATEGORY_API = "https://spidexmarket.onrender.com/api/category";

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(""); // STORE NAME, NOT ID
  const [subCategory, setSubCategory] = useState("");
  const [condition, setCondition] = useState("new");
  const [locationText, setLocationText] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [files, setFiles] = useState([]);

  const [categories, setCategories] = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  /** FETCH CATEGORIES **/
  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${CATEGORY_API}/`);
      const cats = res.data.categories || res.data || [];
      setCategories(cats);
    } catch (err) {
      console.error(err);
    }
  }, []);

  /** FETCH PRODUCT DETAILS **/
  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${API}/${productId}`, authHeader);
      const p = res.data.product || res.data;

      setProduct(p);
      setTitle(p.title || "");
      setDescription(p.description || "");
      setPrice(p.price || "");
      setCategory(p.category || "");        // category NAME
      setSubCategory(p.subCategory || "");
      setCondition(p.condition || "new");
      setLocationText(p.location || "");
      setIsFeatured(!!p.isFeatured);

      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load product");
      setLoading(false);
    }
  }, [productId, token]);

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [fetchCategories, fetchProduct]);

  /** UPDATE SUBCATEGORY DROPDOWN WHEN CATEGORY CHANGES **/
  useEffect(() => {
    if (!category || categories.length === 0) return;

    const selected = categories.find(
      (c) => c.name.toLowerCase() === category.toLowerCase()
    );

    if (selected && selected.subcategories?.length > 0) {
      setSubCategoryList(selected.subcategories);
    } else {
      setSubCategoryList([]); // No subcategories → show manual input
    }
  }, [category, categories]);

  /** FILE HANDLER **/
  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  /** SUBMIT UPDATED PRODUCT **/
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productId) return toast.error("Invalid product");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);       // SEND NAME
      formData.append("subCategory", subCategory);
      formData.append("condition", condition);
      formData.append("location", locationText);
      formData.append("isFeatured", isFeatured);

      files.forEach((f) => formData.append("photos", f));

      await axios.put(`${API}/${productId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Product updated successfully");
      navigate("/admin-dashboard/products");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <p className="text-center mt-3">Loading...</p>;

  return (
    <div className="container mt-3">
      <ToastContainer />

      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/admin-dashboard">Dashboard</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/admin-dashboard/products">Products</Link>
          </li>
          <li className="breadcrumb-item active">Edit Product</li>
        </ol>
      </nav>

      <div className="card shadow p-4">
        <h5 className="text-success mb-3">Edit Product</h5>

        <form onSubmit={handleSubmit}>
          {/* TITLE */}
          <div className="mb-3">
            <label className="form-label">Title *</label>
            <input
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
            />
          </div>

          {/* PRICE + CATEGORY + SUBCATEGORY */}
          <div className="row">
            <div className="col-md-4 mb-3">
              <label>Price *</label>
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
              <label>Category *</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Choose</option>

                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SUBCATEGORY DROPDOWN OR INPUT */}
            <div className="col-md-4 mb-3">
              <label>Subcategory</label>

              {subCategoryList.length > 0 ? (
                <select
                  className="form-select"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                >
                  <option value="">Choose subcategory</option>
                  {subCategoryList.map((s, i) => (
                    <option key={i} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="form-control"
                  placeholder="Type subcategory"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                />
              )}
            </div>
          </div>

          {/* OTHER FIELDS */}
          <div className="row">
            <div className="col-md-4 mb-3">
              <label>Condition *</label>
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

            <div className="col-md-4 mb-3">
              <label>Location *</label>
              <input
                className="form-control"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Photos (optional – add more)</label>
              <input
                type="file"
                className="form-control"
                multiple
                accept="image/*"
                onChange={handleFiles}
              />
            </div>
          </div>

          {/* FEATURED */}
          <div className="form-check mb-3">
            <input
              type="checkbox"
              id="featured"
              className="form-check-input"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            <label htmlFor="featured" className="form-check-label">
              Featured
            </label>
          </div>

          {/* SUBMIT */}
          <div className="d-grid">
            <button className="btn btn-warning">Update Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEdit;
