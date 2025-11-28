import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { AuthContext } from "../../../context/AuthContext";

const SellerProductView = () => {
  const { token } = useContext(AuthContext);
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const productId = location?.state?.productId || params?.id;

  const API = "https://spidexmarket.onrender.com/api/product";
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      toast.error("No product specified");
      navigate("/seller-dashboard");
      return;
    }
    const load = async () => {
      try {
        const res = await axios.get(`${API}/${productId}`, authHeader);
        setProduct(res.data.product || res.data || null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

  const handleEdit = () => navigate("/seller-dashboard/product/edit", { state: { productId } });

  const handleDelete = async () => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API}/delete/${productId}`, authHeader);
      toast.success("Product deleted");
      navigate("/seller-dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  };

  if (loading) return <p className="text-center mt-4">Loading product...</p>;
  if (!product) return <div className="alert alert-warning">Product not found</div>;

  return (
    <div className="container mt-3">
      <ToastContainer position="top-right" autoClose={2500} />
      <div className="card shadow p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h4>{product.title}</h4>
            <p className="text-muted mb-0">{product.category} / {product.subCategory || "-"}</p>
            <p className="fw-bold mt-2">KES {product.price}</p>
          </div>
          <div>
            <button className="btn btn-primary me-2" onClick={handleEdit}>Edit</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </div>

        <div className="row">
          <div className="col-md-5">
            {product.photo && product.photo.length > 0 ? (
              <img src={product.photo[0].startsWith("http") ? product.photo[0] : `https://spidexmarket.onrender.com/${product.photo[0]}`} alt={product.title} className="img-fluid rounded" />
            ) : (
              <div className="text-muted">No image</div>
            )}

            <div className="d-flex gap-2 mt-2 flex-wrap">
              {product.photo && product.photo.slice(1).map((p, i) => (
                <img key={i} src={p.startsWith("http") ? p : `https://spidexmarket.onrender.com/${p}`} alt={`thumb-${i}`} width="80" className="rounded" />
              ))}
            </div>
          </div>

          <div className="col-md-7">
            <h6>Description</h6>
            <p>{product.description || "No description"}</p>

            <p><strong>Condition:</strong> {product.condition}</p>
            <p><strong>Location:</strong> {product.location}</p>
            <p><strong>Status:</strong> <span className={`badge ${product.status === "active" ? "bg-success" : "bg-secondary"}`}>{product.status}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProductView;
