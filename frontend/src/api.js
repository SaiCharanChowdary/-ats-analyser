import axios from "axios"

const API_BASE_URL = "http://localhost:8000"

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function analyseResume(resumeFile, jdText) {
  const formData = new FormData()
  formData.append("resume", resumeFile)
  formData.append("jd_text", jdText)

  const response = await api.post("/analyse/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response.data
}

export async function registerUser(email, password) {
  const response = await api.post("/auth/register", { email, password })
  return response.data
}

export async function loginUser(email, password) {
  const response = await api.post("/auth/login", { email, password })
  return response.data
}

export async function saveAnalysis({
  jobTitle,
  companyName,
  roleName,
  location,
  atsScore,
  jdText,
  resumeFileId,
  fullResult,
}) {
  const response = await api.post("/analyses/save", {
    job_title: jobTitle,
    company_name: companyName,
    role_name: roleName,
    location: location,
    ats_score: atsScore,
    jd_text: jdText,
    resume_file_id: resumeFileId,
    full_result: fullResult,
  })
  return response.data
}

export async function getMyAnalyses() {
  const response = await api.get("/analyses/mine")
  return response.data
}

export async function deleteAnalysis(id) {
  const response = await api.delete(`/analyses/${id}`)
  return response.data
}

export async function getResumeUrl(id) {
  const response = await api.get(`/analyses/${id}/resume`)
  return response.data.url
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem("access_token"))
}

export function logout() {
  localStorage.removeItem("access_token")
}

export default api