import { useEffect, useState } from "react";
import UploadCard from "./components/UploadCard.jsx";
import ResultCard from "./components/ResultCard.jsx";
import ExplainView from "./components/ExplainView.jsx";
import { predict, explain, health } from "./lib/api.js";

export default function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [gradcam, setGradcam] = useState(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState(null);

  const [online, setOnline] = useState(null); // null = belum dicek

  useEffect(() => {
    let alive = true;
    health()
      .then((d) => alive && setOnline(d?.model_loaded === true))
      .catch(() => alive && setOnline(false));
    return () => {
      alive = false;
    };
  }, []);

  function onSelect(f) {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResult(null);
    setError(null);
    setGradcam(null);
    setExplainError(null);
  }

  async function onAnalyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setGradcam(null);
    try {
      const data = await predict(file);
      setResult(data);
      setOnline(true);
    } catch (e) {
      setError(e.message || "Something went wrong during analysis.");
    } finally {
      setLoading(false);
    }
  }

  async function onExplain() {
    if (!file) return;
    setExplainLoading(true);
    setExplainError(null);
    try {
      const data = await explain(file);
      setGradcam(data);
    } catch (e) {
      setExplainError(e.message || "Something went wrong while loading the heatmap.");
    } finally {
      setExplainLoading(false);
    }
  }

  const statusText =
    online === null ? "Checking…" : online ? "Model ready" : "Backend offline";
  const statusClass = online === null ? "" : online ? "ok" : "down";

  return (
    <>
      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand">
            <img className="brand__logo" src="/logo.jpg" alt="Retivue" />
            <span className="brand__sub">Diabetic retinopathy<br />triage screening</span>
          </div>
          <span className="status">
            <span className={`status__dot ${statusClass}`} />
            {statusText}
          </span>
        </div>
      </header>

      <main className="page">
        <section className="hero">
          <h1>Support early detection of diabetic retinopathy from fundus photos.</h1>
          <p>
            Upload a single retinal fundus image. The system estimates the severity
            (grade 0–4) as a triage aid to support healthcare workers — not a
            replacement for an ophthalmologist's examination.
          </p>
        </section>

        <div className="grid">
          <UploadCard
            file={file}
            previewUrl={previewUrl}
            onSelect={onSelect}
            onAnalyze={onAnalyze}
            loading={loading}
          />

          {error && <div className="panel error">{error}</div>}

          {result && <ResultCard result={result} />}

          {result && (
            <ExplainView
              benGrahamImage={result.ben_graham_image}
              gradcam={gradcam}
              loading={explainLoading}
              error={explainError}
              onExplain={onExplain}
            />
          )}
        </div>
      </main>

      <footer className="footer">
        <hr />
        RetiVue is an AI-assisted screening tool and does not provide a diagnosis.
        Results must always be verified by an ophthalmologist. No patient data is
        stored by this application.
      </footer>
    </>
  );
}
