import { useEffect, useRef, useState } from "react"
import "../css/LoadingOverlay.css"

const STEPS = [
  { label: "Reading your resume", icon: "ti-file-text" },
  { label: "Mapping the job's requirements", icon: "ti-clipboard-list" },
  { label: "Comparing skills & experience", icon: "ti-git-compare" },
  { label: "Calculating formatting & keyword scores", icon: "ti-chart-bar" },
]

// Caps how far the bar climbs before looping back — it never claims
// 100% until the real result actually arrives and this unmounts.
const MAX_PROGRESS = 94

// Exact circumference of the progress ring (r=68), computed precisely
// rather than using a rounded stand-in — this is what the ring's fill
// math is based on, so it must exactly match the displayed percentage.
const RADIUS = 68
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function LoadingOverlay() {
  const [activeStep, setActiveStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])
  const [progress, setProgress] = useState(0)
  const rafRef = useRef(null)
  const lastTickRef = useRef(performance.now())

  // Drives the progress bar width directly via React state on every
  // animation frame. This does not depend on any CSS @keyframes rule
  // loading correctly — if this function runs, the bar moves.
  useEffect(() => {
    function tick(now) {
      const delta = now - lastTickRef.current
      lastTickRef.current = now

      setProgress((prev) => {
        // Slows down as it approaches the cap, so it never looks
        // "stuck at 94%" abruptly — it eases toward it.
        const remaining = MAX_PROGRESS - prev
        // Tuned so it takes ~9-10 seconds to approach the cap,
        // matching the real 5-15 second wait — not racing there
        // in 2 seconds and then sitting idle awkwardly.
        const speed = 0.0022 + (remaining / MAX_PROGRESS) * 0.004
        const next = prev + delta * speed
        return next >= MAX_PROGRESS ? MAX_PROGRESS : next
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setActiveStep((prev) => {
        setCompletedSteps((done) =>
          done.includes(prev) ? done : [...done, prev]
        )
        const next = (prev + 1) % STEPS.length
        // Small nudge on each step change — enough to feel connected
        // to real milestones, not so much it rushes toward the cap.
        setProgress((p) => Math.min(MAX_PROGRESS, p + 3))
        return next
      })
    }, 2200)

    return () => clearInterval(stepTimer)
  }, [])

  const roundedProgress = Math.round(progress)

  return (
    <div className="loader-overlay">
      <div className="loader-particles">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className={`loader-particle loader-particle-${i}`} />
        ))}
      </div>

      <div className="loader-card">
        <div className="loader-gauge">
          <svg viewBox="0 0 160 160" className="loader-gauge-svg">
            <circle cx="80" cy="80" r="68" className="loader-gauge-track" />
            <circle
              cx="80" cy="80" r="68"
              className="loader-gauge-progress"
              style={{
                strokeDasharray: CIRCUMFERENCE,
                strokeDashoffset: CIRCUMFERENCE - (CIRCUMFERENCE * progress) / 100,
              }}
            />
            <circle cx="80" cy="80" r="52" className="loader-gauge-inner-ring" />
          </svg>
          <div className="loader-gauge-center">
            <span className="loader-gauge-percent">{roundedProgress}%</span>
            <i className="ti ti-scan loader-gauge-icon" />
          </div>
        </div>

        <p className="loader-title">Analysing your resume</p>
        <p className="loader-subtitle">This usually takes 5–15 seconds</p>

        <div className="loader-timeline">
          {STEPS.map((step, i) => {
            const isDone = completedSteps.includes(i)
            const isActive = activeStep === i
            const isLast = i === STEPS.length - 1
            return (
              <div key={step.label} className="loader-timeline-row">
                <div className="loader-timeline-marker-col">
                  <span
                    className={`loader-timeline-dot ${
                      isDone ? "loader-timeline-dot-done" : ""
                    } ${isActive ? "loader-timeline-dot-active" : ""}`}
                  >
                    {isDone ? (
                      <i className="ti ti-check" />
                    ) : (
                      <i className={`ti ${step.icon}`} />
                    )}
                  </span>
                  {!isLast && (
                    <span
                      className={`loader-timeline-connector ${
                        isDone ? "loader-timeline-connector-fill" : ""
                      }`}
                    />
                  )}
                </div>
                <div className="loader-timeline-text">
                  <span
                    className={`loader-timeline-label ${
                      isActive ? "loader-timeline-label-active" : ""
                    } ${isDone ? "loader-timeline-label-done" : ""}`}
                  >
                    {step.label}
                  </span>
                  {isActive && !isDone && (
                    <span className="loader-step-dots">
                      <span /><span /><span />
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="loader-progress-track">
          <div
            className="loader-progress-fill"
            style={{ width: `${progress}%` }}
          >
            <span className="loader-progress-shimmer" />
          </div>
        </div>
        <p className="loader-progress-label">{roundedProgress}% complete</p>
      </div>
    </div>
  )
}