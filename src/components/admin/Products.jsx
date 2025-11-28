import React, { useCallback, useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

const Products = () => {
  const { token } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  console.log(products)

  const API = "https://spidexmarket.onrender.com/api/product";

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      toast.info("Loading products...");
      const res = await axios.get(`${API}/`, authHeader);
      // expect res.data.products (server should return that)
      setProducts(res.data.products || res.data || []);
      toast.dismiss();
      setLoading(false);
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to fetch products");
      setLoading(false);
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleActive = async (id, current) => {
    try {
      await axios.put(`${API}/toggle/${id}`, { isActive: !current }, authHeader);
      toast.success("Product status updated");
      fetchProducts();

    } 
    catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API}/${id}`, authHeader);
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      toast.error("Failed to delete product");
      console.error(err);
    }
  };

  if (loading) return <p className="text-center mt-4">Loading products...</p>;

  return (
    <div className="container mt-3">
      <ToastContainer position="top-right" autoClose={2500} />
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin-dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Products</li>
        </ol>
      </nav>

      <div className="card shadow p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="text-success mb-0"><i className="bi bi-box-seam"></i> Products</h5>
          <div>
            <button className="btn btn-success me-2" onClick={() => navigate("/admin-dashboard/products/add")}>
              <i className="bi bi-plus-circle"></i> Add Product
            </button>
            <button className="btn btn-outline-secondary" onClick={fetchProducts}>Refresh</button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="alert alert-warning">No products found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-bordered align-middle">
              <thead className="table-warning">
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Seller</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p._id}>
                    <td>{i + 1}</td>
                    <td style={{ width: 100 }}>
                      {p.photos && p.photos.length > 0 ? (
                        <img
                          src={`${p.photos[0]}`}
                          alt={p.title}
                          className="img-fluid rounded"
                        />
                      ) : (
                        <span className="text-muted">No Image</span>
                      )}
                    </td>
                    <td>{p.title}</td>
                    <td>{typeof p.price === "number" ? `KES ${p.price}` : p.price}</td>
                    <td>{p.category}</td>
                    <td>{p.subCategory || "-"}</td>
                    <td>{p.seller?.name || (p.seller || "-")}</td>
                    <td>
                      <span className={`badge ${p.status === "active" ? "bg-success" : "bg-secondary"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="text-center">
                    <div className="d-flex justify-content-center gap-1 flex-wrap">

                    <button
                       className="btn btn-info btn-sm px-2 py-1"
                       style={{ fontSize: "12px" }}
                       onClick={() =>
                       navigate("/admin-dashboard/products/view", {
                       state: { productId: p._id },
                 })
               }
               >
                View
              </button>

              <button
                className="btn btn-primary btn-sm px-2 py-1"
                style={{ fontSize: "12px" }}
                onClick={() =>
                navigate("/admin-dashboard/products/edit", {
                state: { productId: p._id },
              })
            }
           >
             Edit
          </button>

             <button
                className="btn btn-danger btn-sm px-2 py-1"
                style={{ fontSize: "12px" }}
                onClick={() => handleDelete(p._id)}
                >
                Delete
                </button>

                </div>
                </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
