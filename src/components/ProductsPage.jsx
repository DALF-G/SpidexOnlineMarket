
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useContext,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../context/AuthContext";

const PRODUCTS_API = "https://spidexmarket.onrender.com/api/product";
const CATEGORIES_API = "https://spidexmarket.onrender.com/api/category";

const formatKES = (n) =>
  typeof n === "number" ? `KES ${n.toLocaleString()}` : n || "KES 0";

const daysBetween = (a, b = new Date()) =>
  Math.round(Math.abs((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24)));

const PER_PAGE_DEFAULT = 8;

const ProductsPage = () => {
  const { user } = useContext(AuthContext);

  const isBuyer = user?.role === "buyer";
  const isSeller = user?.role === "seller";
  const isAdmin = user?.role === "admin";

  const locationHook = useLocation();
  const navigate = useNavigate();

  // DATA
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // FILTERS
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [sort, setSort] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSub, setSelectedSub] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [locationText, setLocationText] = useState("");

  // VIEW + PAGINATION
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PER_PAGE_DEFAULT);
  const [infinite, setInfinite] = useState(false);
  const infiniteRef = useRef(false);

  const [filtered, setFiltered] = useState([]);
  const [expandedCats, setExpandedCats] = useState({});

  // Compare + Saved searches
  const [compareIds, setCompareIds] = useState([]);
  const [savedSearches, setSavedSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("saved_searches") || "[]");
    } catch {
      return [];
    }
  });

  // Recently Viewed
  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recently_viewed") || "[]");
    } catch {
      return [];
    }
  });

  // Handle ?category= query param
  useEffect(() => {
    const q = new URLSearchParams(locationHook.search);
    const cat = q.get("category");
    if (cat) setSelectedCategory(cat);
  }, [locationHook.search]);

  // Load products & categories
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [pRes, cRes] = await Promise.all([
          axios.get(`${PRODUCTS_API}/`),
          axios.get(CATEGORIES_API),
        ]);

        const prods = pRes.data?.products || pRes.data || [];
        setProducts(prods);
        setFiltered(prods);

        const cats = cRes.data?.categories || cRes.data || [];
        setCategories(cats);

        setLoading(false);
      } catch (err) {
        toast.error("Failed loading products");
        setLoading(false);
      }
    };

    load();
  }, []);

  // Count products per category
  const countsByCategory = useMemo(() => {
    const map = {};
    for (const p of products) {
      const key = p.category || "Other";
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [products]);

  // MASTER FILTERING
  useEffect(() => {
    let results = [...products];

    if (selectedCategory) {
      const catObj =
        categories.find((c) => c._id === selectedCategory) ||
        categories.find((c) => c.name === selectedCategory);

      results = results.filter(
        (r) =>
          (r.category || "").toLowerCase() ===
          (catObj?.name || selectedCategory).toLowerCase()
      );
    }

    if (selectedSub) {
      results = results.filter(
        (r) =>
          (r.subCategory || "").toLowerCase() === selectedSub.toLowerCase()
      );
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase();
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

    if (locationText.trim()) {
      const t = locationText.trim().toLowerCase();
      results = results.filter((r) =>
        (r.location || "").toLowerCase().includes(t)
      );
    }

    if (condition)
      results = results.filter(
        (r) => (r.condition || "").toLowerCase() === condition
      );

    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) results = results.filter((r) => Number(r.price) >= min);
    if (!isNaN(max)) results = results.filter((r) => Number(r.price) <= max);

    if (sort === "low") results.sort((a, b) => a.price - b.price);
    else if (sort === "high") results.sort((a, b) => b.price - a.price);
    else if (sort === "latest")
      results.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    else if (sort === "views")
      results.sort((a, b) => (b.views || 0) - (a.views || 0));

    setFiltered(results);
    setPage(1);
  }, [
    products,
    categories,
    selectedCategory,
    selectedSub,
    search,
    sort,
    minPrice,
    maxPrice,
    condition,
    locationText,
  ]);

  // Pagination
  const totalPages =
    Math.ceil((filtered?.length || 0) / perPage) || 1;

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  const itemsToRender = infinite
    ? filtered.slice(0, page * perPage)
    : paginated;

  // Infinite scroll logic
  useEffect(() => {
    infiniteRef.current = infinite;
  }, [infinite]);

  useEffect(() => {
    if (!infinite) return;

    const onScroll = () => {
      if (!infiniteRef.current) return;

      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300
      ) {
        setPage((p) => Math.min(p + 1, totalPages));
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [infinite, totalPages]);

  // CATEGORY EXPAND
  const toggleExpand = (id) =>
    setExpandedCats((s) => ({ ...s, [id]: !s[id] }));

  // SEARCH SUGGESTIONS
  useEffect(() => {
    if (!search.trim()) return setSuggestions([]);

    const term = search.trim().toLowerCase();
    const titles = [];
    const cats = new Set();
    const subs = new Set();

    for (const p of products) {
      if (p.title?.toLowerCase().includes(term)) titles.push(p.title);
      if (p.category?.toLowerCase().includes(term)) cats.add(p.category);
      if (p.subCategory?.toLowerCase().includes(term)) subs.add(p.subCategory);
    }

    const list = [
      ...titles.map((t) => ({ type: "title", value: t })),
      ...[...cats].map((c) => ({ type: "category", value: c })),
      ...[...subs].map((s) => ({ type: "sub", value: s })),
    ].slice(0, 10);

    setSuggestions(list);
  }, [search, products]);

  // RECENTLY VIEWED
  const onProductClick = (p) => {
    try {
      const cur = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
      const updated = [p, ...cur.filter((x) => x._id !== p._id)].slice(0, 8);
      localStorage.setItem("recently_viewed", JSON.stringify(updated));
      setRecent(updated);
    } catch {}
  };

  // ROLE-BASED ROUTING
  const openProductView = (id) => {
    if (!user) {
      toast.warning("Please login first");
      navigate("/login");
      return;
    }

    if (isBuyer) {
      navigate(`/buyer-dashboard/product/${id}`);
      return;
    }

    if (isSeller) {
      navigate("/seller-dashboard/products/view", {
        state: { productId: id },
      });
      return;
    }

    if (isAdmin) {
      navigate("/admin-dashboard/products/view", {
        state: { productId: id },
      });
      return;
    }

    toast.info("Unauthorized role");
  };

  // BADGES
  const getBadges = (p) => {
    const b = [];
    if (p.isFeatured) b.push({ text: "Featured", className: "bg-warning text-dark" });
    if ((p.views || 0) >= 50) b.push({ text: "Hot", className: "bg-danger" });
    if (daysBetween(p.createdAt) <= 3) b.push({ text: "New", className: "bg-success" });
    return b;
  };

  // =========================
  //         RENDER
  // =========================

  if (loading)
    return <p className="text-center mt-4">Loading products...</p>;

  return (
    <>
      <ToastContainer />

      <div className="container py-4">
        {/* PAGE HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h3 className="text-warning mb-0">Products</h3>
            <small className="text-muted">Browse listings</small>
          </div>

          {/* VIEW CONTROLS */}
          <div className="d-flex align-items-center gap-2">
            <div className="btn-group me-2">
              <button
                className={`btn btn-sm ${
                  viewMode === "grid" ? "btn-warning" : "btn-outline-secondary"
                }`}
                onClick={() => setViewMode("grid")}
              >
                Grid
              </button>
              <button
                className={`btn btn-sm ${
                  viewMode === "list" ? "btn-warning" : "btn-outline-secondary"
                }`}
                onClick={() => setViewMode("list")}
              >
                List
              </button>
            </div>

            {/* Per Page */}
            <div className="btn-group me-2">
              {[8, 16, 32].map((num) => (
                <button
                  key={num}
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setPerPage(num);
                    setPage(1);
                  }}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Infinite Scroll */}
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={infinite}
                onChange={(e) => {
                  setInfinite(e.target.checked);
                  setPage(1);
                }}
              />
              <label className="form-check-label">Infinite scroll</label>
            </div>
          </div>
        </div>

        <div className="row">
          {/* ==========================================================
                    SIDEBAR
          ========================================================== */}
          <aside className="col-md-3 mb-3">
            <div className="card shadow-sm p-3 sticky-top" style={{ top: 20 }}>
              <strong className="mb-2">Filters</strong>

              {/* CATEGORIES */}
              <div className="mb-3">
                <div className="fw-bold mb-1">Categories</div>

                {categories.map((c) => {
                  const count = countsByCategory[c.name] || 0;

                  return (
                    <div key={c._id} className="mb-2">
                      <div
                        className="d-flex justify-content-between"
                        style={{ cursor: "pointer" }}
                      >
                        <div
                          onClick={() => {
                            setSelectedCategory(c._id);
                            setSelectedSub("");
                          }}
                        >
                          {c.name} <small className="text-muted">({count})</small>
                        </div>

                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => toggleExpand(c._id)}
                        >
                          {expandedCats[c._id] ? "-" : "+"}
                        </button>
                      </div>

                      {/* SUBCATEGORIES */}
                      {expandedCats[c._id] && (
                        <div className="ps-3 mt-1">
                          {c.subcategories.map((sub, i) => (
                            <div
                              key={i}
                              className="small"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                setSelectedCategory(c._id);
                                setSelectedSub(sub);
                              }}
                            >
                              {sub}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <hr />

              {/* PRICE */}
              <div className="mb-3">
                <div className="fw-bold mb-1">Price</div>
                <div className="d-flex gap-2">
                  <input
                    className="form-control form-control-sm"
                    placeholder="Min"
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <input
                    className="form-control form-control-sm"
                    placeholder="Max"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* CONDITION */}
              <div className="mb-3">
                <div className="fw-bold mb-1">Condition</div>
                <select
                  className="form-select form-select-sm"
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
                <div className="fw-bold mb-1">Location</div>
                <input
                  className="form-control form-control-sm"
                  placeholder="City"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                />
              </div>

              <div className="d-grid gap-2">
                <button
                  className="btn btn-sm btn-warning"
                  onClick={() => setPage(1)}
                >
                  Apply
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setSearch("");
                    setSort("");
                    setSelectedCategory("");
                    setSelectedSub("");
                    setMinPrice("");
                    setMaxPrice("");
                    setCondition("");
                    setLocationText("");
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </aside>

          {/* ==========================================================
                    PRODUCTS LIST
          ========================================================== */}
          <main className="col-md-9">
            {/* SEARCH + SORT */}
            <div className="card shadow-sm p-3 mb-3">
              <div className="row g-2 align-items-center">
                <div className="col-md-5">
                  <div style={{ position: "relative" }}>
                    <input
                      className="form-control"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />

                    {suggestions.length > 0 && (
                      <div
                        className="card position-absolute"
                        style={{
                          zIndex: 20,
                          width: "100%",
                          maxHeight: 200,
                          overflowY: "auto",
                        }}
                      >
                        {suggestions.map((s, i) => (
                          <div
                            key={i}
                            className="p-2"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              if (s.type === "title") setSearch(s.value);
                              if (s.type === "category")
                                setSelectedCategory(s.value);
                              if (s.type === "sub") setSelectedSub(s.value);
                              setSuggestions([]);
                            }}
                          >
                            <small>
                              <strong>{s.type}</strong> – {s.value}
                            </small>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="">Sort</option>
                    <option value="latest">Latest</option>
                    <option value="low">Price: Low → High</option>
                    <option value="high">Price: High → Low</option>
                    <option value="views">Most Viewed</option>
                  </select>
                </div>

                <div className="col-md-4 text-end">
                  <small className="text-muted">
                    {filtered.length} results
                  </small>
                </div>
              </div>
            </div>

            {/* PRODUCT LIST */}
            {itemsToRender.length === 0 ? (
              <div className="alert alert-warning">No products found</div>
            ) : (
              <div className="row g-4">
                {itemsToRender.map((p) => {
                  const badges = getBadges(p);

                  return (
                    <div
                      key={p._id}
                      className={
                        viewMode === "grid"
                          ? "col-lg-3 col-md-4 col-sm-6"
                          : "col-12"
                      }
                    >
                      <div className="card h-100 shadow-sm">
                        <div className="position-relative">
                          <img
                            src={p.photos?.[0]}
                            alt={p.title}
                            onClick={() => {
                              onProductClick(p);
                              openProductView(p._id);
                            }}
                            style={{
                              height: viewMode === "grid" ? 180 : 240,
                              objectFit: "cover",
                              width: "100%",
                              cursor: "pointer",
                            }}
                          />

                          <div style={{ position: "absolute", top: 8, left: 8 }}>
                            {badges.map((b, i) => (
                              <span
                                key={i}
                                className={`badge ${b.className} me-1`}
                              >
                                {b.text}
                              </span>
                            ))}
                          </div>

                          <div style={{ position: "absolute", top: 8, right: 8 }}>
                            <input
                              type="checkbox"
                              checked={compareIds.includes(p._id)}
                              onChange={() => {
                                if (compareIds.includes(p._id))
                                  setCompareIds((x) =>
                                    x.filter((id) => id !== p._id)
                                  );
                                else if (compareIds.length < 4)
                                  setCompareIds((x) => [...x, p._id]);
                                else toast.warning("Max 4 items");
                              }}
                            />
                          </div>
                        </div>

                        <div className="card-body">
                          <h6 className="fw-bold mb-1">{p.title}</h6>
                          <div className="d-flex justify-content-between">
                            <div className="text-warning fw-bold">
                              {formatKES(p.price)}
                            </div>
                            <small className="text-muted">{p.location}</small>
                          </div>
                          {viewMode === "list" && (
                            <p className="small mt-2">{p.description}</p>
                          )}
                        </div>

                        <div className="card-footer bg-white">
                          <button
                            className="btn btn-warning w-100 btn-sm"
                            onClick={() => {
                              onProductClick(p);
                              openProductView(p._id);
                            }}
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* PAGINATION */}
            {!infinite && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <nav>
                  <ul className="pagination pagination-sm">
                    <li className={`page-item ${page === 1 && "disabled"}`}>
                      <button
                        className="page-link"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Prev
                      </button>
                    </li>

                    {Array.from({ length: totalPages }).map((_, i) => (
                      <li
                        key={i}
                        className={`page-item ${
                          page === i + 1 ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}

                    <li
                      className={`page-item ${
                        page === totalPages && "disabled"
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>

                <small className="text-muted">
                  Page {page} of {totalPages}
                </small>
              </div>
            )}

            {/* COMPARE PANEL */}
            {compareIds.length > 0 && (
              <div className="card shadow-sm p-3 mt-4">
                <div className="d-flex justify-content-between">
                  <strong>Compare Products</strong>

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setCompareIds([])}
                  >
                    Clear
                  </button>
                </div>

                <div className="table-responsive mt-3">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Property</th>
                        {compareIds.map((id) => {
                          const p = products.find((x) => x._id === id);
                          return <th key={id}>{p?.title}</th>;
                        })}
                      </tr>
                    </thead>

                    <tbody>
                      {/* Image Row */}
                      <tr>
                        <td>Image</td>
                        {compareIds.map((id) => {
                          const p = products.find((x) => x._id === id);
                          return (
                            <td key={id}>
                              <img
                                src={p?.photos?.[0]}
                                alt={p?.title}
                                style={{
                                  width: 120,
                                  height: 80,
                                  objectFit: "cover",
                                }}
                              />
                            </td>
                          );
                        })}
                      </tr>

                      {/* Price */}
                      <tr>
                        <td>Price</td>
                        {compareIds.map((id) => {
                          const p = products.find((x) => x._id === id);
                          return <td key={id}>{formatKES(p?.price)}</td>;
                        })}
                      </tr>

                      {/* Category */}
                      <tr>
                        <td>Category</td>
                        {compareIds.map((id) => {
                          const p = products.find((x) => x._id === id);
                          return (
                            <td key={id}>
                              {p?.category} / {p?.subCategory}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Condition */}
                      <tr>
                        <td>Condition</td>
                        {compareIds.map((id) => {
                          const p = products.find((x) => x._id === id);
                          return <td key={id}>{p?.condition}</td>;
                        })}
                      </tr>

                      {/* Location */}
                      <tr>
                        <td>Location</td>
                        {compareIds.map((id) => {
                          const p = products.find((x) => x._id === id);
                          return <td key={id}>{p?.location}</td>;
                        })}
                      </tr>

                      {/* Seller */}
                      <tr>
                        <td>Seller</td>
                        {compareIds.map((id) => {
                          const p = products.find((x) => x._id === id);
                          return <td key={id}>{p?.seller?.name}</td>;
                        })}
                      </tr>

                      {/* Actions */}
                      <tr>
                        <td>Actions</td>
                        {compareIds.map((id) => (
                          <td key={id}>
                            <button
                              className="btn btn-sm btn-warning me-2"
                              onClick={() => openProductView(id)}
                            >
                              View
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                setCompareIds((x) => x.filter((i) => i !== id))
                              }
                            >
                              Remove
                            </button>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* RECENTLY VIEWED */}
            {recent.length > 0 && (
              <div className="mt-3">
                <h5 className="text-success">Recently Viewed</h5>
                <div className="row g-3">
                  {recent.map((r) => (
                    <div className="col-md-3 col-sm-6" key={r._id}>
                      <div className="card">
                        <img
                          src={r.photos?.[0]}
                          alt={r.title}
                          className="card-img-top"
                          style={{ height: 120, objectFit: "cover" }}
                          onClick={() => openProductView(r._id)}
                        />
                        <div className="card-body small">
                          <div className="fw-bold">{r.title}</div>
                          <div className="text-warning">
                            {formatKES(r.price)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
