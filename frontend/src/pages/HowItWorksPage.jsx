import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import "../css/HowItWorksPage.css"

function useRevealOnScroll(count) {
  const refs = useRef([])
  const [visible, setVisible] = useState(() => Array(count).fill(false))

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.dataset.index)
            setVisible((prev) => {
              if (prev[index]) return prev
              const next = [...prev]
              next[index] = true
              return next
            })
          }
        })
      },
      { threshold: 0.2 }
    )

    refs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return { refs, visible }
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 64 64" className="hiw-step-icon">
      <rect x="16" y="10" width="32" height="42" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M23 20h18M23 27h18M23 34h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 48v10m0 0l-6-6m6 6l6-6" stroke="var(--hiw-accent-2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChecklistIcon() {
  return (
    <svg viewBox="0 0 64 64" className="hiw-step-icon">
      <rect x="14" y="8" width="36" height="48" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="24" y="4" width="16" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M21 26l3 3 6-6" stroke="var(--hiw-accent-1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 27h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 40l3 3 6-6" stroke="var(--hiw-accent-1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 41h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function EvidenceIcon() {
  return (
    <svg viewBox="0 0 64 64" className="hiw-step-icon">
      <rect x="10" y="14" width="30" height="38" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M17 24h16M17 31h16M17 38h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="42" cy="38" r="12" fill="none" stroke="var(--hiw-accent-3)" strokeWidth="2.5" />
      <path d="M51 47l7 7" stroke="var(--hiw-accent-3)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function ScoreIcon() {
  return (
    <svg viewBox="0 0 64 64" className="hiw-step-icon">
      <circle cx="28" cy="30" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M28 12a18 18 0 0 1 0 36"
        fill="none"
        stroke="var(--hiw-accent-2)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <text x="28" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor" fontFamily="Inter, sans-serif">
        %
      </text>
      <path d="M46 46l8 8m0-8l-8 8" stroke="var(--hiw-accent-1)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

const STEPS = [
  {
    Icon: UploadIcon,
    title: "Upload your resume and the job posting",
    text: "Just a PDF resume and the full job description, pasted as text. No account needed to try it.",
  },
  {
    Icon: ChecklistIcon,
    title: "We build a checklist from this specific job",
    text: "Rather than using one generic skills list for every role, we read the actual posting and extract exactly what it's asking for — whether that's a software engineering role, a nursing position, or anything else.",
  },
  {
    Icon: EvidenceIcon,
    title: "We look for real evidence, not guesses",
    text: "For every item on that checklist, we search your resume for an actual quote proving you have it. If we can't find one, it's marked missing — even if it feels likely you have that skill.",
  },
  {
    Icon: ScoreIcon,
    title: "You get a score, and specific ways to improve it",
    text: "A breakdown across four dimensions, exactly which checklist items you're missing, and rewritten versions of your weakest resume bullets — with the reasoning behind each change.",
  },
]

export default function HowItWorksPage() {
  const { refs, visible } = useRevealOnScroll(STEPS.length)

  return (
    <div className="hiw-page">
      <Navbar />

      <div className="hiw-container">

        <div className="hiw-header">
          <div className="hiw-hero-illustration">
            <div className="hiw-hero-orb hiw-hero-orb-1" />
            <div className="hiw-hero-orb hiw-hero-orb-2" />
            <div className="hiw-hero-orb hiw-hero-orb-3" />
            <svg viewBox="0 0 200 160" className="hiw-hero-svg">
              <rect x="60" y="16" width="80" height="104" rx="6" fill="#ffffff" stroke="#14171f" strokeWidth="2" />
              <path d="M74 40h52M74 52h52M74 64h38M74 76h44M74 88h30" stroke="#d8d5cc" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="150" cy="112" r="26" fill="#2e5e4e" />
              <path d="M138 112l8 8 16-16" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="46" cy="34" r="5" fill="#5b6b8c" opacity="0.5" />
              <circle cx="158" cy="30" r="4" fill="#8b3a3a" opacity="0.4" />
            </svg>
          </div>

          <p className="hiw-eyebrow">How it works</p>
          <h1 className="hiw-title">A score you can actually trust</h1>
          <p className="hiw-subtitle">
            Most resume checkers just count keywords. This tool requires proof
            before it credits you with a skill — here's exactly how.
          </p>
        </div>

        <div className="hiw-steps">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              ref={(el) => (refs.current[i] = el)}
              data-index={i}
              className={`hiw-step ${visible[i] ? "hiw-step-visible" : ""}`}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <div className="hiw-step-icon-wrap">
                <step.Icon />
              </div>
              <div>
                <p className="hiw-step-title">{step.title}</p>
                <p className="hiw-step-text">{step.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="hiw-breakdown-section">
          <h2 className="hiw-section-title">The four parts of your score</h2>
          <div className="hiw-breakdown-grid">
            <div className="hiw-breakdown-card">
              <p className="hiw-breakdown-weight">40%</p>
              <p className="hiw-breakdown-name">Skill match</p>
              <p className="hiw-breakdown-desc">
                How many required and preferred skills your resume proves,
                out of everything the job asks for.
              </p>
            </div>
            <div className="hiw-breakdown-card">
              <p className="hiw-breakdown-weight">30%</p>
              <p className="hiw-breakdown-name">Experience relevance</p>
              <p className="hiw-breakdown-desc">
                How closely your actual work history matches the seniority
                and domain of this specific role.
              </p>
            </div>
            <div className="hiw-breakdown-card">
              <p className="hiw-breakdown-weight">15%</p>
              <p className="hiw-breakdown-name">Formatting clarity</p>
              <p className="hiw-breakdown-desc">
                Whether your resume is well-structured and avoids vague,
                passive bullet points that bury your actual impact.
              </p>
            </div>
            <div className="hiw-breakdown-card">
              <p className="hiw-breakdown-weight">15%</p>
              <p className="hiw-breakdown-name">Keyword density</p>
              <p className="hiw-breakdown-desc">
                How many of the job posting's exact terms show up naturally
                in your resume's language.
              </p>
            </div>
          </div>
        </div>

        <div className="hiw-honesty-section">
          <div className="hiw-honesty-icon">
            <i className="ti ti-shield-check" />
          </div>
          <h2 className="hiw-section-title">An honest note on accuracy</h2>
          <p className="hiw-honesty-text">
            No tool — including this one — can perfectly replicate the exact
            proprietary algorithm a company's real ATS software uses. Systems
            like Workday, Greenhouse, and Lever all work differently, and none
            of them publish their formulas. Even paid tools that charge monthly
            fees are making an informed estimate, not reading the real system.
          </p>
          <p className="hiw-honesty-text">
            What this tool does differently is stay honest about that limit.
            Every match is backed by a quote from your actual resume, every
            score is broken into parts you can inspect, and every gap is
            named specifically — so you get a defensible, evidence-based
            estimate instead of a confident-sounding guess.
          </p>
        </div>

        <div className="hiw-cta">
          <div className="hiw-cta-orb" />
          <p className="hiw-cta-text">Ready to see where your resume stands?</p>
          <Link to="/" className="hiw-cta-btn">
            Start an analysis <i className="ti ti-arrow-right" />
          </Link>
        </div>

      </div>
    </div>
  )
}