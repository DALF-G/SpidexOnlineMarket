import React, { useState } from "react";
import MyNavbar from "./MyNavbar";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import MyFooter from "./MyFooter";

const Registercomponent = () => {
  // State Hooks
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("buyer"); // default role

  const [loading, setLoading] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  //  below is the redirecting timer
  const [countdown, setCountdown] = useState(6);
  // Declare the navigate hook such that if a person successfully register, he can be redirected to login page
  const navigate = useNavigate();

  // Replace with your API URL
  const url = "https://spidexmarket.onrender.com/api/user/register";

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading("Creating your Spidex Market account... please wait...");

    try {
      const data = { name, email,phone, password, role };

      const res = await axios.post(url, data);

      console.log("Registration Success:", res.data)

      setLoading("");
      setSuccess(res.data.message);
      alert("Welcome to Spidex Online Market!");

      // Delay navigation for 6 seconds
      // Auto redirect after 6 seconds
      let counter = 6;
      const interval = setInterval(() => {
        counter--;
        setCountdown(counter);
        if (counter === 0) {
          clearInterval(interval);
          navigate("/login");
        }
      }, 1000);;

      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setRole("buyer");

    } 
    catch (err) {
      setLoading("");
      setError(
        err.response?.data?.message ||
          "Oops... Registration failed. Please try again."
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
                Create Your Account
              </h5>

              {loading && <div className="alert alert-info">{loading}</div>}
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              {/* Name */}
              <input
                type="text"
                placeholder="Full Name"
                className="form-control mb-3"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

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
                placeholder="Create Password"
                className="form-control mb-3"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

             {/* phone */}
             <input
               type="tel"
               placeholder="Phone Number"
               className="form-control mb-3"
               required
               value={phone}
               onChange={(e) => setPhone(e.target.value)}
              />


              {/* Role */}
              <select
                className="form-select mb-4"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>

              {/* Submit Button */}
              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-warning fw-bold">
                  Register
                </button>
              </div>

              {/* Login Redirect */}
              <div className="text-center">
                <p>
                  Already have an account?{" "}
                  <Link to={"/login"} className="text-decoration-none text-success">
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <MyFooter/>
    </div>
  );
};

export default Registercomponent;
