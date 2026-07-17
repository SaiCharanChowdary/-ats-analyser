import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import SaveModal from "../components/SaveModal"
import Toast from "../components/Toast"
import { saveAnalysis, isLoggedIn } from "../api"
import "../css/ResultsPage.css"

const TABS = ["Checklist", "Rewrites", "Flags"]

function scoreVerdict(score) {
  if (score >= 75) return { label: "Strong fit", text: "#6ee7b7", bg: "rgba(16,185,129,0.15)" }
  if (score >= 50) return { label: "Partial fit", text: "#fcd34d", bg: "rgba(252,211,77,0.15)" }
  return { label: "Weak fit", text: "#fca5a5", bg: "rgba(239,68,68,0.15)" }
}

function BreakdownItem({ label, value, color }) {
  return (
    <div>
      <span className="breakdown-item-label">{label}</span>
      <span className="breakdown-item-value">{value}</span>
      <div className="breakdown-bar-track">
        <div className="breakdown-bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const result = state?.result?.analysis

  const [activeTab, setActiveTab] = useState("Checklist")
  const [rewriteIndex, setRewriteIndex] = useState(0)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveState, setSaveState] = useState("idle") // idle | saving | saved | error
  const [saveError, setSaveError] = useState("")
  const [toast, setToast] = useState(
    state?.toastMessage ? { message: state.toastMessage, type: "success" } : null
  )

  async function attemptSave({ companyName, roleName, location }) {
    if (!result) return

    const saveFields = {
      jobTitle: result.job_title_detected || null,
      companyName,
      roleName,
      location,
      atsScore: result.ats_score,
      jdText: state?.jdText || null,
      resumeFileId: state?.result?.resume_file_id || null,
      fullResult: result,
    }

    if (!isLoggedIn()) {
      // Bundle everything needed to finish this save after login —
      // the original result state, the JD text, and what was typed
      // into the modal — so nothing has to be re-entered.
      navigate("/auth", {
        state: {
          mode: "login",
          from: "/results",
          pendingSave: {
            resultState: state.result,
            jdText: state?.jdText || null,
            companyName,
            roleName,
            location,
          },
        },
      })
      return
    }

    setShowSaveModal(false)
    setSaveState("saving")
    setSaveError("")
    try {
      await saveAnalysis(saveFields)
      setSaveState("saved")
      setToast({ message: "Saved — find it anytime in your History.", type: "success" })
    } catch (err) {
      setSaveState("error")
      setSaveError(
        err.response?.data?.detail || "Couldn't save right now. Try again."
      )
    }
  }

  function handleExportPdf() {
    window.print()
  }

  // If we were bounced to /auth mid-save (modal already filled out)
  // and just returned logged in, finish the save automatically.
  useEffect(() => {
    if (state?.autoSaveData && isLoggedIn() && result) {
      attemptSave(state.autoSaveData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!result) {
    return (
      <div className="results-page">
        <Navbar />
        <div className="empty-state">
          <p>No analysis found. Start a new comparison from the home page.</p>
          <button onClick={() => navigate("/")} className="empty-state-btn">
            Go to upload page
          </button>
        </div>
      </div>
    )
  }

  const {
    ats_score,
    score_breakdown,
    job_title_detected,
    skill_checklist_results = [],
    repetition_flags = [],
    rewrite_suggestions = [],
    summary,
  } = result

  const matchedCount = skill_checklist_results.filter((s) => s.status === "matched").length
  const totalCount = skill_checklist_results.length
  const matchedPct = totalCount ? Math.round((matchedCount / totalCount) * 100) : 0
  const verdict = scoreVerdict(ats_score)
  const currentRewrite = rewrite_suggestions[rewriteIndex]

  const priorityColors = {
    high: { text: "#ef4444", bg: "#fef2f2" },
    medium: { text: "#d97706", bg: "#fef3c7" },
    low: { text: "#6b7280", bg: "#f3f4f6" },
  }

  return (
    <div className="results-page">
      <Navbar />

      {showSaveModal && (
        <SaveModal
          onConfirm={attemptSave}
          onCancel={() => setShowSaveModal(false)}
          isSubmitting={saveState === "saving"}
        />
      )}

      <div className="results-container">

        <button onClick={() => navigate("/")} className="back-btn">
          <i className="ti ti-arrow-left" style={{ fontSize: 13 }} /> New comparison
        </button>

        <div className="hero-banner">
          <div>
            <p className="hero-eyebrow">
              ATS Score · {job_title_detected || "Role not detected"}
            </p>
            <div className="hero-score-row">
              <span className="hero-score">{ats_score}</span>
              <span
                className="hero-badge"
                style={{ color: verdict.text, background: verdict.bg }}
              >
                {verdict.label}
              </span>
            </div>
            {summary && <p className="hero-description">{summary.split(".")[0]}.</p>}
          </div>
          <svg width="100" height="100" viewBox="0 0 100 100" className="hero-ring">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="9" />
            <circle
              cx="50" cy="50" r="42" fill="none" stroke="#f59e0b" strokeWidth="9"
              strokeDasharray="264" strokeDashoffset={264 - (264 * ats_score) / 100}
              strokeLinecap="round" transform="rotate(-90 50 50)"
            />
          </svg>
        </div>

        {score_breakdown && (
          <div className="breakdown-strip">
            <BreakdownItem label="Skill match" value={score_breakdown.skill_match} color="#6366f1" />
            <BreakdownItem label="Experience" value={score_breakdown.experience_relevance} color="#6366f1" />
            <BreakdownItem label="Formatting" value={score_breakdown.formatting_clarity} color="#10b981" />
            <BreakdownItem label="Keywords" value={score_breakdown.keyword_density} color="#6366f1" />
            <div className="checklist-summary-item">
              <span className="breakdown-item-label">Checklist</span>
              <div className="checklist-summary-value">
                <span className="checklist-summary-num">{matchedCount}</span>
                <span className="checklist-summary-total">/{totalCount}</span>
              </div>
              <div className="checklist-coverage-bar">
                <div style={{ width: `${matchedPct}%`, background: "#10b981" }} />
                <div style={{ width: `${100 - matchedPct}%`, background: "#fee2e2" }} />
              </div>
            </div>
          </div>
        )}

        <div className="tabs-row">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`tab-btn ${activeTab === tab ? "tab-btn-active" : ""}`}
            >
              {tab}
              {tab === "Flags" && repetition_flags.length > 0 && (
                <span className="tab-badge">{repetition_flags.length}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "Checklist" && (
          <div className="panel-card">
            <div className="checklist-list">
              {skill_checklist_results.map((item, i) => (
                <div key={i} className="checklist-row">
                  <div>
                    <span className="checklist-skill-name">{item.skill}</span>
                    {item.status === "matched" && item.evidence && (
                      <p className="checklist-evidence">"{item.evidence}"</p>
                    )}
                  </div>
                  <span
                    className={`status-pill ${
                      item.status === "matched" ? "status-matched" : "status-missing"
                    }`}
                  >
                    {item.status === "matched" ? "Matched" : "Missing"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Rewrites" && currentRewrite && (
          <>
            <div className="diff-card">
              <div className="diff-header">
                <span
                  className="priority-pill"
                  style={{
                    color: priorityColors[currentRewrite.priority]?.text,
                    background: priorityColors[currentRewrite.priority]?.bg,
                  }}
                >
                  {currentRewrite.priority} priority
                </span>
                <span className="diff-counter">
                  {rewriteIndex + 1} of {rewrite_suggestions.length}
                </span>
              </div>

              <div className="diff-grid">
                <div className="diff-panel diff-panel-original">
                  <div className="diff-label-row">
                    <span className="diff-dot diff-dot-red" />
                    <p className="diff-label diff-label-red">Original</p>
                  </div>
                  <p className="diff-text diff-text-original">{currentRewrite.original}</p>
                </div>
                <div className="diff-panel diff-panel-improved">
                  <div className="diff-label-row">
                    <span className="diff-dot diff-dot-green" />
                    <p className="diff-label diff-label-green">Improved</p>
                  </div>
                  <p className="diff-text diff-text-improved">{currentRewrite.improved}</p>
                </div>
              </div>

              <div className="diff-reason">
                <i className="ti ti-bulb" style={{ color: "#9ca3af", fontSize: 14 }} />
                <p>{currentRewrite.reason}</p>
              </div>

              <div className="diff-nav">
                <button
                  type="button"
                  onClick={() => setRewriteIndex((i) => Math.max(0, i - 1))}
                  disabled={rewriteIndex === 0}
                  className="diff-nav-btn diff-nav-prev"
                >
                  <i className="ti ti-chevron-left" /> Previous
                </button>
                <button
                  type="button"
                  onClick={() => setRewriteIndex((i) => Math.min(rewrite_suggestions.length - 1, i + 1))}
                  disabled={rewriteIndex === rewrite_suggestions.length - 1}
                  className="diff-nav-btn diff-nav-next"
                >
                  Next suggestion <i className="ti ti-chevron-right" />
                </button>
              </div>
            </div>

            <div className="dots-row">
              {rewrite_suggestions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRewriteIndex(i)}
                  className={`dot-btn ${i === rewriteIndex ? "dot-btn-active" : ""}`}
                  aria-label={`Go to suggestion ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === "Flags" && (
          <div className="panel-card">
            {repetition_flags.length === 0 ? (
              <p className="flags-empty">
                No repeated evidence found — every matched skill had its own distinct support.
              </p>
            ) : (
              repetition_flags.map((flag, i) => (
                <div key={i} className="flag-card">
                  <div className="flag-content">
                    <i className="ti ti-info-circle" style={{ color: "#d97706", fontSize: 16, marginTop: 2 }} />
                    <div>
                      <p className="flag-title">One sentence is doing too much work</p>
                      <p className="flag-quote">"{flag.evidence_quote}"</p>
                      <p className="flag-note">{flag.note}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      <div className="action-bar">
        <span className="action-bar-label">
          Analysed against: {job_title_detected || "—"}
        </span>
        <div className="action-buttons">
          <button
            type="button"
            onClick={() => setShowSaveModal(true)}
            disabled={saveState === "saving" || saveState === "saved"}
            className={`action-btn ${
              saveState === "saved" ? "action-btn-success" : "action-btn-secondary"
            }`}
          >
            {saveState === "saving" && (
              <>
                <i className="ti ti-loader-2" /> <span>Saving…</span>
              </>
            )}
            {saveState === "saved" && (
              <>
                <i className="ti ti-check" /> <span>Saved</span>
              </>
            )}
            {(saveState === "idle" || saveState === "error") && (
              <>
                <i className="ti ti-bookmark" /> <span>Save</span>
              </>
            )}
          </button>
          <button type="button" onClick={handleExportPdf} className="action-btn action-btn-secondary">
            <i className="ti ti-download" /> <span>Export PDF</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="action-btn action-btn-primary"
          >
            <i className="ti ti-refresh" /> <span>Re-scan</span>
          </button>
        </div>
      </div>

      {saveState === "error" && (
        <p className="save-error-toast">{saveError}</p>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}