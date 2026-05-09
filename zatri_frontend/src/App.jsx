import { useEffect, useState } from "react"

const API_BASE_URL = "http://127.0.0.1:8000"

function App() {
  const [page, setPage] = useState("login")
  const [message, setMessage] = useState("")
  const [rides, setRides] = useState([])
  const [historyRides, setHistoryRides] = useState([])
  const [loading, setLoading] = useState(false)

  const [registerData, setRegisterData] = useState({
    name: "",
    phone: "",
    email: "",
    password: ""
  })

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  })

  const [searchData, setSearchData] = useState({
    source: "",
    destination: ""
  })

  const [rideFormData, setRideFormData] = useState({
    source: "",
    destination: "",
    driver_name: "",
    driver_contact: "",
    vehicle_type: "",
    available_seats: "",
    price: "",
    travel_date: "",
    travel_time: "",
    pickup_point: "",
    drop_point: ""
  })

  useEffect(() => {
    const token = localStorage.getItem("zatri_token")

    if (token) {
      setPage("dashboard")
      fetchAllRides()
    }
  }, [])

  const getAuthHeaders = () => {
    const token = localStorage.getItem("zatri_token")

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  }

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    })
  }

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    })
  }

  const handleSearchChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    })
  }

  const handleRideFormChange = (e) => {
    setRideFormData({
      ...rideFormData,
      [e.target.name]: e.target.value
    })
  }

  const registerUser = async (e) => {
    e.preventDefault()
    setMessage("")

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(registerData)
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.detail || "Registration failed")
        return
      }

      setMessage("Registration successful. Please login.")
      setPage("login")

      setRegisterData({
        name: "",
        phone: "",
        email: "",
        password: ""
      })
    } catch (error) {
      setMessage("Backend connection failed")
    }
  }

  const loginUser = async (e) => {
    e.preventDefault()
    setMessage("")

    const formData = new URLSearchParams()
    formData.append("username", loginData.email)
    formData.append("password", loginData.password)

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.detail || "Login failed")
        return
      }

      localStorage.setItem("zatri_token", data.access_token)

      setLoginData({
        email: "",
        password: ""
      })

      setMessage("")
      setPage("dashboard")
      fetchAllRides()
    } catch (error) {
      setMessage("Backend connection failed")
    }
  }

  const fetchAllRides = async () => {
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch(`${API_BASE_URL}/rides`, {
        method: "GET",
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.detail || "Failed to load rides")
        setRides([])
        return
      }

      setRides(Array.isArray(data) ? data : [])
    } catch (error) {
      setMessage("Unable to load rides from backend")
      setRides([])
    } finally {
      setLoading(false)
    }
  }

  const fetchRideHistory = async () => {
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch(`${API_BASE_URL}/rides/history`, {
        method: "GET",
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.detail || "Failed to load history")
        setHistoryRides([])
        return
      }

      setHistoryRides(Array.isArray(data) ? data : [])
    } catch (error) {
      setMessage("Unable to load ride history")
      setHistoryRides([])
    } finally {
      setLoading(false)
    }
  }

  const searchRides = async () => {
    setLoading(true)
    setMessage("")

    const source = searchData.source.trim()
    const destination = searchData.destination.trim()

    try {
      const queryParams = new URLSearchParams()

      if (source) {
        queryParams.append("source", source)
      }

      if (destination) {
        queryParams.append("destination", destination)
      }

      const response = await fetch(`${API_BASE_URL}/rides/search?${queryParams.toString()}`, {
        method: "GET",
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.detail || "Ride search failed")
        setRides([])
        return
      }

      setRides(Array.isArray(data) ? data : [])
    } catch (error) {
      setMessage("Unable to search rides")
      setRides([])
    } finally {
      setLoading(false)
    }
  }

  const createRide = async (e) => {
    e.preventDefault()
    setMessage("")

    try {
      const response = await fetch(`${API_BASE_URL}/rides`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...rideFormData,
          available_seats: Number(rideFormData.available_seats),
          price: Number(rideFormData.price)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.detail || "Failed to add ride")
        return
      }

      setRideFormData({
        source: "",
        destination: "",
        driver_name: "",
        driver_contact: "",
        vehicle_type: "",
        available_seats: "",
        price: "",
        travel_date: "",
        travel_time: "",
        pickup_point: "",
        drop_point: ""
      })

      setMessage("Ride added successfully")
      setPage("dashboard")
      fetchAllRides()
    } catch (error) {
      setMessage("Unable to add ride")
    }
  }

  const clearFilter = () => {
    setSearchData({
      source: "",
      destination: ""
    })

    fetchAllRides()
  }

  const logoutUser = () => {
    localStorage.removeItem("zatri_token")

    setLoginData({
      email: "",
      password: ""
    })

    setSearchData({
      source: "",
      destination: ""
    })

    setRideFormData({
      source: "",
      destination: "",
      driver_name: "",
      driver_contact: "",
      vehicle_type: "",
      available_seats: "",
      price: "",
      travel_date: "",
      travel_time: "",
      pickup_point: "",
      drop_point: ""
    })

    setRides([])
    setHistoryRides([])
    setMessage("")
    setPage("login")
  }

  const openDashboard = () => {
    setMessage("")
    setPage("dashboard")
    fetchAllRides()
  }

  const openAddRide = () => {
    setMessage("")
    setPage("addRide")
  }

  const openHistory = () => {
    setMessage("")
    setPage("history")
    fetchRideHistory()
  }

  const showLogin = () => {
    setPage("login")
    setMessage("")
  }

  const showRegister = () => {
    setPage("register")
    setMessage("")
  }

  if (page === "dashboard") {
    return (
      <div className="dashboard-page">
        <Sidebar
          activePage="dashboard"
          openDashboard={openDashboard}
          openAddRide={openAddRide}
          openHistory={openHistory}
          logoutUser={logoutUser}
        />

        <main className="dashboard-main">
          <header className="dashboard-header">
            <div>
              <h1 className="dashboard-title">Available Rides</h1>
              <p className="dashboard-subtitle">
                Search rides by source and destination
              </p>
            </div>
          </header>

          <section className="filter-section">
            <input
              type="text"
              name="source"
              placeholder="Source city"
              value={searchData.source}
              onChange={handleSearchChange}
            />

            <input
              type="text"
              name="destination"
              placeholder="Destination city"
              value={searchData.destination}
              onChange={handleSearchChange}
            />

            <button className="filter-btn" onClick={searchRides}>
              Filter
            </button>

            <button className="clear-btn" onClick={clearFilter}>
              Clear
            </button>
          </section>

          {message && <p className="dashboard-message">{message}</p>}

          <section className="rides-section">
            {loading && (
              <div className="empty-state">
                <div className="empty-icon">🚗</div>
                <h3>Loading rides...</h3>
              </div>
            )}

            {!loading && rides.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🧳</div>
                <h3>No rides found</h3>
                <p>Enter source and destination, then click Filter.</p>
              </div>
            )}

            {!loading && rides.length > 0 && (
              <div className="rides-grid">
                {rides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    )
  }

  if (page === "addRide") {
    return (
      <div className="dashboard-page">
        <Sidebar
          activePage="addRide"
          openDashboard={openDashboard}
          openAddRide={openAddRide}
          openHistory={openHistory}
          logoutUser={logoutUser}
        />

        <main className="dashboard-main">
          <section className="add-ride-panel full-form-panel">
            <div className="add-ride-header">
              <div>
                <h2>Add New Ride</h2>
                <p>Enter ride details to make it available for users.</p>
              </div>

              <button className="close-btn" onClick={openDashboard}>
                ✕
              </button>
            </div>

            <form className="add-ride-form" onSubmit={createRide}>
              <input
                type="text"
                name="source"
                placeholder="Source"
                value={rideFormData.source}
                onChange={handleRideFormChange}
                required
              />

              <input
                type="text"
                name="destination"
                placeholder="Destination"
                value={rideFormData.destination}
                onChange={handleRideFormChange}
                required
              />

              <input
                type="text"
                name="driver_name"
                placeholder="Driver name"
                value={rideFormData.driver_name}
                onChange={handleRideFormChange}
                required
              />

              <input
                type="text"
                name="driver_contact"
                placeholder="Driver contact number"
                value={rideFormData.driver_contact}
                onChange={handleRideFormChange}
                required
              />

              <input
                type="text"
                name="vehicle_type"
                placeholder="Vehicle type"
                value={rideFormData.vehicle_type}
                onChange={handleRideFormChange}
                required
              />

              <input
                type="number"
                name="available_seats"
                placeholder="Available seats"
                value={rideFormData.available_seats}
                onChange={handleRideFormChange}
                required
              />

              <input
                type="number"
                name="price"
                placeholder="Price"
                value={rideFormData.price}
                onChange={handleRideFormChange}
                required
              />

              <input
                type="date"
                name="travel_date"
                value={rideFormData.travel_date}
                onChange={handleRideFormChange}
                required
              />

              <input
                type="time"
                name="travel_time"
                value={rideFormData.travel_time}
                onChange={handleRideFormChange}
                required
              />

              <input
                type="text"
                name="pickup_point"
                placeholder="Pickup point"
                value={rideFormData.pickup_point}
                onChange={handleRideFormChange}
                required
              />

              <input
                type="text"
                name="drop_point"
                placeholder="Drop point"
                value={rideFormData.drop_point}
                onChange={handleRideFormChange}
                required
              />

              <button className="primary-btn save-ride-btn" type="submit">
                Save Ride
              </button>
            </form>

            {message && <p className="dashboard-message">{message}</p>}
          </section>
        </main>
      </div>
    )
  }

  if (page === "history") {
    return (
      <div className="dashboard-page">
        <Sidebar
          activePage="history"
          openDashboard={openDashboard}
          openAddRide={openAddRide}
          openHistory={openHistory}
          logoutUser={logoutUser}
        />

        <main className="dashboard-main">
          <header className="dashboard-header">
            <div>
              <h1 className="dashboard-title">Ride History</h1>
              <p className="dashboard-subtitle">
                Expired rides created by you will show here
              </p>
            </div>
          </header>

          {message && <p className="dashboard-message">{message}</p>}

          {loading && (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>Loading history...</h3>
            </div>
          )}

          {!loading && historyRides.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No ride history available</h3>
              <p>Expired rides created by you will show here.</p>
            </div>
          )}

          {!loading && historyRides.length > 0 && (
            <div className="rides-grid">
              {historyRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="card">
        <h1>Zatri</h1>
        <p className="subtitle">Travel smart. Ride easy.</p>

        <div className="tabs">
          <button
            className={page === "login" ? "active" : ""}
            onClick={showLogin}
          >
            Login
          </button>

          <button
            className={page === "register" ? "active" : ""}
            onClick={showRegister}
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
  )
}

function Sidebar({ activePage, openDashboard, openAddRide, openHistory, logoutUser }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Z</div>

      <div className="sidebar-menu">
        <button
          className={activePage === "dashboard" ? "sidebar-icon active" : "sidebar-icon"}
          title="Dashboard"
          onClick={openDashboard}
        >
          🏠
        </button>

        <button
          className={activePage === "history" ? "sidebar-icon active" : "sidebar-icon"}
          title="Ride History"
          onClick={openHistory}
        >
          📋
        </button>

        <button
          className={activePage === "addRide" ? "sidebar-icon active" : "sidebar-icon"}
          title="Add Ride"
          onClick={openAddRide}
        >
          ➕
        </button>

        <button className="sidebar-icon" title="Logout" onClick={logoutUser}>
          ⏻
        </button>
      </div>
    </aside>
  )
}

function RideCard({ ride }) {
  return (
    <div className="ride-card">
      <div className="ride-card-top">
        <div className="ride-route-icon">🚕</div>
        <span className="ride-status">Available</span>
      </div>

      <h3>
        {ride.source} to {ride.destination}
      </h3>

      <div className="ride-info">
        <p>
          <span>Driver</span>
          <strong>{ride.driver_name}</strong>
        </p>

        <p>
          <span>Contact</span>
          <strong>{ride.driver_contact}</strong>
        </p>

        <p>
          <span>Vehicle</span>
          <strong>{ride.vehicle_type}</strong>
        </p>

        <p>
          <span>Seats</span>
          <strong>{ride.available_seats}</strong>
        </p>

        <p>
          <span>Fare</span>
          <strong>₹{ride.price}</strong>
        </p>

        <p>
          <span>Date</span>
          <strong>{ride.travel_date}</strong>
        </p>

        <p>
          <span>Time</span>
          <strong>{ride.travel_time}</strong>
        </p>

        <p>
          <span>Pickup</span>
          <strong>{ride.pickup_point}</strong>
        </p>

        <p>
          <span>Drop</span>
          <strong>{ride.drop_point}</strong>
        </p>
      </div>

      <button className="book-btn">
        Book Ride
      </button>
    </div>
  )
}

export default App