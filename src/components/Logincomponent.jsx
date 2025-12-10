import React, { useContext, useState } from "react";
import MyNavbar from "./MyNavbar";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import MyFooter from "./MyFooter";
import { AuthContext } from "../context/AuthContext";

const LoginComponent = () => {
  // state hooks
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");
  const [success, setSuccess] = useState("");
  
// hooks
  const navigate = useNavigate();
  const { setToken, setUser } = useContext(AuthContext);

  // backend URL 
  const url = "https://spidexmarket.onrender.com/api/user/login";

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading("Logging you into Spidex Market...");

    try {
      const data = { email, password };
      const res = await axios.post(url, data);

      const { token, user } = res.data;

      setLoading("");
      setSuccess(res.data.message || "Login successful!");

      // save token to local storage for authentication
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setToken(token);
      setUser(user);
      setLoading("");

       // ✅ Redirect by role
      if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (user.role === "seller") {
        if (!user.isApprovedSeller) {
          alert("Your seller account is pending approval. You can browse but cannot post yet.");
          navigate("/");
        } else {
          navigate("/seller-dashboard");
        }
      } else {
        navigate("/buyer-dashboard");
      }
    } catch (err) {
      console.error("Login error:", err.response || err);
      setLoading("");
      if (err.response && err.response.status === 401) {
        setError(err.response.data.message);
      } else {
        setError("Network or server error");
      }
    }
  };

  return (
    <div className="login-page">
      {/* Navbar */}
      <MyNavbar />

      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <form
              onSubmit={handleSubmit}
              className="card shadow-lg p-4 bg-light border-0 rounded-4"
            >
              <h2 className="text-center text-warning mb-2">
                Spidex Online Market
              </h2>
              <h5 className="text-center text-success mb-4">
                Login to Your Account
              </h5>

              {loading && <div className="alert alert-info">{loading}</div>}
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              {/* Email */}
              <input
                type="email"
                placeholder="Email Address"
                className="form-control mb-3"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />


              {/* Password */}
              <input
                type="password"
                placeholder="Your Password"
                className="form-control mb-4"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Submit Button */}
              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-warning fw-bold">
                  Login
                </button>
              </div>

              {/* Redirect */}
              <div className="text-center">
                <p>
                  Don’t have an account?{" "}
                  <Link
                    to={"/register"}
                    className="text-decoration-none text-success"
                  >
                    Register here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <MyFooter />
    </div>
  );
};

export default LoginComponent;
