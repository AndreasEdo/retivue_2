// Klien API RetiVue — JWT + semua endpoint role. Base URL dari env.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7860";
const TOKEN_KEY = "retivue_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(path, { method = "GET", body, form, auth = true } = {}) {
  const headers = {};
  if (auth) {
    const t = getToken();
    if (t) headers["Authorization"] = `Bearer ${t}`;
  }
  let payload;
  if (form) {
    payload = form; // FormData / URLSearchParams — biarkan browser set Content-Type
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${path}`, { method, headers, body: payload });
  if (res.status === 401) {
    clearToken();
  }
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.detail) detail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
    } catch { /* ignore */ }
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ---------------- Auth ----------------
export async function login(email, password) {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);
  const data = await request("/auth/login", { method: "POST", form, auth: false });
  setToken(data.access_token);
  return data.user;
}

export async function registerPatient(payload) {
  const data = await request("/auth/register", { method: "POST", body: payload, auth: false });
  setToken(data.access_token);
  return data.user;
}

export const me = () => request("/auth/me");
export const health = () => request("/health", { auth: false });

// ---------------- Admin ----------------
export const adminListUsers = (role) => request(`/admin/users${role ? `?role=${role}` : ""}`);
export const adminCreateStaff = (payload) => request("/admin/users", { method: "POST", body: payload });
export const adminSetUserStatus = (id, active) =>
  request(`/admin/users/${id}/status?active=${active}`, { method: "PATCH" });
export const adminListPatients = () => request("/admin/patients");
export const adminListSchedules = () => request("/admin/schedules");
export const adminCreateSchedule = (payload) => request("/admin/schedules", { method: "POST", body: payload });
export const adminDeleteSchedule = (id) => request(`/admin/schedules/${id}`, { method: "DELETE" });
export const adminMonitoring = () => request("/admin/monitoring");

// ---------------- Medical Record ----------------
export const mrPatients = () => request("/mr/patients");
export const mrDoctors = () => request("/mr/doctors");
export const mrDashboard = () => request("/mr/dashboard");
export const mrHistory = () => request("/mr/submissions");
export const mrRejected = () => request("/mr/submissions/rejected");
export const mrCase = (id) => request(`/mr/submissions/${id}`);
export function mrCreateSubmission(fields, file) {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => { if (v !== undefined && v !== null) form.append(k, v); });
  form.append("file", file);
  return request("/mr/submissions", { method: "POST", form });
}
export function mrResubmit(id, file) {
  const form = new FormData();
  form.append("file", file);
  return request(`/mr/submissions/${id}/resubmit`, { method: "POST", form });
}

// ---------------- Doctor ----------------
export const doctorDashboard = () => request("/doctor/dashboard");
export const doctorCases = (status = "waiting") => request(`/doctor/cases?status=${status}`);
export const doctorCase = (id) => request(`/doctor/cases/${id}`);
export const doctorApprove = (id, payload) => request(`/doctor/cases/${id}/approve`, { method: "POST", body: payload });
export const doctorReject = (id, reject_note) => request(`/doctor/cases/${id}/reject`, { method: "POST", body: { reject_note } });

// Doctor schedule approval
export const doctorMySchedules = () => request("/doctor/schedules");
export const doctorApproveSchedule = (id) => request(`/doctor/schedules/${id}/approve`, { method: "POST" });
export const doctorRejectSchedule = (id) => request(`/doctor/schedules/${id}/reject`, { method: "POST" });

// ---------------- Patient ----------------
export const patientDoctors = () => request("/patient/doctors");
export const patientSchedules = (doctorId) => request(`/patient/schedules${doctorId ? `?doctor_id=${doctorId}` : ""}`);
export const patientBook = (payload) => request("/patient/appointments", { method: "POST", body: payload });
export const patientAppointments = () => request("/patient/appointments");
export const patientReports = () => request("/patient/reports");
export const patientReport = (id) => request(`/patient/reports/${id}`);
