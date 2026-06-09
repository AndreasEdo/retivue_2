export default function ExplainView({ benGrahamImage, gradcam, loading, error, onExplain }) {
  return (
    <div className="panel">
      <div className="panel__head">
        <span className="panel__title">Grad-CAM Saliency Map</span>
      </div>

      <p className="xai__lead">
        Highlighted areas indicate regions that most influenced the model's prediction.
      </p>

      <div className="xai-grid">
        <figure>
          {benGrahamImage && <img src={benGrahamImage} alt="Ben Graham image" />}
          <figcaption>
            <b>Normalized image</b> — the fundus as the model sees it after
            preprocessing.
          </figcaption>
        </figure>

        <figure>
          {gradcam ? (
            <img src={gradcam.gradcam_image} alt="Grad-CAM heatmap" />
          ) : (
            <div className="xai-empty">
              {loading ? (
                <span>
                  <span className="spinner dark" /> Computing Grad-CAM…
                  <div className="hint" style={{ marginTop: 6 }}>
                    Running on CPU, please wait a moment.
                  </div>
                </span>
              ) : (
                <span>Not loaded yet — press the button below to show the heatmap.</span>
              )}
            </div>
          )}
          <figcaption>
            <b>Grad-CAM</b> — where the model focuses (ideally on lesions such as
            microaneurysms or hemorrhages).
          </figcaption>
        </figure>
      </div>

      {error && (
        <div className="error" style={{ marginTop: 16 }}>
          Failed to load heatmap: {error}
        </div>
      )}

      {!gradcam && (
        <div className="row">
          <button className="ghost" onClick={onExplain} disabled={loading}>
            {loading ? "Processing…" : "Show Grad-CAM"}
          </button>
        </div>
      )}
    </div>
  );
}
