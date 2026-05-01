import { useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

function App() {
  const [page, setPage] = useState("login");
  const [message, setMessage] = useState("");

  const [registerData, setRegisterData] = useState({
    name: "",
    phone: "",
    email: "",
    password: ""
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const registerUser = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(registerData)
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Registration failed");
        return;
      }

      setMessage("Registration successful. Please login.");
      setPage("login");

      setRegisterData({
        name: "",
        phone: "",
        email: "",
        password: ""
      });
    } catch (error) {
      setMessage("Backend connection failed");
    }
  };

  const loginUser = async (e) => {
    e.preventDefault();
    setMessage("");

    const formData = new URLSearchParams();
    formData.append("username", loginData.email);
    formData.append("password", loginData.password);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Login failed");
        return;
      }

      localStorage.setItem("zatri_token", data.access_token);
      setMessage("Login successful");
    } catch (error) {
      setMessage("Backend connection failed");
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1>Zatri</h1>
        <p className="subtitle">Travel smart. Ride easy.</p>

        <div className="tabs">
          <button
            className={page === "login" ? "active" : ""}
            onClick={() => {
              setPage("login");
              setMessage("");
            }}
          >
            Login
          </button>

          <button
            className={page === "register" ? "active" : ""}
            onClick={() => {
              setPage("register");
              setMessage("");
            }}
          >
            Register
          </button>
        </div>

        {page === "register" && (
          <form onSubmit={registerUser}>
            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={registerData.name}
              onChange={handleRegisterChange}
              required
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone number"
              value={registerData.phone}
              onChange={handleRegisterChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Mail ID"
              value={registerData.email}
              onChange={handleRegisterChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={registerData.password}
              onChange={handleRegisterChange}
              required
            />

            <button className="submit-btn" type="submit">
              Create Account
            </button>
          </form>
        )}

        {page === "login" && (
          <form onSubmit={loginUser}>
            <input
              type="email"
              name="email"
              placeholder="Mail ID"
              value={loginData.email}
              onChange={handleLoginChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
            />

            <button className="submit-btn" type="submit">
              Login
            </button>
          </form>
        )}

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default App;