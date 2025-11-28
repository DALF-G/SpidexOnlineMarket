import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const MyNavbar = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const CATEGORY_API = "https://spidexmarket.onrender.com/api/category";

  // Fetch categories automatically
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await axios.get(CATEGORY_API);
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    loadCategories();
  }, []);

  // handle searching
  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value.trim();
    const category = e.target.category.value;

    // Build query URL
    let url = "/products?";
    if (query) url += `search=${query}&`;
    if (category) url += `category=${category}`;

    navigate(url);
  };

  return (
    <nav className="navbar navbar-expand-md navbar-dark navbar-custom" style={{ backgroundColor: "#150d0de2" }}>
      <div className="container">

        <Link className="navbar-brand text-brand fw-bold" to="/">Spidex Online Market</Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">

          {/* SEARCH BAR */}
          <form className="d-flex ms-md-3 mt-3 mt-md-0" style={{ flexGrow: 1 }} onSubmit={handleSearch}>
            {/* Dynamic Category Dropdown */}
            <select className="form-select me-2" name="category" style={{ maxWidth: 180 }}>
              <option value="">Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            <input
              name="search"
              className="form-control me-2"
              type="search"
              placeholder="Search products..."
            />

            <button className="btn btn-outline-warning" type="submit">Search</button>
          </form>

          {/* NAV LINKS */}
          <ul className="navbar-nav ms-auto mt-3 mt-md-0">

            <li className="nav-item">
              <Link className="nav-link" to="/products">Explore Products</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/register">Sell</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/login">Login</Link>
            </li>

            <li className="nav-item">
              <Link className="btn btn-warning nav-link text-dark ms-md-3 px-3" to="/register">
                Register
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>

          </ul>

        </div>
      </div>
    </nav>
  );
};

export default MyNavbar;
