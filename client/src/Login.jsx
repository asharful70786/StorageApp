import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import "./Auth.css";
import LogWithGoogle from "./LogWithGoogle";
import LogWithGithub from "./loginWithGithub";

const Login = () => {
  const BASE_URL = "http://localhost:4000";
  const navigate = useNavigate(); 

  const [formData, setFormData] = useState({
    email: "ashrafulmomin7076@gmail.com",
    password: "1234",
  });

  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServerError(""); // Clear error on input
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASE_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (data.message = "Logged In") {
         navigate("/"); 
      } else {
       setServerError(data.error);
      }
    } catch (err) {
      console.error(err);
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="container">
      <h2 className="heading">Login</h2>
      <form className="form" onSubmit={handleSubmit}>
        {/* Email Field */}
        <div className="form-group">
          <label htmlFor="email" className="label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className={`input ${serverError ? "input-error" : ""}`}
            required
          />
        </div>

        {/* Password Field */}
        <div className="form-group">
          <label htmlFor="password" className="label">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className={`input ${serverError ? "input-error" : ""}`}
            required
          />
          {serverError && <span className="error-msg">{serverError}</span>}
        </div>

        <button type="submit" className="submit-button">Login</button>
      </form>

      {/* Register Link */}
      <p className="link-text">
        Don't have an account? <Link to="/register">Register</Link>
      </p>

      {/* Divider */}
      <div className="divider"><span>or</span></div>

      <div className="social-login">
        <button className="social-button">
          <LogWithGoogle />
        </button>
      
        {/* <button className="social-button">
          <LogWithGithub />
        </button> */}
      </div>
      <div className="social-login">      
        <button className="social-button">
          <LogWithGithub />
        </button>
      </div>
    </div>
  );
};

export default Login;
