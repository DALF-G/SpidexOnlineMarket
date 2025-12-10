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

// Helper: nice number formatting
const formatKES = (n) =>
  typeof n === "number" ? `KES ${n.toLocaleString()}` : n || "KES 0";

// today helper
const daysBetween = (a, b = new Date()) =>
  Math.round(Math.abs((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24)));

const PER_PAGE_DEFAULT = 8;

const ProductsPage = () => {
  // moved inside component
  const { user } = useContext(AuthContext);

  // Detect user role for routing
  const isBuyer = user?.role === "buyer";

  const locationHook = useLocation();
  const navigate = useNavigate();

  // Data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // category objects: { _id, name, subcategories }
  const [loading, setLoading] = useState(true);

  // Filters & UI state
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [sort, setSort] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(""); // id or name
  const [selectedSub, setSelectedSub] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [locationText, setLocationText] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PER_PAGE_DEFAULT);
  const [infinite, setInfinite] = useState(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Compare & saved searches
  const [compareIds, setCompareIds] = useState([]);
  const [savedSearches, setSavedSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("saved_searches") || "[]");
    } catch {
      return [];
    }
  });

  // Recently viewed
  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recently_viewed") || "[]");
    } catch {
      return [];
    }
  });

  // pagination controls computed list filtered
  const [filtered, setFiltered] = useState([]);
  const [expandedCats, setExpandedCats] = useState({}); // id: bool

  // For infinite scroll debounce
  const infiniteRef = useRef(false);

  // when route has ?category=... preselect
  useEffect(() => {
    const q = new URLSearchParams(locationHook.search);
    const cat = q.get("category");
    if (cat) {
      setSelectedCategory(cat);
      setPage(1);
    }
  }, [locationHook.search]);

  // load products + categories
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [pRes, cRes] = await Promise.all([axios.get(`${PRODUCTS_API}/`), axios.get(CATEGORIES_API)]);
        const prods = pRes.data?.products || pRes.data || [];
        setProducts(prods);
        setFiltered(prods);

        const cats = cRes.data?.categories || cRes.data || [];
        setCategories(cats);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed loading products or categories");
        setLoading(false);
      }
    };
    load();
  }, []);

  // counts per category memoized
  const countsByCategory = useMemo(() => {
    const map = {};
    for (const p of products || []) {
      const key = (p.category || "Uncategorized").toString();
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [products]);

  // Master filtering (applies all filters) -> creates filtered list
  useEffect(() => {
    let results = [...(products || [])];

    // category filter (category stored either by name or id)
    if (selectedCategory) {
      // find category object
      const catObj =
        (categories || []).find((c) => c._id === selectedCategory) ||
        (categories || []).find((c) => c.name === selectedCategory);
      if (catObj) {
        results = results.filter(
          (r) => (r.category || "").toLowerCase() === (catObj.name || "").toLowerCase()
        );
      } else {
        results = results.filter(
          (r) => (r.category || "").toLowerCase() === selectedCategory.toLowerCase()
        );
      }
    }

    // subcategory filter
    if (selectedSub) {
      results = results.filter(
        (r) => (r.subCategory || "").toLowerCase() === selectedSub.toLowerCase()
      );
    }

    // search (smart across title, desc, category, subCategory, seller name)
    if (search.trim() !== "") {
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

    // location text filter
    if (locationText.trim() !== "") {
      const t = locationText.trim().toLowerCase();
      results = results.filter((r) => (r.location || "").toLowerCase().includes(t));
    }

    // condition
    if (condition) {
      results = results.filter((r) => (r.condition || "").toLowerCase() === condition);
    }

    // price
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) results = results.filter((r) => Number(r.price) >= min);
    if (!isNaN(max)) results = results.filter((r) => Number(r.price) <= max);

    // sorting
    if (sort === "low") results.sort((a, b) => a.price - b.price);
    else if (sort === "high") results.sort((a, b) => b.price - a.price);
    else if (sort === "latest") results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sort === "views") results.sort((a, b) => (b.views || 0) - (a.views || 0));

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

  // pagination values
  const totalPages = Math.ceil((filtered?.length || 0) / perPage) || 1;
  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return (filtered || []).slice(start, start + perPage);
  }, [filtered, page, perPage]);

  // Load more: increase page (but not past totalPages)
  const loadMore = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  // Infinite scroll handler
  useEffect(() => {
    infiniteRef.current = infinite;
  }, [infinite]);

  useEffect(() => {
    if (!infinite) return;
    const onScroll = () => {
      if (!infiniteRef.current) return;
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        setPage((p) => Math.min(p + 1, totalPages));
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [totalPages, infinite]);

  // Toggle expanded category
  const toggleExpand = (id) => {
    setExpandedCats((s) => ({ ...s, [id]: !s[id] }));
  };

  // Smart suggestions for search
  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }
    const term = search.trim().toLowerCase();
    const titles = [];
    const cats = new Set();
    const subs = new Set();
    for (const p of products || []) {
      if (p.title?.toLowerCase().includes(term)) titles.push(p.title);
      if (p.category?.toLowerCase().includes(term)) cats.add(p.category);
      if (p.subCategory?.toLowerCase().includes(term)) subs.add(p.subCategory);
      if (titles.length >= 6 && cats.size >= 3 && subs.size >= 3) break;
    }
    const list = [
      ...titles.map((t) => ({ type: "title", value: t })),
      ...Array.from(cats).map((c) => ({ type: "category", value: c })),
      ...Array.from(subs).map((s) => ({ type: "sub", value: s })),
    ].slice(0, 10);
    setSuggestions(list);
  }, [search, products]);

  // Recently viewed: add when user clicks link (we'll provide click handler)
  const onProductClick = (p) => {
    try {
      const cur = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
      // keep unique on _id, latest first, max 8
      const filteredCur = [p, ...cur.filter((x) => x._id !== p._id)].slice(0, 8);
      localStorage.setItem("recently_viewed", JSON.stringify(filteredCur));
      setRecent(filteredCur);
    } catch {
      // ignore
    }
  };

  // Save a search
  const saveCurrentSearch = () => {
    const searchObj = {
      name: `${search || "search"} ${selectedCategory || ""} ${selectedSub || ""}`.trim(),
      params: {
        search,
        selectedCategory,
        selectedSub,
        minPrice,
        maxPrice,
        condition,
        locationText,
        sort,
      },
      createdAt: new Date().toISOString(),
      id: Date.now().toString(),
    };
    const newList = [searchObj, ...savedSearches].slice(0, 10);
    setSavedSearches(newList);
    localStorage.setItem("saved_searches", JSON.stringify(newList));
    toast.success("Search saved");
  };

  const applySavedSearch = (s) => {
    const p = s.params || {};
    setSearch(p.search || "");
    setSelectedCategory(p.selectedCategory || "");
    setSelectedSub(p.selectedSub || "");
    setMinPrice(p.minPrice || "");
    setMaxPrice(p.maxPrice || "");
    setCondition(p.condition || "");
    setLocationText(p.locationText || "");
    setSort(p.sort || "");
    toast.info("Saved search applied");
  };

  const removeSavedSearch = (id) => {
    const nxt = savedSearches.filter((s) => s.id !== id);
    setSavedSearches(nxt);
    localStorage.setItem("saved_searches", JSON.stringify(nxt));
    toast.info("Saved search removed");
  };

  // compare toggling
  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) {
        toast.warning("You can compare up to 4 products");
        return prev;
      }
      return [...prev, id];
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSort("");
    setSelectedCategory("");
    setSelectedSub("");
    setMinPrice("");
    setMaxPrice("");
    setCondition("");
    setLocationText("");
    setPage(1);
  };

  // apply suggestion
  const onSuggestionClick = (s) => {
    if (s.type === "title") setSearch(s.value);
    else if (s.type === "category") {
      // find category object by name
      const catObj = (categories || []).find((c) => (c.name || "").toLowerCase() === s.value.toLowerCase());
      setSelectedCategory(catObj?._id || s.value);
      setSelectedSub("");
    } else if (s.type === "sub") setSelectedSub(s.value);
    setSuggestions([]);
  };

  // toggle view mode
  const toggleView = (m) => {
    setViewMode(m);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // generate product badge labels
  const getBadges = (p) => {
    const badges = [];
    if (p.isFeatured) badges.push({ text: "Featured", className: "bg-warning text-dark" });
    if ((p.views || 0) >= 50) badges.push({ text: "Hot", className: "bg-danger" });
    if (daysBetween(p.createdAt) <= 3) badges.push({ text: "New", className: "bg-success" });
    return badges;
  };

  // --- NEW: openProductView that enforces login and routes by role ---
  const openProductView = (id) => {
    if (!user) {
      toast.warning("Please login first");
      navigate("/login");
      return;
    }

    if (user.role === "buyer") {
      navigate(`/buyer-dashboard/product/${id}`);
      return;
    }

    if (user.role === "seller") {
      navigate(`/seller-dashboard/products/view`);
      return;
    }

    // default (admin or other roles)
    navigate(`/admin-dashboard/products`);
  };

  // If loading show spinner
  if (loading) return <p className="text-center mt-5">Loading products...</p>;

  // For UI: items to render when infinite false -> paginated; when infinite true -> show first page*page items
  const itemsToRender = infinite ? (filtered || []).slice(0, page * perPage) : paginated;

  return (
    <>
      {/* <MyNavbar /> */}
      <ToastContainer />
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h3 className="text-warning mb-0">Products</h3>
            <small className="text-muted">Browse listings</small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="btn-group me-2">
              <button
                className={`btn btn-sm ${viewMode === "grid" ? "btn-warning" : "btn-outline-secondary"}`}
                onClick={() => toggleView("grid")}
                title="Grid view"
              >
                Grid
              </button>
              <button
                className={`btn btn-sm ${viewMode === "list" ? "btn-warning" : "btn-outline-secondary"}`}
                onClick={() => toggleView("list")}
                title="List view"
              >
                List
              </button>
            </div>

            <div className="btn-group me-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setPerPage(8);
                  setPage(1);
                }}
                title="Show 8 per page"
              >
                8
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setPerPage(16);
                  setPage(1);
                }}
              >
                16
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setPerPage(32);
                  setPage(1);
                }}
              >
                32
              </button>
            </div>

            <div className="form-check form-switch d-flex align-items-center">
              <input
                id="infiniteSwitch"
                className="form-check-input"
                type="checkbox"
                checked={infinite}
                onChange={(e) => {
                  setInfinite(e.target.checked);
                  setPage(1);
                }}
              />
              <label className="form-check-label ms-2" htmlFor="infiniteSwitch">
                Infinite scroll
              </label>
            </div>
          </div>
        </div>

        <div className="row">
          {/* SIDEBAR */}
          <aside className={`col-md-3 mb-3 ${showFiltersMobile ? "d-block" : "d-none d-md-block"}`}>
            <div className="card shadow-sm p-3 sticky-top" style={{ top: 20 }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>Filters</strong>
                <button
                  className="btn btn-sm btn-outline-secondary d-md-none"
                  onClick={() => setShowFiltersMobile(false)}
                >
                  Close
                </button>
              </div>

              {/* Categories */}
              <div className="mb-3">
                <div className="mb-2 fw-bold">Categories</div>
                <div className="small text-muted mb-2">Click to expand subcategories</div>
                {categories.length === 0 ? (
                  <div className="text-muted">No categories</div>
                ) : (
                  categories.map((c) => {
                    const catName = c.name;
                    const count = countsByCategory[catName] || 0;
                    return (
                      <div key={c._id || c.name} className="mb-2">
                        <div className="d-flex justify-content-between align-items-center" style={{ cursor: "pointer" }}>
                          <div
                            onClick={() => {
                              setSelectedCategory(selectedCategory === (c._id || c.name) ? "" : (c._id || c.name));
                              setSelectedSub("");
                            }}
                            className="d-flex align-items-center"
                          >
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary me-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(c._id);
                              }}
                            >
                              {expandedCats[c._id] ? "-" : "+"}
                            </button>
                            <span>{c.name}</span>
                            <small className="text-muted ms-2">({count})</small>
                          </div>

                          <div>
                            <button
                              className={`btn btn-sm ${selectedCategory === (c._id || c.name) ? "btn-warning" : "btn-outline-secondary"}`}
                              onClick={() =>
                                setSelectedCategory(selectedCategory === (c._id || c.name) ? "" : (c._id || c.name))
                              }
                            >
                              {selectedCategory === (c._id || c.name) ? "Selected" : "Select"}
                            </button>
                          </div>
                        </div>

                        {expandedCats[c._id] && (
                          <div className="ps-4 mt-1">
                            {c.subcategories && c.subcategories.length > 0 ? (
                              c.subcategories.map((sub, i) => (
                                <div key={i} className="d-flex justify-content-between align-items-center mb-1">
                                  <div
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                      setSelectedCategory(c._id || c.name);
                                      setSelectedSub(sub);
                                      setPage(1);
                                    }}
                                  >
                                    <small className={selectedSub === sub ? "fw-bold" : ""}>{sub}</small>
                                  </div>
                                  <small className="text-muted">
                                    {
                                      (products || []).filter(
                                        (p) =>
                                          (p.category || "").toLowerCase() === (c.name || "").toLowerCase() &&
                                          (p.subCategory || "").toLowerCase() === (sub || "").toLowerCase()
                                      ).length
                                    }
                                  </small>
                                </div>
                              ))
                            ) : (
                              <div className="text-muted small">No subcategories</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <hr />

              {/* Price slider / inputs */}
              <div className="mb-3">
                <div className="fw-bold mb-1">Price</div>
                <div className="d-flex gap-2 mb-2">
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
                <div className="small text-muted">Tip: use min & max for tighter results</div>
              </div>

              {/* Condition */}
              <div className="mb-3">
                <div className="fw-bold mb-1">Condition</div>
                <select className="form-select form-select-sm" value={condition} onChange={(e) => setCondition(e.target.value)}>
                  <option value="">Any</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>

              {/* Location */}
              <div className="mb-3">
                <div className="fw-bold mb-1">Location</div>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="City or area (e.g. Nairobi)"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                />
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-warning w-100"
                  onClick={() => {
                    setShowFiltersMobile(false);
                    setPage(1);
                  }}
                >
                  Apply
                </button>
                <button className="btn btn-sm btn-outline-secondary w-100" onClick={clearFilters}>
                  Reset
                </button>
              </div>

              <hr />

              {/* Saved searches */}
              <div className="mb-2">
                <div className="fw-bold">Saved Searches</div>
                <div className="small text-muted mb-2">Save your current filters to revisit later</div>
                <div className="d-grid gap-2 mb-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={saveCurrentSearch}>
                    Save current search
                  </button>
                </div>
                {savedSearches.length === 0 ? (
                  <div className="text-muted small">No saved searches</div>
                ) : (
                  (savedSearches || []).map((s) => (
                    <div key={s.id} className="d-flex justify-content-between align-items-center mb-1">
                      <div>
                        <small style={{ display: "block" }}>{s.name}</small>
                        <small className="text-muted">{new Date(s.createdAt).toLocaleString()}</small>
                      </div>
                      <div>
                        <button className="btn btn-sm btn-outline-success me-1" onClick={() => applySavedSearch(s)}>
                          Apply
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => removeSavedSearch(s.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* MAIN */}
          <main className="col-md-9">
            {/* top control card */}
            <div className="card shadow-sm p-3 mb-3">
              <div className="row g-2 align-items-center">
                <div className="col-md-5 d-flex align-items-center gap-2">
                  <div style={{ position: "relative", flexGrow: 1 }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search products, categories, sellers..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {suggestions.length > 0 && (
                      <div
                        className="card position-absolute"
                        style={{ zIndex: 30, width: "100%", maxHeight: 220, overflow: "auto" }}
                      >
                        {suggestions.map((s, i) => (
                          <div
                            key={i}
                            className="p-2 suggestion hover"
                            style={{ cursor: "pointer" }}
                            onClick={() => onSuggestionClick(s)}
                          >
                            <small>
                              <strong>{s.type}</strong> — {s.value}
                            </small>
                          </div>
                        ))} 
                      </div>
                    )}
                  </div>

                  <button className="btn btn-outline-secondary" onClick={() => setSearch("")}>
                    Clear
                  </button>
                </div>

                <div className="col-md-3">
                  <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="">Sort By</option>
                    <option value="latest">Latest</option>
                    <option value="low">Price: Low → High</option>
                    <option value="high">Price: High → Low</option>
                    <option value="views">Most Viewed</option>
                  </select>
                </div>

                <div className="col-md-4 text-end">
                  <small className="text-muted">
                    Showing <strong>{(filtered || []).length}</strong> results
                  </small>
                </div>
              </div>

              {/* active filter chips */}
              <div className="mt-3">
                <div className="d-flex flex-wrap gap-2">
                  {search && (
                    <span className="badge bg-light border">
                      Search: {search} <button className="btn btn-sm btn-link p-0 ms-2" onClick={() => setSearch("")}>×</button>
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="badge bg-light border">
                      Category: {(() => {
                        const c = (categories || []).find((x) => x._id === selectedCategory);
                        return c ? c.name : selectedCategory;
                      })()}
                      <button className="btn btn-sm btn-link p-0 ms-2" onClick={() => { setSelectedCategory(""); setSelectedSub(""); }}>×</button>
                    </span>
                  )}
                  {selectedSub && (
                    <span className="badge bg-light border">
                      Sub: {selectedSub}
                      <button className="btn btn-sm btn-link p-0 ms-2" onClick={() => setSelectedSub("")}>×</button>
                    </span>
                  )}
                  {minPrice && <span className="badge bg-light border">Min: {minPrice} <button className="btn btn-sm btn-link p-0 ms-2" onClick={() => setMinPrice("")}>×</button></span>}
                  {maxPrice && <span className="badge bg-light border">Max: {maxPrice} <button className="btn btn-sm btn-link p-0 ms-2" onClick={() => setMaxPrice("")}>×</button></span>}
                  {condition && <span className="badge bg-light border">Condition: {condition} <button className="btn btn-sm btn-link p-0 ms-2" onClick={() => setCondition("")}>×</button></span>}
                  {locationText && <span className="badge bg-light border">Location: {locationText} <button className="btn btn-sm btn-link p-0 ms-2" onClick={() => setLocationText("")}>×</button></span>}
                  {(search || selectedCategory || selectedSub || minPrice || maxPrice || condition || locationText) && (
                    <button className="btn btn-sm btn-outline-danger ms-2" onClick={clearFilters}>Clear all</button>
                  )}
                </div>
              </div>
            </div>

            {/* Product grid / list */}
            {itemsToRender.length === 0 ? (
              <div className="alert alert-warning">No products found.</div>
            ) : (
              <div className="row g-4">
                {itemsToRender.map((p) => {
                  const badges = getBadges(p);
                  return (
                    <div key={p._id} className={viewMode === "grid" ? "col-lg-3 col-md-4 col-sm-6" : "col-12"}>
                      <div className="card h-100 shadow-sm">
                        <div className="position-relative">
                          <Link to={`/product/${p._id}`} onClick={() => onProductClick(p)}>
                            <img
                              src={p.photos?.[0] || "https://via.placeholder.com/400x300"}
                              alt={p.title}
                              className="card-img-top"
                              style={{ height: viewMode === "grid" ? 180 : 240, objectFit: "cover" }}
                            />
                          </Link>

                          <div style={{ position: "absolute", top: 8, left: 8 }}>
                            {badges.map((b, i) => (
                              <span key={i} className={`badge me-1 ${b.className}`} style={{ fontSize: 12 }}>
                                {b.text}
                              </span>
                            ))}
                          </div>

                          <div style={{ position: "absolute", top: 8, right: 8 }}>
                            <input
                              type="checkbox"
                              title="Compare"
                              checked={compareIds.includes(p._id)}
                              onChange={() => toggleCompare(p._id)}
                            />
                          </div>
                        </div>

                        <div className="card-body">
                          <h6 className="fw-bold mb-1">{p.title}</h6>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="text-warning fw-bold">{formatKES(p.price)}</div>
                            <small className="text-muted">{p.location}</small>
                          </div>
                          <p className="small text-muted mb-1">
                            {p.category} • {p.subCategory || "—"}
                          </p>
                          {viewMode === "list" && <p className="small">{p.description}</p>}
                        </div>

                        <div className="card-footer bg-white d-flex gap-2">
                          {/* UPDATED: use button & openProductView to route by role and require login */}
                          <button
                            className="btn btn-warning btn-sm w-100"
                            onClick={() => {
                              onProductClick(p);
                              openProductView(p._id);
                            }}
                          >
                            View
                          </button>

                          {/* <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => {
                              navigator.clipboard?.writeText(window.location.origin + `/product/${p._id}`);
                              toast.info("Product link copied");
                            }}
                          >
                            Share
                          </button> */}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination / load more / compare area */}
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div>
                {!infinite ? (
                  <nav>
                    <ul className="pagination pagination-sm">
                      <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                          Prev
                        </button>
                      </li>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
                          <button className="page-link" onClick={() => setPage(i + 1)}>
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                ) : (
                  <div>
                    <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                      Load previous
                    </button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                      Load more
                    </button>
                  </div>
                )}
              </div>

              <div className="d-flex gap-2 align-items-center">
                {page < totalPages && (
                  <button className="btn btn-outline-primary btn-sm" onClick={loadMore}>
                    Load more
                  </button>
                )}

                <div>
                  <small className="text-muted">
                    Page {page} of {totalPages}
                  </small>
                </div>

                <div>
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={() => {
                      if (compareIds.length < 2) {
                        toast.info("Select at least 2 products to compare");
                        return;
                      }
                      document.getElementById("compare-panel")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Compare ({compareIds.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Recently viewed */}
            {recent && recent.length > 0 && (
              <div className="mt-4">
                <h5 className="text-success">Recently viewed</h5>
                <div className="row g-3">
                  {recent.map((r) => (
                    <div key={r._id} className="col-md-3 col-sm-6">
                      <div className="card">
                        <Link to={`/product/${r._id}`} onClick={() => onProductClick(r)}>
                          <img src={r.photos?.[0] || "https://via.placeholder.com/200"} alt={r.title} className="card-img-top" style={{ height: 120, objectFit: "cover" }} />
                        </Link>
                        <div className="card-body small">
                          <div className="fw-bold">{r.title}</div>
                          <div className="text-warning">{formatKES(r.price)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compare panel */}
            <div id="compare-panel" className="mt-4">
              {compareIds.length > 0 && (
                <div className="card shadow-sm p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>Compare products</strong>
                    <div>
                      <button className="btn btn-sm btn-outline-danger me-2" onClick={() => setCompareIds([])}>
                        Clear
                      </button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => window.print()}>
                        Print
                      </button>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Property</th>
                          {compareIds.map((id) => {
                            const p = (products || []).find((x) => x._id === id) || {};
                            return <th key={id}>{p.title || "N/A"}</th>;
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Image</td>
                          {compareIds.map((id) => {
                            const p = (products || []).find((x) => x._id === id) || {};
                            return (
                              <td key={id}>
                                <img src={p.photos?.[0] || "https://via.placeholder.com/120x80"} alt={p.title} style={{ width: 120, height: 80, objectFit: "cover" }} />
                              </td>
                            );
                          })}
                        </tr>

                        <tr>
                          <td>Price</td>
                          {compareIds.map((id) => {
                            const p = (products || []).find((x) => x._id === id) || {};
                            return <td key={id}>{formatKES(p.price)}</td>;
                          })}
                        </tr>

                        <tr>
                          <td>Category</td>
                          {compareIds.map((id) => {
                            const p = (products || []).find((x) => x._id === id) || {};
                            return <td key={id}>{p.category} / {p.subCategory}</td>;
                          })}
                        </tr>

                        <tr>
                          <td>Condition</td>
                          {compareIds.map((id) => {
                            const p = (products || []).find((x) => x._id === id) || {};
                            return <td key={id}>{p.condition}</td>;
                          })}
                        </tr>

                        <tr>
                          <td>Location</td>
                          {compareIds.map((id) => {
                            const p = (products || []).find((x) => x._id === id) || {};
                            return <td key={id}>{p.location}</td>;
                          })}
                        </tr>

                        <tr>
                          <td>Seller</td>
                          {compareIds.map((id) => {
                            const p = (products || []).find((x) => x._id === id) || {};
                            return <td key={id}>{p.seller?.name || "N/A"}</td>;
                          })}
                        </tr>

                        <tr>
                          <td>Actions</td>
                          {compareIds.map((id) => {
                            const p = (products || []).find((x) => x._id === id) || {};
                            return (
                              <td key={id}>
                                {/* UPDATED: route via openProductView so role + login enforced */}
                                <button className="btn btn-sm btn-warning me-2" onClick={() => openProductView(id)}>
                                  View
                                </button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => toggleCompare(id)}>
                                  Remove
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* <MyFooter /> */}
    </>
  );
};

export default ProductsPage;
