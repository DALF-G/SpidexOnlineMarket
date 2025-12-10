// src/components/ProductsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
// import MyNavbar from "./MyNavbar";
// import MyFooter from "./MyFooter";
import "react-toastify/dist/ReactToastify.css";

const PRODUCTS_API = "https://spidexmarket.onrender.com/api/product";
const CATEGORIES_API = "https://spidexmarket.onrender.com/api/category";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSub, setSelectedSub] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");

  // pagination
  const [itemsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  // sidebar expand
  const [expandedCats, setExpandedCats] = useState({});
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const toggleExpand = (id) => {
    setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const locationHook = useLocation();
  useEffect(() => {
    const q = new URLSearchParams(locationHook.search);
    const cat = q.get("category");
    if (cat) setSelectedCategory(cat);
  }, [locationHook.search]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [pRes, cRes] = await Promise.all([
          axios.get(`${PRODUCTS_API}/`),
          axios.get(CATEGORIES_API),
        ]);

        const prods = pRes.data?.products || [];
        setProducts(prods);
        setFiltered(prods);

        const cats = cRes.data?.categories || [];
        setCategories(cats);

        setLoading(false);
      } catch (err) {
        setLoading(false);
        toast.error("Failed loading data");
      }
    };

    load();
  }, []);

  // CATEGORY COUNTS
  const countsByCategory = useMemo(() => {
    const map = {};
    for (const p of products) {
      const key = p.category || "Other";
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [products]);

  // FILTER ENGINE
  useEffect(() => {
    let results = [...products];

    // Category filter
    if (selectedCategory) {
      const catObj =
        categories.find((c) => c._id === selectedCategory) ||
        categories.find((c) => c.name === selectedCategory);

      if (catObj) {
        results = results.filter(
          (r) =>
            (r.category || "").toLowerCase() === (catObj.name || "").toLowerCase()
        );
      }
    }

    // Subcategory
    if (selectedSub) {
      results = results.filter(
        (r) => (r.subCategory || "").toLowerCase() === selectedSub.toLowerCase()
      );
    }

    // Search
    if (search.trim() !== "") {
      const term = search.toLowerCase();
      results = results.filter((r) => {
        const combined = [
          r.title,
          r.description,
          r.category,
          r.subCategory,
          r.location,
          r.seller?.name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return combined.includes(term);
      });
    }

    // Location
    if (location.trim() !== "") {
      const term = location.toLowerCase();
      results = results.filter((r) =>
        (r.location || "").toLowerCase().includes(term)
      );
    }

    // Condition
    if (condition) {
      results = results.filter(
        (r) => (r.condition || "").toLowerCase() === condition
      );
    }

    // Price range
    const min = Number(minPrice);
    const max = Number(maxPrice);

    if (!isNaN(min)) results = results.filter((r) => r.price >= min);
    if (!isNaN(max)) results = results.filter((r) => r.price <= max);

    // Sorting
    if (sort === "low") results.sort((a, b) => a.price - b.price);
    if (sort === "high") results.sort((a, b) => b.price - a.price);
    if (sort === "latest")
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "views")
      results.sort((a, b) => (b.views || 0) - (a.views || 0));

    // apply results
    setFiltered(results);
    setCurrentPage(1); // reset pagination when filters change
  }, [
    products,
    selectedCategory,
    selectedSub,
    search,
    sort,
    minPrice,
    maxPrice,
    condition,
    location,
  ]);

  // PAGINATION + LOAD MORE
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginatedItems = filtered.slice(
    0,
    currentPage * itemsPerPage
  );

  const handleLoadMore = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const setPage = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (loading) return <p className="text-center mt-5">Loading products...</p>;

  return (
    <>
      {/* <MyNavbar /> */}
      <ToastContainer />

      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="text-warning">Products</h3>

          {/* MOBILE FILTER BUTTON */}
          <button
            className="btn btn-outline-secondary d-md-none"
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
          >
            Filters
          </button>
        </div>

        <div className="row">
          {/* SIDEBAR FILTERS */}
          <aside
            className={`col-md-3 mb-3 ${
              showFiltersMobile ? "d-block" : "d-none d-md-block"
            }`}
          >
            <div className="card shadow-sm p-3">
              <h6 className="fw-bold mb-3">Filters</h6>

              {/* CATEGORY LIST */}
              <div className="mb-3">
                <strong className="small">Categories</strong>

                {categories.map((c) => (
                  <div key={c._id} className="mt-2">
                    {/* Category row */}
                    <div
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div
                        className="d-flex align-items-center"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setSelectedCategory(c._id);
                          setSelectedSub("");
                          toggleExpand(c._id);
                        }}
                      >
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(c._id);
                          }}
                        >
                          {expandedCats[c._id] ? "-" : "+"}
                        </button>
                        <span>{c.name}</span>
                        <small className="ms-2 text-muted">
                          ({countsByCategory[c.name] || 0})
                        </small>
                      </div>
                    </div>

                    {/* SUBCATEGORIES */}
                    {expandedCats[c._id] && (
                      <div className="ps-4 mt-1">
                        {c.subcategories?.length > 0 ? (
                          c.subcategories.map((sub, i) => (
                            <div
                              key={i}
                              className="d-flex justify-content-between small mb-1"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                setSelectedCategory(c._id);
                                setSelectedSub(sub);
                              }}
                            >
                              {sub}
                              <span className="text-muted">
                                {
                                  products.filter(
                                    (p) =>
                                      p.category?.toLowerCase() ===
                                        c.name.toLowerCase() &&
                                      (p.subCategory || "").toLowerCase() ===
                                        sub.toLowerCase()
                                  ).length
                                }
                              </span>
                            </div>
                          ))
                        ) : (
                          <small className="text-muted">No subcategories</small>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <hr />

              {/* PRICE */}
              <div className="mb-3">
                <strong className="small">Price</strong>
                <div className="d-flex gap-2 mt-2">
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* CONDITION */}
              <div className="mb-3">
                <strong className="small">Condition</strong>
                <select
                  className="form-select form-select-sm mt-2"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>

              {/* LOCATION */}
              <div className="mb-3">
                <strong className="small">Location</strong>
                <input
                  type="text"
                  className="form-control form-control-sm mt-2"
                  placeholder="City or area"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <button
                className="btn btn-warning btn-sm w-100"
                onClick={() => setShowFiltersMobile(false)}
              >
                Done
              </button>

              <button
                className="btn btn-outline-secondary btn-sm w-100 mt-2"
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedSub("");
                  setSearch("");
                  setSort("");
                  setMinPrice("");
                  setMaxPrice("");
                  setCondition("");
                  setLocation("");
                }}
              >
                Reset All
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="col-md-9">
            {/* TOP CONTROLS */}
            <div className="card shadow-sm p-3 mb-3">
              <div className="row g-2 align-items-center">
                <div className="col-md-5 d-flex">
                  <input
                    type="text"
                    className="form-control me-2"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button className="btn btn-outline-secondary" onClick={() => setSearch("")}>
                    Clear
                  </button>
                </div>

                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="">Sort By</option>
                    <option value="latest">Latest</option>
                    <option value="low">Price: Low → High</option>
                    <option value="high">Price: High → Low</option>
                    <option value="views">Most Viewed</option>
                  </select>
                </div>

                <div className="col-md-4 text-end">
                  <small className="text-muted">
                    Showing <strong>{paginatedItems.length}</strong> of{" "}
                    <strong>{filtered.length}</strong> products
                  </small>
                </div>
              </div>
            </div>

            {/* PRODUCT GRID */}
            {paginatedItems.length === 0 ? (
              <div className="alert alert-warning text-center">No products found.</div>
            ) : (
              <div className="row g-4">
                {paginatedItems.map((product) => (
                  <div key={product._id} className="col-lg-3 col-md-4 col-sm-6">
                    <div className="card h-100 shadow-sm">
                      <Link to={`/product/${product._id}`}>
                        <img
                          src={product.photos?.[0] || "https://via.placeholder.com/300"}
                          className="card-img-top"
                          style={{ height: 180, objectFit: "cover" }}
                          alt={product.title}
                        />
                      </Link>

                      <div className="card-body">
                        <h6 className="fw-bold small">{product.title}</h6>
                        <p className="text-warning fw-bold mb-1">
                          KES {Number(product.price).toLocaleString()}
                        </p>
                        <p className="small text-muted mb-0">
                          {product.category} • {product.subCategory || "—"}
                        </p>
                        <p className="small text-muted mb-0">
                          Location: {product.location || "N/A"}
                        </p>
                      </div>

                      <div className="card-footer bg-white text-center">
                        <Link
                          to={`/product/${product._id}`}
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

            {/* LOAD MORE BUTTON */}
            {currentPage < totalPages && (
              <div className="text-center mt-4">
                <button className="btn btn-warning px-4" onClick={handleLoadMore}>
                  Load More
                </button>
              </div>
            )}

            {/* PAGINATION NUMBERS */}
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <li
                      key={page}
                      className={`page-item ${
                        page === currentPage ? "active" : ""
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="page-link" onClick={() => setPage(page)}>
                        {page}
                      </span>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </main>
        </div>
      </div>

      {/* <MyFooter /> */}
    </>
  );
};

export default ProductsPage;
