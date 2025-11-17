import React, { useState } from "react";
import MyNavbar from "./MyNavbar";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import MyFooter from "./MyFooter";

const AdminRegistercomponent = () => {
  // State Hooks
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretkey, setSecretkey] = useState("");

  const [loading, setLoading] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  //  below is the redirecting timer
  const [countdown, setCountdown] = useState(6);
  // Declare the navigate hook such that if a person successfully register, he can be redirected to login page
  const navigate = useNavigate();

  // ADMIN registration endpoint (same backend)
  const url = "https://spidexmarket.onrender.com/api/admin/register";

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading("Creating Admin Account... please wait...");

    try {
      // Admin ALWAYS has role "admin"
      const data = { name, email, password, role: "admin", secretkey };

      const res = await axios.post(url, data);

      console.log("Registration Success:", res.data)

      setLoading("");
      setSuccess(res.data.message);

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

      // Clear values
      setName("");
      setEmail("");
      setPassword("");
      setSecretkey("");

    } catch (err) {
      setLoading("");
      setError(
        err.response?.data?.message ||
          "Registration failed. something went wrong."
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
                Spidex Online Market
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
          placeholder="Enter Your Name Here" 
          className='form-control mb-3'
          required
          value={name}
          onChange={(e) => {setName(e.target.value)}}
          />

{/* {name} */}

<input type="email" 
placeholder='Enter Your Email Here'
className="form-control mb-3" 
required
value={email}
onChange={(e) => {setEmail(e.target.value)}}
/>
{/* {email} */}

<input type="password" 
placeholder='Enter Your Password Here'
className="form-control mb-3"
required
value={password}
onChange={(e) => {setPassword(e.target.value)}}
 />
 {/* {password} */}

 <input type="password" 
 placeholder='Enter Your Admin secretkey Here'
 className="form-control mb-3" 
 required
 value={secretkey}
onChange={(e) => {setSecretkey(e.target.value)}}
 />
 {/* {secretKey} */}
 <br />

 <div className="d-grid mb-3">
  <button type="submit " className="btn btn-outline-success">Register</button>
 </div>
 <div className="text-center">
  <p>Already Have an Account? {' '} 
    <Link to={"/login"} className='text-decoration-none'>Login
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
