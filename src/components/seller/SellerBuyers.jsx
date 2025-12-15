import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const SellerBuyers = () => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBuyers = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get(
        "https://spidexmarket.onrender.com/api/visitors",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBuyers(res.data.buyers || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load buyers:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, []);

  return (
    <div className="container my-4">
      <h2 className="text-center text-success mb-4">Buyer Visits & Viewed Products</h2>

      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white">
          <h5>
            <i className="bi bi-people-fill me-2"></i> Buyers Who Viewed Your Page
          </h5>
        </div>

        <div className="card-body">
          {loading ? (
            <p className="text-center text-muted">Loading buyers...</p>
          ) : buyers.length === 0 ? (
            <p className="text-center text-muted">No buyers have viewed your page yet.</p>
          ) : (
            <div className="accordion" id="buyerAccordion">
              {buyers.map((buyer, index) => (
                <div className="accordion-item mb-3" key={buyer._id || index}>
                  <h2 className="accordion-header" id={`heading-${index}`}>
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#collapse-${index}`}
                    >
                      <strong>{buyer.name}</strong> &nbsp;({buyer.email})
                      <span className="badge bg-secondary ms-2">
                        {buyer.viewedProducts?.length} viewed products
                      </span>
                    </button>
                  </h2>

                  <div
                    id={`collapse-${index}`}
                    className="accordion-collapse collapse"
                    data-bs-parent="#buyerAccordion"
                  >
                    <div className="accordion-body">
                      <p>
                        <strong>Phone:</strong> {buyer.phone} <br />
                        <strong>Last Visit:</strong>{" "}
                        {new Date(buyer.lastVisit).toLocaleString()}
                      </p>

                      <hr />

                      <h6>Products Viewed:</h6>

                      {buyer.viewedProducts?.length === 0 ? (
                        <p className="text-muted">No products viewed yet.</p>
                      ) : (
                        <div className="row g-3">
                          {buyer.viewedProducts.map((p, i) => (
                            <div className="col-md-3 col-sm-6" key={i}>
                              <div className="card shadow-sm h-100">
                                <img
                                  src={p.photo || "https://via.placeholder.com/200"}
                                  className="card-img-top"
                                  alt={p.title}
                                  style={{ height: 120, objectFit: "cover" }}
                                />

                                <div className="card-body">
                                  <h6 className="fw-bold">{p.title}</h6>
                                  <p className="text-warning">KES {p.price}</p>
                                  <small className="text-muted">
                                    Viewed: {new Date(p.viewedAt).toLocaleString()}
                                  </small>
                                </div>

                                <div className="card-footer text-center bg-white">
                                  <Link
                                    to={`/product/${p.productId}`}
                                    className="btn btn-outline-primary btn-sm w-100"
                                  >
                                    View Product
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerBuyers;
