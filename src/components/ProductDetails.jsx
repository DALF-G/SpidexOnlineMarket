import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const ProductDetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = "https://spidexmarket.onrender.com/api/product";

  // Fetch product
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/${id}`);
      const p = res.data.product || res.data;

      setProduct(p);
      setActiveImage(
        p?.photo?.length > 0
          ? `https://spidexmarket.onrender.com/${p.photo[0]}`
          : ""
      );

      fetchRelated(p.category);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load product");
      setLoading(false);
    }
  };

  // Fetch related products
  const fetchRelated = async (categoryName) => {
    try {
      const res = await axios.get(`${API}/`);
      const all = res.data.products || [];

      const filtered = all
        .filter(
          (item) =>
            item._id !== id &&
            item.category.toLowerCase() === categoryName.toLowerCase()
        )
        .slice(0, 4);

      setRelated(filtered);
    } catch (err) {
      console.log("Failed loading related products");
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line
  }, [id]);

  if (loading) {
    return <p className="text-center mt-5">Loading product...</p>;
  }

  if (!product) {
    return (
      <p className="text-center text-danger mt-4">Product not found.</p>
    );
  }

  return (
    <div className="container py-4">
      <ToastContainer />

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/products">Products</Link>
          </li>
          <li className="breadcrumb-item active">{product.title}</li>
        </ol>
      </nav>

      <div className="row mt-3">
        {/* LEFT – IMAGES */}
        <div className="col-md-6">
          <img
            src={activeImage}
            alt="Main"
            className="img-fluid rounded shadow-sm mb-3"
            style={{ width: "100%", height: "380px", objectFit: "cover" }}
          />

          {/* Thumbnail Row */}
          <div className="d-flex gap-2">
            {product.photo?.map((img, index) => (
              <img
                key={index}
                src={`https://spidexmarket.onrender.com/${img}`}
                alt="thumb"
                onClick={() =>
                  setActiveImage(
                    `https://spidexmarket.onrender.com/${img}`
                  )
                }
                className="rounded border"
                style={{
                  width: "70px",
                  height: "70px",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>

        {/* RIGHT – PRODUCT INFO */}
        <div className="col-md-6">
          <h2 className="fw-bold">{product.title}</h2>

          <h3 className="text-warning fw-bolder mb-3">
            KES {product.price.toLocaleString()}
          </h3>

          <p className="mb-2">
            <strong>Category:</strong> {product.category}
          </p>

          <p className="mb-2">
            <strong>Subcategory:</strong> {product.subCategory || "N/A"}
          </p>

          <p className="mb-2">
            <strong>Condition:</strong>{" "}
            <span className="badge bg-info text-dark">
              {product.condition}
            </span>
          </p>

          <p className="mb-2">
            <strong>Location:</strong> {product.location}
          </p>

          <p className="mt-3">
            <strong>Description:</strong>
            <br />
            {product.description}
          </p>

          {/* Buttons */}
          <div className="mt-4 d-flex gap-3">

          {/* CALL SELLER */}
         <a
             href={`tel:${product?.sellerId?.phone}`}
             className="btn btn-success w-50"
             >
             Call Seller
          </a>

           {/* CHAT SELLER */}
          <Link
           to={`https://spidexmarket.onrender.com/api/message/send=${product?.sellerId?._id}`}
           className="btn btn-warning w-50"
          >
             Chat Seller
            </Link>

          </div>

        </div>
      </div>

      {/* RELATED PRODUCTS */}
      <div className="mt-5">
        <h4 className="mb-3 text-warning">Related Products</h4>

        {related.length === 0 ? (
          <p className="text-muted">No related products found.</p>
        ) : (
          <div className="row g-4">
            {related.map((p) => (
              <div className="col-md-3 col-sm-6" key={p._id}>
                <div className="card h-100 shadow-sm">
                  <Link to={`/product/${p._id}`}>
                    <img
                      src={
                        p.photo?.length > 0
                          ? `https://spidexmarket.onrender.com/${p.photo[0]}`
                          : "https://via.placeholder.com/300"
                      }
                      alt={p.title}
                      style={{
                        height: "180px",
                        width: "100%",
                        objectFit: "cover",
                      }}
                      className="card-img-top"
                    />
                  </Link>

                  <div className="card-body">
                    <h6 className="fw-bold">{p.title}</h6>
                    <span className="text-warning fw-bold">
                      KES {p.price}
                    </span>
                  </div>

                  <div className="card-footer bg-white text-center">
                    <Link
                      to={`/product/${p._id}`}
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

export default ProductDetails;
