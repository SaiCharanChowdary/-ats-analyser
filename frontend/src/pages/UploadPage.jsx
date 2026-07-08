import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import LoadingOverlay from "../components/LoadingOverlay"
import { analyseResume } from "../api"
import "../css/UploadPage.css"

export default function UploadPage() {
  const [resumeFile, setResumeFile] = useState(null)
  const [jdText, setJdText] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [errors, setErrors] = useState({ resume: "", jd: "" })
  const [isAnalysing, setIsAnalysing] = useState(false)
  const [serverError, setServerError] = useState("")

  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const wordCount = jdText.trim().length === 0 ? 0 : jdText.trim().split(/\s+/).length

  function handleFileSelect(file) {
    if (!file) return
    if (file.type !== "application/pdf") {
      setErrors((prev) => ({ ...prev, resume: "Only PDF files are accepted." }))
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, resume: "File is larger than 10MB." }))
      return
    }
    setErrors((prev) => ({ ...prev, resume: "" }))
    setResumeFile(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files[0])
  }

  function handleJdChange(e) {
    setJdText(e.target.value)
    if (errors.jd) {
      setErrors((prev) => ({ ...prev, jd: "" }))
    }
  }

  async function handleSubmit() {
    const newErrors = { resume: "", jd: "" }

    if (!resumeFile) {
      newErrors.resume = "Attach a resume before continuing."
    }
    if (jdText.trim().length < 50) {
      newErrors.jd = "Paste the full job description — at least a few sentences."
    }

    setErrors(newErrors)
    if (newErrors.resume || newErrors.jd) return

    setServerError("")
    setIsAnalysing(true)
    try {
      const result = await analyseResume(resumeFile, jdText)
      // jdText travels forward alongside the result so it's available
      // later if this analysis gets saved to history.
      navigate("/results", { state: { result, jdText } })
    } catch (err) {
      setServerError(
        "Something went wrong reaching the analysis service. Try again in a moment."
      )
    } finally {
      setIsAnalysing(false)
    }
  }

  return (
    <div className="upload-page">
      {isAnalysing && <LoadingOverlay />}
      <Navbar />

      <div className="upload-container">
        <div className="upload-content">

          <div className="upload-header">
            <p className="upload-eyebrow">Resume Analysis</p>
            <h1 className="upload-title">Two documents, one verdict</h1>
            <p className="upload-subtitle">
              An evidence-based score, built from what your resume actually proves
              against what the role actually requires.
            </p>
          </div>

          <div className="upload-card">
            <div className="upload-grid">

              <div className="upload-panel">
                <div className="panel-label-row">
                  <span className="label-dot label-dot-resume" />
                  <p className="panel-label panel-label-resume">What you bring</p>
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`dropzone ${isDragging ? "dropzone-dragging" : ""}`}
                >
                  {resumeFile ? (
                    <>
                      <div className="dropzone-icon-circle dropzone-icon-circle-success">
                        <i className="ti ti-file-check dropzone-icon-success" />
                      </div>
                      <p className="dropzone-filename">{resumeFile.name}</p>
                      <button
                        type="button"
                        onClick={() => setResumeFile(null)}
                        className="remove-file-btn"
                      >
                        Remove and choose another
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="dropzone-icon-circle">
                        <i className="ti ti-file-upload dropzone-icon" />
                      </div>
                      <p className="dropzone-title">Drop your resume here</p>
                      <p className="dropzone-or">or</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="browse-btn"
                      >
                        Browse files
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        style={{ display: "none" }}
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                      />
                      <p className="dropzone-hint">PDF only · up to 10MB</p>
                    </>
                  )}
                </div>
                {errors.resume && (
                  <p className="error-text">
                    <i className="ti ti-alert-circle" />
                    {errors.resume}
                  </p>
                )}
              </div>

              <div className="upload-divider" />

              <div className="upload-panel">
                <div className="panel-label-row-between">
                  <div className="panel-label-row" style={{ marginBottom: 0 }}>
                    <span className="label-dot label-dot-jd" />
                    <p className="panel-label panel-label-jd">What's required</p>
                  </div>
                  <p className="word-count">
                    {wordCount} {wordCount === 1 ? "word" : "words"}
                  </p>
                </div>

                <textarea
                  value={jdText}
                  onChange={handleJdChange}
                  placeholder="Paste the complete job posting — responsibilities and qualifications both shape the checklist."
                  className="jd-textarea"
                />
                {errors.jd && (
                  <p className="error-text">
                    <i className="ti ti-alert-circle" />
                    {errors.jd}
                  </p>
                )}
              </div>
            </div>

            <div className="upload-footer">
              <div className="privacy-note">
                <i className="ti ti-lock" style={{ fontSize: 13, color: "#9c9a92" }} />
                <p className="privacy-text">Nothing is stored unless you choose to save it</p>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isAnalysing}
                className="submit-btn"
              >
                {isAnalysing ? "Comparing…" : "Compare documents"}
                {!isAnalysing && <i className="ti ti-arrow-right" style={{ fontSize: 15 }} />}
              </button>
            </div>
          </div>

          {serverError && <p className="server-error">{serverError}</p>}

          <div className="trust-strip">
            <div className="trust-item">
              <i className="ti ti-check trust-icon" />
              <p className="trust-text">Evidence-based scoring</p>
            </div>
            <div className="trust-item">
              <i className="ti ti-check trust-icon" />
              <p className="trust-text">Works for any role</p>
            </div>
            <div className="trust-item">
              <i className="ti ti-check trust-icon" />
              <p className="trust-text">No account required</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}