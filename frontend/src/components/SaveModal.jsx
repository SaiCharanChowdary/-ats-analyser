import { useState } from "react"
import "../css/SaveModal.css"

export default function SaveModal({ onConfirm, onCancel, isSubmitting }) {
  const [companyName, setCompanyName] = useState("")
  const [roleName, setRoleName] = useState("")
  const [location, setLocation] = useState("")
  const [error, setError] = useState("")

  function handleSubmit(e) {
    e.preventDefault()
    if (!companyName.trim() || !roleName.trim()) {
      setError("Company and role are required.")
      return
    }
    setError("")
    onConfirm({
      companyName: companyName.trim(),
      roleName: roleName.trim(),
      location: location.trim() || null,
    })
  }

  return (
    <div className="save-modal-overlay" onClick={onCancel}>
      <div className="save-modal-card" onClick={(e) => e.stopPropagation()}>
        <p className="save-modal-title">Save this analysis</p>
        <p className="save-modal-subtitle">
          A few details to help you find this later in your history.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="save-modal-label">Company name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Acme Corp"
            className="save-modal-input"
            autoFocus
          />

          <label className="save-modal-label">Role name</label>
          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="e.g. Software Engineer"
            className="save-modal-input"
          />

          <label className="save-modal-label">
            Location <span className="save-modal-optional">(optional)</span>
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Remote, or Austin, TX"
            className="save-modal-input"
          />

          {error && <p className="save-modal-error">{error}</p>}

          <div className="save-modal-actions">
            <button
              type="button"
              onClick={onCancel}
              className="save-modal-btn-cancel"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-modal-btn-confirm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}