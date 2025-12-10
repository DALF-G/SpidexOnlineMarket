import React, { useState } from "react";
import MyNavbar from "./MyNavbar";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import MyFooter from "./MyFooter";

const AdminRegistercomponent = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [secretkey, setSecretkey] = useState("");

  const [loading, setLoading] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [countdown, setCountdown] = useState(6);
  const navigate = useNavigate();

  const url = "https://spidexmarket.onrender.com/api/admin/register";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading("Creating Admin Account... please wait...");
    setError("");
    setSuccess("");

    try {
      const data = { name, email, password, phone, secretkey };

      const res = await axios.post(url, data);

      setLoading("");
      setSuccess(res.data.message);

      // Redirect Timer
      let counter = 6;
      const interval = setInterval(() => {
        counter--;
        setCountdown(counter);
        if (counter === 0) {
          clearInterval(interval);
          navigate("/login");
        }
      }, 1000);

      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setSecretkey("");

    } catch (err) {
      setLoading("");
      setError(
        err.response?.data?.message ||
        "Registration failed. Something went wrong."
      );
    }
  };

  return (
    <div className="register-page">
      <MyNavbar />

      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <form
              onSubmit={handleSubmit}
              className="card shadow-lg p-4 bg-light border-0 rounded-4"
            >
              <h2 className="text-center text-warning mb-2">
                Spidex Market
              </h2>
              <h5 className="text-center text-success mb-4">
                Admin Registration
              </h5>

              {loading && <div className="alert alert-info">{loading}</div>}
              {error && <div className="alert alert-danger">{error}</div>}
              {success && (
                <div className="alert alert-success">
                  {success}
                  <h6 className="mt-2">Redirecting in</h6>
                  <h3 className="text-danger">{countdown} s...</h3>
                </div>
              )}

              <input
                type="text"
                placeholder="Enter Your Name"
                className="form-control mb-3"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                type="email"
                placeholder="Enter Your Email"
                className="form-control mb-3"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Enter Password"
                className="form-control mb-3"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <input
                type="tel"
                placeholder="Phone Number"
                className="form-control mb-3"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <input
                type="password"
                placeholder="Admin Secret Key"
                className="form-control mb-3"
                required
                value={secretkey}
                onChange={(e) => setSecretkey(e.target.value)}
              />

              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-outline-success">
                  Register
                </button>
              </div>

              <div className="text-center">
                <p>
                  Already have an account?{" "}
                  <Link to="/login" className="text-decoration-none">
                    Login
                  </Link>
                </p>
              </div>

            </form>
          </div>
        </div>
      </div>

      <MyFooter />
    </div>
  );
};

export default AdminRegistercomponent;
