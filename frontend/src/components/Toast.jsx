import { useEffect } from "react"
import "../css/Toast.css"

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3200)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`toast toast-${type}`}>
      <i className={`ti ${type === "success" ? "ti-circle-check" : "ti-alert-circle"}`} />
      <span>{message}</span>
    </div>
  )
}