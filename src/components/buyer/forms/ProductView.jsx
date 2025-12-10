import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API = "https://spidexmarket.onrender.com/api/product";

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  let ignore = false;

  const fetchRelatedProducts = async (categoryName) => {
    try {
      const res = await axios.get(API);
      const all = res.data.products || [];

      const filtered = all
        .filter(
          (r) =>
            r._id !== id &&
            r.category?.toLowerCase() === categoryName?.toLowerCase()
        )
        .slice(0, 4);

      setRelated(filtered);
    } catch (err) {
      console.log("Failed loading related products");
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/${id}`);
      const p = res.data.product;

      if (!p) {
        toast.error("Product not found");
        setLoading(false);
        return;
      }

      if (!ignore) {
        setProduct(p);
        setActiveImage(p.photos?.[0] || "");
        await fetchRelatedProducts(p.category);
      }

      setLoading(false);
    } catch (err) {
      toast.error("Failed to load product");
      setLoading(false);
    }
  };

  useEffect(() => {
    ignore = false;
    fetchProduct();

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) return <p className="text-center mt-5">Loading product...</p>;

  if (!product)
    return (
      <p className="text-center text-danger mt-5">
        Product not found or removed.
      </p>
    );

  return (
    <div className="container py-4">
      <ToastContainer />

      {/* BACK BUTTON */}
      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {/* BREADCRUMB */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/buyer-dashboard">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/products">Products</Link>
          </li>
          <li className="breadcrumb-item active">{product.title}</li>
        </ol>
      </nav>

      <div className="row mt-3">
        {/* LEFT IMAGES */}
        <div className="col-md-6">
          <img
            src={activeImage}
            alt={product.title}
            className="img-fluid rounded shadow-sm mb-3"
            style={{ width: "100%", height: "380px", objectFit: "cover" }}
          />

          <div className="d-flex gap-2">
            {product.photos?.map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setActiveImage(img)}
                alt={`thumb-${i}`}
                className="rounded border"
                style={{
                  width: "70px",
                  height: "70px",
                  objectFit: "cover",
                  cursor: "pointer",
                  border:
                    activeImage === img
                      ? "2px solid #ff9900"
                      : "1px solid #ccc",
                }}
              />
            ))}
          </div>
        </div>

        {/* RIGHT INFO */}
        <div className="col-md-6">
          <h2 className="fw-bold">{product.title}</h2>

          <h3 className="text-warning fw-bold mb-3">
            KES {Number(product.price).toLocaleString()}
          </h3>

          <p>
            <strong>Category:</strong> {product.category}
          </p>
          <p>
            <strong>Subcategory:</strong> {product.subCategory || "N/A"}
          </p>

          <p>
            <strong>Condition:</strong>{" "}
            <span className="badge bg-info text-dark">
              {product.condition}
            </span>
          </p>

          <p>
            <strong>Location:</strong> {product.location}
          </p>

          <p className="mt-3">
            <strong>Description:</strong>
            <br />
            {product.description}
          </p>

          {/* BUTTONS */}
          <div className="mt-4 d-flex gap-3">
            <a href={`tel:${product?.seller?.phone}`} className="btn btn-success w-50">
              Call Seller
            </a>

            {/* ✅ FIXED MESSAGE SELLER BUTTON */}
            <button
              className="btn btn-warning w-50"
              onClick={() =>
                navigate(`/buyer-dashboard/messages/chat/${product?.seller?._id}`, {
                  state: {
                    receiverId: product?.seller?._id,
                    receiverName: product?.seller?.name,
                    productId: product?._id,
                  },
                })
              }
            >
              Message Seller
            </button>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      <div className="mt-5">
        <h4 className="text-warning">Related Products</h4>

        {related.length === 0 ? (
          <p className="text-muted">No related products.</p>
        ) : (
          <div className="row g-4 mt-2">
            {related.map((p) => (
              <div key={p._id} className="col-md-3 col-sm-6">
                <div className="card h-100 shadow-sm">
                  <Link to={`/buyer/product/${p._id}`}>
                    <img
                      src={p.photos?.[0] || "https://via.placeholder.com/300"}
                      className="card-img-top"
                      alt={p.title}
                      style={{
                        height: "160px",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Link>

                  <div className="card-body">
                    <h6 className="fw-bold">{p.title}</h6>
                    <p className="text-warning fw-bold">
                      KES {p.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="card-footer bg-white text-center">
                    <Link
                      to={`/buyer/product/${p._id}`}
                      className="btn btn-warning btn-sm w-100"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: "60px" }}></div>
    </div>
  );
};

export default ProductView;
