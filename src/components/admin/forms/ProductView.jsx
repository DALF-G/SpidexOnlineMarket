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
  const [activeIndex, setActiveIndex] = useState(0);

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

  const photos = product.photos || [];

  return (
    <div className="container mt-3">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/admin-dashboard">Dashboard</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/admin-dashboard/products">Products</Link>
          </li>
          <li className="breadcrumb-item active">View</li>
        </ol>
      </nav>

      <div className="card shadow p-4">
        <div className="row">
          {/* LEFT — IMAGE CAROUSEL */}
          <div className="col-md-5">
            {photos.length > 0 ? (
              <>
                {/* Main Carousel */}
                <div id="productCarousel" className="carousel slide">
                  <div className="carousel-inner">
                    {photos.map((img, index) => (
                      <div
                        className={`carousel-item ${
                          index === activeIndex ? "active" : ""
                        }`}
                        key={index}
                      >
                        <img
                          src={img}
                          alt={`Product ${index}`}
                          className="d-block w-100 rounded"
                          style={{ maxHeight: "330px", objectFit: "cover" }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Controls */}
                  <button
                    className="carousel-control-prev"
                    type="button"
                    onClick={() =>
                      setActiveIndex(
                        (prev) => (prev - 1 + photos.length) % photos.length
                      )
                    }
                  >
                    <span className="carousel-control-prev-icon"></span>
                  </button>

                  <button
                    className="carousel-control-next"
                    type="button"
                    onClick={() =>
                      setActiveIndex((prev) => (prev + 1) % photos.length)
                    }
                  >
                    <span className="carousel-control-next-icon"></span>
                  </button>
                </div>

                {/* Thumbnails */}
                <div className="mt-3 d-flex gap-2 flex-wrap">
                  {photos.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt="thumb"
                      onClick={() => setActiveIndex(index)}
                      style={{
                        width: "65px",
                        height: "65px",
                        objectFit: "cover",
                        cursor: "pointer",
                        border:
                          activeIndex === index
                            ? "2px solid #007bff"
                            : "2px solid transparent",
                        borderRadius: "6px",
                      }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="border p-5 text-center text-muted">No Image</div>
            )}
          </div>

          {/* RIGHT — PRODUCT DETAILS */}
          <div className="col-md-7">
            <h3>{product.title}</h3>
            <p className="text-muted">
              Category: {product.category} / {product.subCategory || "-"}
            </p>
            <h4 className="text-warning">KES {product.price}</h4>
            <p>{product.description}</p>

            <p><strong>Condition:</strong> {product.condition}</p>
            <p><strong>Location:</strong> {product.location}</p>
            <p><strong>Status:</strong> {product.status}</p>

            <div className="d-flex mt-3">
              <button
                className="btn btn-primary me-2"
                onClick={() =>
                  navigate("/admin-dashboard/products/edit", {
                    state: { productId: product._id },
                  })
                }
              >
                Edit
              </button>
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;
