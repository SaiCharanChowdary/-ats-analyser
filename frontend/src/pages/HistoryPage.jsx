import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Toast from "../components/Toast"
import { getMyAnalyses, deleteAnalysis, getResumeUrl, isLoggedIn } from "../api"
import "../css/HistoryPage.css"

function scoreVerdictClass(score) {
  if (score >= 75) return "history-score-strong"
  if (score >= 50) return "history-score-partial"
  return "history-score-weak"
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState(null)
  const [jdModalText, setJdModalText] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/auth", { state: { mode: "login", from: "/history" } })
      return
    }
    loadAnalyses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadAnalyses() {
    setLoading(true)
    setError("")
    try {
      const data = await getMyAnalyses()
      setAnalyses(data)
    } catch (err) {
      setError("Couldn't load your saved analyses. Try refreshing.")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this saved analysis? This can't be undone.")) return
    setDeletingId(id)
    try {
      await deleteAnalysis(id)
      setAnalyses((prev) => prev.filter((a) => a.id !== id))
      setToast({ message: "Analysis deleted.", type: "success" })
    } catch (err) {
      setToast({ message: "Couldn't delete this analysis. Try again.", type: "error" })
    } finally {
      setDeletingId(null)
    }
  }

  async function handleViewPdf(id) {
    // IMPORTANT: open the tab synchronously, BEFORE the await below.
    // Calling window.open() after an async gap is no longer treated as
    // a direct result of the click by most browsers, so it gets
    // silently blocked as a popup — this is why the resume "wasn't
    // visible" before. Opening a blank tab immediately, then filling
    // in its URL once we have it, keeps this inside the trusted
    // click gesture and avoids the popup blocker entirely.
    const newTab = window.open("", "_blank")

    try {
      const url = await getResumeUrl(id)
      if (newTab) {
        newTab.location.href = url
      } else {
        // Popup blocker still intervened (rare, but possible) —
        // fall back to navigating the current tab instead.
        window.location.href = url
      }
    } catch (err) {
      if (newTab) newTab.close()
      setToast({ message: "The resume for this analysis is no longer available.", type: "error" })
    }
  }

  function handleViewResults(item) {
    navigate("/results", {
      state: { result: { status: "success", analysis: item.full_result } },
    })
  }

  function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="history-page">
      <Navbar />

      <div className="history-container">
        <div className="history-header">
          <p className="history-eyebrow">Your history</p>
          <h1 className="history-title">Saved analyses</h1>
          <p className="history-subtitle">
            Every resume-to-role comparison you've chosen to keep.
          </p>
        </div>

        {loading && <p className="history-status">Loading your saved analyses…</p>}
        {error && <p className="history-status history-status-error">{error}</p>}

        {!loading && !error && analyses.length === 0 && (
          <div className="history-empty">
            <i className="ti ti-folder-off" style={{ fontSize: 28, color: "#c4c0b4" }} />
            <p className="history-empty-title">Nothing saved yet</p>
            <p className="history-empty-text">
              Run an analysis and click "Save" to build your history here.
            </p>
            <button onClick={() => navigate("/")} className="history-empty-btn">
              Start an analysis
            </button>
          </div>
        )}

        <div className="history-grid">
          {analyses.map((item) => (
            <div key={item.id} className="history-card">
              <div className="history-card-top">
                <span className={`history-score-badge ${scoreVerdictClass(item.ats_score)}`}>
                  {item.ats_score}
                </span>
                <span className="history-card-date">{formatDate(item.created_at)}</span>
              </div>

              <p className="history-card-role">{item.role_name || item.job_title || "Untitled role"}</p>
              <p className="history-card-company">
                {item.company_name || "—"}
                {item.location && <span className="history-card-location"> · {item.location}</span>}
              </p>

              <div className="history-card-actions">
                <button
                  type="button"
                  onClick={() => handleViewResults(item)}
                  className="history-action-btn history-action-primary"
                >
                  <i className="ti ti-report" /> Results
                </button>
                <button
                  type="button"
                  onClick={() => handleViewPdf(item.id)}
                  disabled={!item.resume_file_id}
                  className="history-action-btn"
                  title={!item.resume_file_id ? "Resume not available for this entry" : "View resume PDF"}
                >
                  <i className="ti ti-file-text" /> Resume
                </button>
                <button
                  type="button"
                  onClick={() => setJdModalText(item.jd_text)}
                  disabled={!item.jd_text}
                  className="history-action-btn"
                  title={!item.jd_text ? "Job description not available for this entry" : "View job description"}
                >
                  <i className="ti ti-clipboard-text" /> JD
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="history-action-btn history-action-danger"
                >
                  <i className="ti ti-trash" /> {deletingId === item.id ? "…" : ""}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {jdModalText && (
        <div className="jd-modal-overlay" onClick={() => setJdModalText(null)}>
          <div className="jd-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="jd-modal-header">
              <p className="jd-modal-title">Job description</p>
              <button
                type="button"
                onClick={() => setJdModalText(null)}
                className="jd-modal-close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <div className="jd-modal-body">
              <p>{jdModalText}</p>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}