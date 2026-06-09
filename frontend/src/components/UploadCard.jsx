import { useRef, useState } from "react";

function UploadIcon() {
  return (
    <svg className="dropzone__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 14v3a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function UploadCard({ file, previewUrl, onSelect, onAnalyze, loading }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);

  function handleFiles(files) {
    const f = files?.[0];
    if (f && f.type.startsWith("image/")) onSelect(f);
  }

  return (
    <div className="panel">
      <div className="panel__head">
        <span className="panel__title">Patient Fundus Image Upload</span>
      </div>
      <div className="panel__subtitle">
        Accepted format: JPG, PNG — Minimum resolution: 512×512px
      </div>

      <div
        className={`dropzone ${drag ? "drag" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        {previewUrl ? (
          <div className="preview">
            <img src={previewUrl} alt="Pratinjau fundus" />
            <div>
              <div className="preview__name">{file?.name}</div>
              <div className="hint" style={{ marginTop: 4 }}>
                Click to change image
              </div>
            </div>
          </div>
        ) : (
          <>
            <UploadIcon />
            <div className="dropzone__title">Drag &amp; drop an image here</div>
            <div className="hint" style={{ marginTop: 4 }}>
              or click to choose a file · PNG / JPG
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div className="row">
        <button onClick={onAnalyze} disabled={!file || loading}>
          {loading && <span className="spinner" />}
          {loading ? "Loading model, please wait…" : "Run DR Analysis"}
        </button>
        {file && !loading && (
          <span className="hint">Processing runs on the server and takes only a few seconds.</span>
        )}
      </div>
    </div>
  );
}
