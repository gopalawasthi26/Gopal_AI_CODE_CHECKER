import { useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const LANGUAGES = [
  'python', 'javascript', 'typescript', 'java', 'c', 'cpp',
  'csharp', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'sql'
]

const PLACEHOLDER = `# Paste your code here to get AI-powered feedback
# Example:

def calculate_average(numbers):
    total = 0
    for n in numbers:
        total = total + n
    avg = total / len(numbers)
    return avg

result = calculate_average([10, 20, 30])
print("Average:", result)`

const GOPAL = {
  name: "Gopal Awasthi",
  role: "Aspiring Software Engineer",
  company: "Programmer Analyst @ Cognizant",
  email: "gopalawasthiji@gmail.com",
  phone: "+91 8273376055",
  linkedin: "https://linkedin.com/in/gopal-awasthi-4b3936263",
  github: "https://github.com/gopalawasthi26",
  photo: "/gopal-cafe.jpg",
  photo2: "/gopal-nature.jpg",
  skills: ["Python", "Java", "FastAPI", "React", "SQL", "Gemini AI", "Git"]
}

function getScoreClass(score) {
  if (score >= 8) return 'score-great'
  if (score >= 6) return 'score-good'
  if (score >= 4) return 'score-warn'
  return 'score-bad'
}
function getBarClass(score) {
  if (score >= 8) return 'bar-great'
  if (score >= 6) return 'bar-good'
  if (score >= 4) return 'bar-warn'
  return 'bar-bad'
}

/* ── Intro / Splash Screen ── */
function IntroScreen({ onEnter, isExiting }) {
  return (
    <div className={`intro-screen${isExiting ? ' exiting' : ''}`}>
      <div className="intro-bg" />
      <div className="intro-overlay" />
      <div className="intro-content">
        <div className="intro-tag">✦ Portfolio Project</div>
        <div className="intro-name">
          {GOPAL.name.split(' ')[0]} <span>{GOPAL.name.split(' ')[1]}</span>
        </div>
        <div className="intro-role">{GOPAL.role}</div>
        <div className="intro-company">{GOPAL.company}</div>

        <div className="intro-project-title">🔍 AI Code Reviewer</div>

        <div className="intro-stack" style={{ marginTop: 12 }}>
          {GOPAL.skills.map(s => (
            <span key={s} className="intro-chip">{s}</span>
          ))}
        </div>

        <button className="intro-enter-btn" onClick={onEnter}>
          Launch App →
        </button>

        <div className="intro-social">
          <a href={GOPAL.github} target="_blank" rel="noreferrer">GitHub</a>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <a href={GOPAL.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <a href={`mailto:${GOPAL.email}`}>{GOPAL.email}</a>
        </div>
      </div>
    </div>
  )
}

/* ── Score Overview ── */
function ScoreOverview({ score, summary }) {
  const cls = getScoreClass(score)
  return (
    <div className="score-overview">
      <div className={`big-score ${cls}`}>{score}<span style={{ fontSize: 13 }}>/10</span></div>
      <div>
        <div className="score-label">Overall Score</div>
        <div className="score-summary">{summary}</div>
      </div>
    </div>
  )
}

/* ── Category Card ── */
function CategoryCard({ icon, name, data, borderColor }) {
  const cls = getScoreClass(data.score)
  const barCls = getBarClass(data.score)
  return (
    <div className="category-card" style={{ borderLeft: `3px solid ${borderColor}` }}>
      <div className="category-header">
        <span className="category-icon">{icon}</span>
        <span className="category-name">{name}</span>
        <span className={`category-score ${cls}`}>{data.score}/10</span>
      </div>
      <div className="score-bar-wrap">
        <div className={`score-bar-fill ${barCls}`} style={{ width: `${data.score * 10}%` }} />
      </div>
      {data.issues && data.issues.length > 0 ? (
        <div className="issues-list">
          {data.issues.map((issue, i) => (
            <div key={i} className="issue-item" style={{ borderLeftColor: borderColor }}>
              {issue.line && issue.line !== 'N/A' && (
                <div className="issue-line" style={{ color: borderColor }}>Line {issue.line}</div>
              )}
              <div className="issue-desc">{issue.description}</div>
              <div className="issue-suggestion">{issue.suggestion}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-issues">✓ No issues found in this category</div>
      )}
    </div>
  )
}

/* ── Improvements ── */
function ImprovementsCard({ improvements }) {
  if (!improvements || improvements.length === 0) return null
  return (
    <div className="improvements-card">
      <div className="improvements-title">⚡ Suggested Improvements</div>
      {improvements.map((tip, i) => (
        <div key={i} className="improvement-item">
          <span className="improvement-bullet">◆</span>
          <span>{tip}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Main App ── */
export default function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleEnter = () => {
    setIsExiting(true)
    setTimeout(() => setShowIntro(false), 700)
  }

  const handleReview = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    setReview(null)
    try {
      const res = await axios.post(`${API_URL}/review`, { code, language })
      setReview(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const { selectionStart, selectionEnd } = e.target
      const newCode = code.substring(0, selectionStart) + '  ' + code.substring(selectionEnd)
      setCode(newCode)
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = selectionStart + 2
      }, 0)
    }
  }

  return (
    <>
      {/* Intro Screen */}
      {showIntro && <IntroScreen onEnter={handleEnter} isExiting={isExiting} />}

      {/* Main App */}
      <div className="app" style={{ opacity: showIntro ? 0 : 1, transition: 'opacity 0.5s ease' }}>

        {/* Header */}
        <header className="header">
          <div className="header-left">
            <div className="header-logo">🔍</div>
            <div>
              <div className="header-title">AI <span>Code</span> Reviewer</div>
              <div className="header-sub">by Gopal Awasthi</div>
            </div>
          </div>
          <div className="header-right">
            <a className="dev-pill" href={GOPAL.github} target="_blank" rel="noreferrer">
              <img className="dev-avatar" src={GOPAL.photo} alt="Gopal" />
              <div>
                <div className="dev-name">Gopal Awasthi</div>
                <div className="dev-handle">@gopalawasthi26</div>
              </div>
            </a>
            <div className="gemini-badge">Gemini 2.0</div>
          </div>
        </header>

        {/* Main */}
        <main className="main">
          {/* Left: Code Input */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <div className="panel-dot" />
                Code Input
              </div>
              <select className="lang-select" value={language} onChange={e => setLanguage(e.target.value)}>
                {LANGUAGES.map(l => (
                  <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                ))}
              </select>
            </div>

            <textarea
              className="code-textarea"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={PLACEHOLDER}
              spellCheck={false}
            />

            <div className="submit-area">
              <button className="submit-btn" onClick={handleReview} disabled={loading || !code.trim()}>
                {loading ? <><div className="spinner" /> Analyzing...</> : <>⚡ Review Code</>}
              </button>
              <span className="char-count">{code.length} / 10000</span>
            </div>
          </div>

          {/* Right: Review Output */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <div className="panel-dot" style={{
                  background: review ? 'var(--green)' : 'var(--text-muted)',
                  boxShadow: review ? '0 0 8px var(--green)' : 'none'
                }} />
                Review Results
              </div>
            </div>

            <div className="review-content">
              {!review && !error && !loading && (
                <div className="empty-state">
                  <div className="empty-icon">🤖</div>
                  <div className="empty-title">Ready to Review</div>
                  <div className="empty-sub">Paste your code on the left and click "Review Code" to get structured AI feedback on correctness, security & readability</div>
                </div>
              )}

              {loading && (
                <div className="empty-state">
                  <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                  <div className="empty-title">Analyzing your code...</div>
                  <div className="empty-sub">Gemini AI is reviewing for correctness, security & readability</div>
                </div>
              )}

              {error && (
                <div className="error-box">
                  <span>⚠️</span>
                  <div><strong>Error: </strong>{error}</div>
                </div>
              )}

              {review && (
                <>
                  <ScoreOverview score={review.overall_score} summary={review.summary} />
                  <CategoryCard icon="✓" name="Correctness" data={review.correctness} borderColor="var(--accent)" />
                  <CategoryCard icon="🛡" name="Security" data={review.security} borderColor="var(--red)" />
                  <CategoryCard icon="📖" name="Readability" data={review.readability} borderColor="var(--purple)" />
                  <ImprovementsCard improvements={review.improvements} />
                </>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-left">
            <img className="footer-avatar" src={GOPAL.photo} alt="Gopal" />
            <span>Built by <span>{GOPAL.name}</span> · {GOPAL.role}</span>
          </div>
          <div className="footer-right">
            <a className="footer-link" href={GOPAL.github} target="_blank" rel="noreferrer">GitHub</a>
            <a className="footer-link" href={GOPAL.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            <a className="footer-link" href={`mailto:${GOPAL.email}`}>{GOPAL.email}</a>
          </div>
        </footer>

      </div>
    </>
  )
}
