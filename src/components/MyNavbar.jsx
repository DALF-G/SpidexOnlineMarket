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

  return (
    <nav
      className="navbar navbar-expand-md navbar-dark navbar-custom"
      style={{ backgroundColor: "#150d0de2" }}
    >
      <div className="container">

        {/* BRAND */}
        <Link className="navbar-brand text-brand fw-bold" to="/">
          Spidex Market
        </Link>

        {/* TOGGLER */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* NAV CONTENT */}
        <div className="collapse navbar-collapse" id="navbarSupportedContent">

          {/* RIGHT SIDE LINKS */}
          <ul className="navbar-nav ms-auto d-flex align-items-center gap-2 mt-3 mt-md-0">
            
            <li className="nav-item">
              <Link className="nav-link px-3" to="/about">
                About Us
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link px-3" to="/register">
                Sell
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link px-3" to="/login">
                Login
              </Link>
            </li>

            {/* REGISTER BUTTON */}
            <li className="nav-item">
              <Link
                className="btn btn-warning text-dark px-4 ms-md-2"
                to="/register"
              >
                Register
              </Link>
            </li>

          </ul>

        </div>
      </div>
    </nav>
  );
};

export default MyNavbar;
