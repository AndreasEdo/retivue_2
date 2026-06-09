// Klien API ke backend RetiVue. Base URL dari env (jangan hardcode).
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7860";

async function postImage(path, file) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.detail) detail = data.detail;
    } catch {
      /* abaikan parse error */
    }
    throw new Error(detail);
  }
  return res.json();
}

export function predict(file) {
  return postImage("/predict", file);
}

export function explain(file) {
  return postImage("/explain", file);
}

export async function health() {
  const res = await fetch(`${API_URL}/health`);
  return res.json();
}
