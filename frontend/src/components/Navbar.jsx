import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { isLoggedIn, logout } from "../api"
import "../css/Navbar.css"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const loggedIn = isLoggedIn()

  const isAnalysePage = location.pathname === "/"
  const isHistoryPage = location.pathname === "/history"
  const isHowItWorksPage = location.pathname === "/how-it-works"

  function goToAuth(mode) {
    setMenuOpen(false)
    navigate("/auth", { state: { mode } })
  }

  function goToHistory() {
    setMenuOpen(false)
    navigate("/history")
  }

  function handleLogout() {
    logout()
    setMenuOpen(false)
    navigate("/")
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <div className="navbar-logo">
            <span>R</span>
          </div>
          <span className="navbar-title">Resume Review</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={isAnalysePage ? "navbar-link-active" : "navbar-link"}>
            Analyse
          </Link>
          <button
            type="button"
            onClick={goToHistory}
            className={isHistoryPage ? "navbar-link-active navbar-link-btn" : "navbar-link navbar-link-btn"}
          >
            History
          </button>
          <Link
            to="/how-it-works"
            className={isHowItWorksPage ? "navbar-link-active" : "navbar-link"}
            onClick={() => setMenuOpen(false)}
          >
            How it works
          </Link>
        </div>
      </div>

      <div className="navbar-actions">
        {loggedIn ? (
          <button type="button" className="navbar-btn-login" onClick={handleLogout}>
            Log out
          </button>
        ) : (
          <>
            <button
              type="button"
              className="navbar-btn-login"
              onClick={() => goToAuth("login")}
            >
              Log in
            </button>
            <button
              type="button"
              className="navbar-btn-register"
              onClick={() => goToAuth("register")}
            >
              Register
            </button>
          </>
        )}
      </div>

      <button
        type="button"
        className="navbar-burger"
        aria-label="Open menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <i className={menuOpen ? "ti ti-x" : "ti ti-menu-2"} />
      </button>

      {menuOpen && (
        <div className="navbar-mobile-menu">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className={
              isAnalysePage
                ? "navbar-mobile-link navbar-mobile-link-active"
                : "navbar-mobile-link"
            }
          >
            Analyse
          </Link>
          <button
            type="button"
            onClick={goToHistory}
            className={
              isHistoryPage
                ? "navbar-mobile-link navbar-mobile-link-active navbar-mobile-link-btn"
                : "navbar-mobile-link navbar-mobile-link-btn"
            }
          >
            History
          </button>
          <Link
            to="/how-it-works"
            onClick={() => setMenuOpen(false)}
            className={
              isHowItWorksPage
                ? "navbar-mobile-link navbar-mobile-link-active"
                : "navbar-mobile-link"
            }
          >
            How it works
          </Link>
          <div className="navbar-mobile-divider" />
          {loggedIn ? (
            <button type="button" className="navbar-mobile-btn-login" onClick={handleLogout}>
              Log out
            </button>
          ) : (
            <>
              <button
                type="button"
                className="navbar-mobile-btn-login"
                onClick={() => goToAuth("login")}
              >
                Log in
              </button>
              <button
                type="button"
                className="navbar-mobile-btn-register"
                onClick={() => goToAuth("register")}
              >
                Register
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}