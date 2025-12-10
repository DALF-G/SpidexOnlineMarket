import axios from 'axios';
import React, { useEffect, useState } from 'react'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totals: {
      totalUsers: 0,
      totalBuyers: 0,
      totalSellers: 0,
      totalAdmins: 0,
      pendingSellers: 0,
      activeUsers: 0,
      totalProducts: 0,
      soldProducts: 0,
      activeProducts: 0,
      totalCategories: 0,
      totalMessages: 0,
      totalReviews: 0,
      totalPremiumAds: 0,
      featuredProducts: 0,
      boostedProducts: 0,
      premiumRevenue: 0
    },
    recent: {
      users: [],
      products: [],
      premiums: []
    }
  });

  const fetchStats = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("https://spidexmarket.onrender.com/api/adminstats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }

  useEffect(() => { fetchStats(); }, []);

  return (
    <div className="container my-3">
      <h2 className="text-center text-success mb-4">Admin Dashboard Overview</h2>

      {/* Totals Cards */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        <StatCard title="Total Users" value={stats.totals.totalUsers} icon="bi-people-fill" />
        <StatCard title="Buyers" value={stats.totals.totalBuyers} icon="bi-person-check" />
        <StatCard title="Sellers" value={stats.totals.totalSellers} icon="bi-shop" />
        <StatCard title="Admins" value={stats.totals.totalAdmins} icon="bi-person-badge" />
        <StatCard title="Pending Sellers" value={stats.totals.pendingSellers} icon="bi-hourglass-split" />
        <StatCard title="Active Users" value={stats.totals.activeUsers} icon="bi-person-lines-fill" />
        <StatCard title="Total Products" value={stats.totals.totalProducts} icon="bi-box-seam" />
        <StatCard title="Sold Products" value={stats.totals.soldProducts} icon="bi-cart-check" />
        <StatCard title="Active Products" value={stats.totals.activeProducts} icon="bi-bag-check" />
        <StatCard title="Total Categories" value={stats.totals.totalCategories} icon="bi-tags" />
        <StatCard title="Total Messages" value={stats.totals.totalMessages} icon="bi-chat-left-text" />
        <StatCard title="Total Reviews" value={stats.totals.totalReviews} icon="bi-star" />
        <StatCard title="Premium Ads" value={stats.totals.totalPremiumAds} icon="bi-star-fill" />
        <StatCard title="Featured Products" value={stats.totals.featuredProducts} icon="bi-bookmark-star" />
        <StatCard title="Boosted Products" value={stats.totals.boostedProducts} icon="bi-lightning-fill" />
        <StatCard title="Premium Revenue" value={`$${stats.totals.premiumRevenue}`} icon="bi-currency-dollar" />
      </div>

      {/* Recent Users */}
      <RecentList 
        title="Recent Users" 
        items={stats.recent.users} 
        renderItem={(user) => `${user.name} – ${user.email} (${user.role})`} 
        icon="bi-people-fill" 
      />

      {/* Recent Products with Images */}
      <div className="mt-5">
        <div className="card shadow-lg">
          <div className="card-header bg-primary text-white">
            <h5><i className="bi bi-box-seam me-2"></i> Recent Products</h5>
          </div>
          <div className="card-body">
            {stats.recent.products.length === 0 ? (
              <p className="text-muted">No recent products.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-bordered align-middle">
                  <thead className="table-primary">
                    <tr>
                      <th>#</th>
                      <th>Photo</th>
                      <th>Title</th>
                      <th>Seller</th>
                      <th>Price</th>
                      <th>Category</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent.products.map((product, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          {product.photos.length > 0 ? (
                            <img 
                              src={product.photos[0]} 
                              alt={product.title} 
                              width="50" 
                              height="50" 
                              className="rounded-circle" 
                              style={{ objectFit: "cover" }}
                            />
                          ) : (
                            <span>No Image</span>
                          )}
                        </td>
                        <td>{product.title}</td>
                        <td>{product.seller?.name}</td>
                        <td>${product.price}</td>
                        <td>{product.category}</td>
                        <td>{product.status}</td>
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
        items={stats.recent.premiums} 
        renderItem={(premium) => `${premium.title} – $${premium.price}`} 
        icon="bi-star-fill" 
      />
    </div>
  )
}

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
)

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
)

export default AdminDashboard;
