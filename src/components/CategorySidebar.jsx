import React, { useEffect, useState } from "react";
import axios from "axios";

const CategorySidebar = ({ onSelectCategory, onSelectSubcategory }) => {
  const [categories, setCategories] = useState([]);
  const [expanded, setExpanded] = useState({}); // track which category is expanded
  const [counts, setCounts] = useState({}); // product counts

  const CATEGORY_API = "https://spidexmarket.onrender.com/api/category";
  const PRODUCT_API = "https://spidexmarket.onrender.com/api/product";

  // Load categories
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(CATEGORY_API);
        setCategories(res.data.categories || []);

        fetchCounts(res.data.categories);
      } catch (err) {
        console.error("Failed loading categories", err);
      }
    };

    load();
  }, []);

  // Fetch product count per category
  const fetchCounts = async (cats) => {
    const countObj = {};

    for (let c of cats) {
      try {
        const res = await axios.get(`${PRODUCT_API}/?category=${c.name}`);
        countObj[c._id] = res.data.count || 0;
      } catch {
        countObj[c._id] = 0;
      }
    }

    setCounts(countObj);
  };

  // Toggle expand category
  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="card shadow-sm p-3" style={{ borderRadius: "15px" }}>
      <h5 className="fw-bold mb-3">Categories</h5>

      <ul className="list-group">
        {categories.map((cat) => (
          <li
            key={cat._id}
            className="list-group-item border-0"
            style={{ cursor: "pointer" }}
          >
            <div
              className="d-flex justify-content-between align-items-center"
              onClick={() => {
                toggleExpand(cat._id);
                onSelectCategory(cat.name);
              }}
            >
              <span className="fw-semibold text-dark">{cat.name}</span>

              <span className="badge bg-warning text-dark">
                {counts[cat._id] || 0}
              </span>
            </div>

            {/* Expand Subcategories */}
            {expanded[cat._id] && cat.subcategories?.length > 0 && (
              <ul className="mt-2 ps-3">
                {cat.subcategories.map((sub, idx) => (
                  <li
                    key={idx}
                    className="text-secondary small mb-1"
                    style={{ cursor: "pointer" }}
                    onClick={() => onSelectSubcategory(sub)}
                  >
                    • {sub}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategorySidebar;
