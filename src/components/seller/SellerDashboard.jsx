import axios from 'axios';
import React, { useEffect, useState } from 'react';

const SellerDashboard = () => {
  const [stats, setStats] = useState({
    seller: {},
    totals: {
      totalProducts: 0,
      soldProducts: 0,
      activeProducts: 0,
      hiddenProducts: 0,
      totalPremiumAds: 0,
      totalMessages: 0,
      avgRating: 0
    },
    recent: {
      products: [],
      premiumAds: []
    }
  });
console.log("This is what is contained inside of products: ", stats.recent.products)

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('https://spidexmarket.onrender.com/api/sellerstats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load seller stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="container my-3">
      <h2 className="text-center text-success mb-4">Seller Dashboard Overview</h2>

      {/* Totals Cards */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        <StatCard title="Total Products" value={stats.totals?.totalProducts || 0} icon="bi-box-seam" />
        <StatCard title="Active Products" value={stats.totals?.activeProducts || 0} icon="bi-bag-check" />
        <StatCard title="Sold Products" value={stats.totals?.soldProducts || 0} icon="bi-cart-check" />
        <StatCard title="Hidden Products" value={stats.totals?.hiddenProducts || 0} icon="bi-eye-slash" />
        <StatCard title="Premium Ads" value={stats.totals?.totalPremiumAds || 0} icon="bi-star-fill" />
        <StatCard title="Messages" value={stats.totals?.totalMessages || 0} icon="bi-chat-left-text" />
        <StatCard title="Average Rating" value={(stats.totals?.avgRating?.toFixed(1)) || 0} icon="bi-star" />
      </div>

      {/* Recent Products */}
<div className="mt-5">
<div className="card shadow-lg">
  <div className="card-header bg-primary text-white">
    <h5><i className="bi bi-box-seam me-2"></i> Recent Products</h5>
  </div>

  <div className="card-body">
    {(!stats?.recent?.products || stats.recent.products.length === 0) ? (
      <p className="text-muted">No recent products.</p>
    ) : (
      <div className="table-responsive">
        <table className="table table-striped table-bordered align-middle">
          <thead className="table-primary">
            <tr>
                <th style={{ width: "50px" }}>#</th>
                {/* <th style={{ width: "100px" }}>Photo</th> */}
                <th>Title</th>
                <th>Category</th>
                <th style={{ width: "140px" }}>Price</th>
                <th style={{ width: "120px" }}>Status</th>
              </tr>
            </thead>

            <tbody>
              {stats.recent.products.slice(0, 5).map((product, index) => (
                <tr key={product._id || index}>
                  <td>{index + 1}</td>

                  
                  {/* <td style={{ width: 100 }}>
                    {product.photos && product.photos.length > 0 ? (
                      <img
                        src={product.photos[0]}
                        alt={product.title}
                        className="img-fluid rounded"
                      />
                    ) : (
                      <span className="text-muted">No Image</span>
                    )}
                  </td> */}

                  <td>{product.title}</td>

                  <td>{product.category || "N/A"}</td>

                  <td>
                    Ksh. {product.price ? Number(product.price).toLocaleString() : 0}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        product.status === "active"
                          ? "bg-success"
                          : "bg-secondary"
                      }`}
                    >
                      {product.status || "N/A"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
</div>

      {/* Recent Premium Ads */}
      <RecentList
        title="Recent Premium Ads"
        items={stats.recent?.premiumAds || []}
        renderItem={(premium) => `${premium.title || 'N/A'} – $${premium.price || 0}`}
        icon="bi-star-fill"
      />
    </div>
  );
};

// Reusable Card Component
const StatCard = ({ title, value, icon }) => (
  <div className="col">
    <div className="card h-100 shadow-lg rounded-4 bg-light hover-card">
      <div className="card-body text-center">
        <div className="icon-circle bg-primary text-white mb-3">
          <i className={`bi ${icon} fs-3`}></i>
        </div>
        <h6 className="text-muted">{title}</h6>
        <h2 className="fw-bold text-dark">{value}</h2>
      </div>
    </div>
  </div>
);

// Reusable Recent List Component
const RecentList = ({ title, items, renderItem, icon }) => (
  <div className="mt-5">
    <div className="card shadow-lg">
      <div className="card-header bg-primary text-white">
        <h5><i className={`bi ${icon} me-2`}></i> {title}</h5>
      </div>
      <div className="card-body">
        {items.length === 0 ? (
          <p className="text-muted">No {title.toLowerCase()}.</p>
        ) : (
          <ul className="list-group">
            {items.map((item, index) => (
              <li key={index} className="list-group-item">{renderItem(item)}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
);

export default SellerDashboard;
