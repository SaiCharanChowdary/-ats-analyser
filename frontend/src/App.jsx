import { useState } from "react"
import axios from "axios"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import UploadPage from "./pages/UploadPage"
import ResultsPage from "./pages/Resultspage"
import AuthPage from "./pages/AuthPage"
import HistoryPage from "./pages/HistoryPage"
import HowItWorksPage from "./pages/HowItWorksPage"

export default function App() {
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)

  const testBackend = async () => {
    setLoading(true)
    try {
      const res = await axios.get("http://localhost:8000/test-ai")
      setResponse(res.data.message)
    } catch (e) {
      setResponse("Error: backend not running")
    }
    setLoading(false)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
      </Routes>
    </BrowserRouter>
  )
}