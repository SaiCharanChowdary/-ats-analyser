import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { loginUser, registerUser } from "../api"
import "../css/AuthPage.css"

export default function AuthPage() {
  const { state } = useLocation()
  const [mode, setMode] = useState(state?.mode || "login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const navigate = useNavigate()
  const isRegister = mode === "register"

  function switchMode(newMode) {
    if (newMode === mode) return
    setMode(newMode)
    setError("")
    setPassword("")
    setConfirmPassword("")
    setIsTransitioning(true)
    setTimeout(() => setIsTransitioning(false), 850)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")

    if (isRegister && password !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setIsSubmitting(true)
    try {
      const data = isRegister
        ? await registerUser(email, password)
        : await loginUser(email, password)

      localStorage.setItem("access_token", data.access_token)

      // If we were sent here mid-save, carry everything back so the
      // save finishes automatically without re-asking for details.
      if (state?.from && state?.pendingSave) {
        navigate(state.from, {
          state: {
            result: state.pendingSave.resultState,
            jdText: state.pendingSave.jdText,
            autoSaveData: {
              companyName: state.pendingSave.companyName,
              roleName: state.pendingSave.roleName,
              location: state.pendingSave.location,
            },
          },
        })
      } else if (state?.from) {
        navigate(state.from)
      } else {
        navigate("/")
      }
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        "Something went wrong. Check your details and try again."
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div
        className={`auth-shell ${isRegister ? "auth-shell-register" : ""} ${
          isTransitioning ? "auth-shell-transitioning" : ""
        }`}
      >

        <div className="auth-form-panel auth-form-panel-login">
          <form onSubmit={handleSubmit} className="auth-form">
            <p className="auth-form-title auth-stagger">Log in</p>

            <div className="auth-field auth-stagger">
              <label className="auth-label">Email</label>
              <input
                type="email"
                required={!isRegister}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="auth-input"
                tabIndex={isRegister ? -1 : 0}
              />
            </div>

            <div className="auth-field auth-stagger">
              <label className="auth-label">Password</label>
              <input
                type="password"
                required={!isRegister}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input"
                tabIndex={isRegister ? -1 : 0}
              />
            </div>

            {!isRegister && error && <p className="auth-error">{error}</p>}

            <div className="auth-field auth-stagger">
              <button
                type="submit"
                disabled={isSubmitting}
                className="auth-submit-btn"
                tabIndex={isRegister ? -1 : 0}
              >
                {isSubmitting && !isRegister ? "Please wait…" : "Log in"}
              </button>
            </div>
          </form>
        </div>

        <div className="auth-form-panel auth-form-panel-register">
          <form onSubmit={handleSubmit} className="auth-form">
            <p className="auth-form-title auth-stagger">Create account</p>

            <div className="auth-field auth-stagger">
              <label className="auth-label">Email</label>
              <input
                type="email"
                required={isRegister}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="auth-input"
                tabIndex={isRegister ? 0 : -1}
              />
            </div>

            <div className="auth-field auth-stagger">
              <label className="auth-label">Password</label>
              <input
                type="password"
                required={isRegister}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input"
                tabIndex={isRegister ? 0 : -1}
              />
            </div>

            <div className="auth-field auth-stagger">
              <label className="auth-label">Confirm password</label>
              <input
                type="password"
                required={isRegister}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input"
                tabIndex={isRegister ? 0 : -1}
              />
            </div>

            {isRegister && error && <p className="auth-error">{error}</p>}

            <div className="auth-field auth-stagger">
              <button
                type="submit"
                disabled={isSubmitting}
                className="auth-submit-btn"
                tabIndex={isRegister ? 0 : -1}
              >
                {isSubmitting && isRegister ? "Please wait…" : "Create account"}
              </button>
            </div>
          </form>
        </div>

        <div className="auth-panel-dark">
          <div className="auth-panel-orb auth-panel-orb-1" />
          <div className="auth-panel-orb auth-panel-orb-2" />
          <div className="auth-panel-curve" />

          <div className="auth-panel-messages">
            <div className="auth-panel-msg auth-panel-msg-login">
              <div className="auth-logo">
                <span>R</span>
              </div>
              <p className="auth-panel-title">New here?</p>
              <p className="auth-panel-text">
                Create an account to save your analyses and track improvements
                over time.
              </p>
              <button
                type="button"
                className="auth-panel-btn"
                onClick={() => switchMode("register")}
                tabIndex={isRegister ? -1 : 0}
              >
                Register <i className="ti ti-arrow-right" />
              </button>
            </div>

            <div className="auth-panel-msg auth-panel-msg-register">
              <div className="auth-logo">
                <span>R</span>
              </div>
              <p className="auth-panel-title">Already a member?</p>
              <p className="auth-panel-text">
                Log back in to pick up right where you left off.
              </p>
              <button
                type="button"
                className="auth-panel-btn"
                onClick={() => switchMode("login")}
                tabIndex={isRegister ? 0 : -1}
              >
                <i className="ti ti-arrow-left" /> Log in
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}