import React, { useCallback, useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { AuthContext } from "../../../context/AuthContext";

const ProductView = () => {
  const { token } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const productId = location.state?.productId;

  const API = "https://spidexmarket.onrender.com/api/product";
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API}/${productId}`, authHeader);
      setProduct(res.data.product || res.data);
    } catch (err) {
      toast.error("Failed to load product");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [productId, token]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  if (loading) return <p className="text-center mt-3">Loading product...</p>;
  if (!product) return <p className="text-center mt-3">Product not found</p>;

  return (
    <div className="container mt-3">
      <ToastContainer position="top-right" autoClose={2000}/>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin-dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item"><Link to="/admin-dashboard/products">Products</Link></li>
          <li className="breadcrumb-item active">View</li>
        </ol>
      </nav>

      <div className="card shadow p-4">
        <div className="row">
          <div className="col-md-5">
            {product.photo && product.photo.length > 0 ? (
              <img src={`https://spidexmarket.onrender.com/${product.photo[0]}`} alt={product.title} className="img-fluid rounded" />
            ) : (
              <div className="border p-5 text-center text-muted">No Image</div>
            )}
          </div>

          <div className="col-md-7">
            <h3>{product.title}</h3>
            <p className="text-muted">Category: {product.category} / {product.subCategory || "-"}</p>
            <h4 className="text-warning">KES {product.price}</h4>
            <p>{product.description}</p>

            <p><strong>Condition:</strong> {product.condition}</p>
            <p><strong>Location:</strong> {product.location}</p>
            <p><strong>Status:</strong> {product.status}</p>

            <div className="d-flex mt-3">
              <button className="btn btn-primary me-2" onClick={() => navigate("/admin-dashboard/products/edit", { state: { productId: product._id } })}>Edit</button>
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;
