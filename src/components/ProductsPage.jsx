import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import MyNavbar from "./MyNavbar";
import MyFooter from "./MyFooter";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const filterCategory = queryParams.get("category"); // e.g. electronics

  const API = "https://spidexmarket.onrender.com/api/product";

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/`);
      const all = res.data.products || res.data || [];

      setProducts(all);
      setFiltered(all);
      setLoading(false);

      if (filterCategory) {
        applyFilters(all, search, sort, filterCategory);
      }
    } catch (err) {
      toast.error("Failed loading products");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // RUN ALL FILTERS TOGETHER
  useEffect(() => {
    applyFilters(products, search, sort, filterCategory);
  }, [search, sort, filterCategory, products]);

  /**
   * MASTER FILTER FUNCTION
   * Applies: search + category + sort
   */
  const applyFilters = (allProducts, searchText, sortType, cat) => {
    let results = [...allProducts];

    // CATEGORY FILTER (matches category + subcategory)
    if (cat) {
      results = results.filter(
        (p) =>
          p.category?.toLowerCase() === cat.toLowerCase() ||
          p.subcategory?.toLowerCase() === cat.toLowerCase()
      );
    }

    //  SEARCH FILTER (title + category + subcategory)
    //  UNIVERSAL SEARCH FILTER
         if (searchText.trim() !== "") {
         const text = searchText.toLowerCase();

          results = results.filter((p) => {
           return Object.values(p)
           .toString()
           .toLowerCase()
           .includes(text);
       });

    }

    //  SORTING
    if (sortType === "low") {
      results.sort((a, b) => a.price - b.price);
    } else if (sortType === "high") {
      results.sort((a, b) => b.price - a.price);
    } else if (sortType === "latest") {
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFiltered(results);
  };

  if (loading)
    return <p className="text-center mt-5">Loading products...</p>;

  return (

    <div className="container py-4">
      
      <ToastContainer />

      {/* BREADCRUMB */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item active">Products</li>
        </ol>
      </nav>

      {/* TOP CONTROLS */}
      <div className="row mb-4">
        
        {/* SEARCH */}
        <div className="col-md-4 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, category, subcategory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* SORT */}
        <div className="col-md-4 mb-2">
          <select
            className="form-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="latest">Latest</option>
            <option value="low">Price: Low → High</option>
            <option value="high">Price: High → Low</option>
          </select>
        </div>

        {/* CLEAR CATEGORY */}
        <div className="col-md-4 mb-2">
          {filterCategory ? (
            <button
              className="btn btn-outline-danger w-100"
              onClick={() => (window.location.href = "/products")}
            >
              Clear Category Filter
            </button>
          ) : (
            <div></div>
          )}
        </div>
      </div>

      {/* PRODUCT GRID */}
      {filtered.length === 0 ? (
        <div className="alert alert-warning text-center">
          No products found.
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map((product) => (
            <div key={product._id} className="col-md-3 col-sm-6">
              <div className="card h-100 shadow-sm">

                {/* IMAGE */}
                <Link to={`/product/${product._id}`}>
                  <img
                    src={
                      product.photos?.[0]
                        ? `${product.photos[0]}`
                        : "https://via.placeholder.com/300"
                    }
                    alt={product.title}
                    className="card-img-top"
                  />
                </Link>

                <div className="card-body">
                  <h6 className="fw-bold">{product.title}</h6>
                  <p className="text-warning fw-bold">KES {product.price}</p>
                </div>

                <div className="card-footer bg-white text-center">
                  <Link
                    to={`/product/${product._id}`}
                    className="btn btn-warning btn-sm w-100"
                  >
                    View Product Details
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      <div className="my-5"></div>
     
    </div>
  );
};

export default ProductsPage;
