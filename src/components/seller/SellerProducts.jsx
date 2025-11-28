import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API = "https://spidexmarket.onrender.com/api/product"; 
  const token = localStorage.getItem("token");

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // Fetch Seller Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://spidexmarket.onrender.com/api/sellerstats/products",
        authHeader
      );
      setProducts(res.data.products || []);
      setLoading(false);
    } 
    catch (err) {
      console.error("Failed to fetch products:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // DELETE Product
  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this product?")) return;

    try {
      await axios.delete(`${API}/delete/${id}`, authHeader);
      toast.success("Product deleted");
      fetchProducts();
    } 
    catch (err) {
      toast.error("Failed to delete product");
      console.error(err);
    }
  };

  if (loading) {
    return <p className="text-center mt-5">Loading products...</p>;
  }

  return (
    <div className="container my-3">
      <ToastContainer position="top-right" autoClose={2500} />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-success">My Products</h3>

        <button
          className="btn btn-success"
          onClick={() => navigate("/seller-dashboard/products/add")}
        >
          <i className="bi bi-plus-circle"></i> Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <p className="text-muted text-center">You have no products yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered align-middle">
            <thead className="table-primary">
              <tr>
                <th>#</th>
                <th>Photo</th>
                <th>Title</th>
                <th>Price</th>
                <th>Category</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product, index) => (
                <tr key={product._id}>
                  <td>{index + 1}</td>

                  <td>
                    {product.photo?.length > 0 ? (
                      <img
                        src={`https://spidexmarket.onrender.com/${product.photo[0]}`}
                        alt={product.title}
                        width="60"
                        height="60"
                        className="rounded"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <span>No Image</span>
                    )}
                  </td>

                  <td>{product.title}</td>
                  <td>KES {product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.status}</td>

                  <td className="text-center">

                    {/* VIEW */}
                    <button
                      className="btn btn-sm btn-info me-2"
                      onClick={() =>
                        navigate("/seller-dashboard/products/view", {
                          state: { productId: product._id },
                        })
                      }
                    >
                      View
                    </button>

                    {/* EDIT */}
                    <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() =>
                        navigate("/seller-dashboard/products/edit", {
                          state: { productId: product._id },
                        })
                      }
                    >
                      Edit
                    </button>

                    {/* DELETE */}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
