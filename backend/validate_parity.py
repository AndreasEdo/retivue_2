"""
Validasi cepat backend tanpa server:
  1. Load checkpoint + arsitektur (cek state_dict cocok).
  2. Cetak struktur checkpoint & threshold.
  3. Forward pass dummy -> skor -> grade.
  4. (Opsional) kalau diberi path gambar argv[1]: jalankan /predict & /explain.

Jalankan:
    python validate_parity.py [path_gambar_fundus.png]
"""

import sys
import numpy as np
import torch

from app.model import load_model, DRSwinV2Model, DR_CLASS_NAMES
from app.inference import predict, score_to_grade
from app.explain import explain, get_target_layer, reshape_transform

CKPT = "models/swinv2_best_fold1.pth"


def main():
    print("== 1. Load checkpoint ==")
    raw = torch.load(CKPT, map_location="cpu", weights_only=False)
    print("  keys:", list(raw.keys()))
    print("  epoch:", raw.get("epoch"))
    print("  thresholds:", raw.get("thresholds"))
    if "metrics" in raw:
        print("  metrics:", raw["metrics"])

    print("\n== 2. Build model + load_state_dict ==")
    model, thresholds = load_model(CKPT)
    print("  backbone.num_features:", model.backbone.num_features)
    print("  thresholds dipakai:", thresholds)
    n = sum(p.numel() for p in model.parameters())
    print(f"  total params: {n/1e6:.1f}M")

    print("\n== 3. Forward dummy ==")
    with torch.no_grad():
        out = model(torch.zeros(1, 3, 256, 256))
    print("  output shape:", tuple(out.shape), "| skor:", float(out.item()))
    g = score_to_grade(float(out.item()), thresholds)
    print("  grade:", g, DR_CLASS_NAMES[g])

    print("\n== 4. Cek target layer Grad-CAM ==")
    tl = get_target_layer(model)
    print("  target layer:", tl.__class__.__name__)
    captured = {}
    h = tl.register_forward_hook(lambda m, i, o: captured.update(shape=tuple(o.shape)))
    with torch.no_grad():
        model(torch.zeros(1, 3, 256, 256))
    h.remove()
    print("  aktivasi target layer shape:", captured.get("shape"))
    t = torch.zeros(*captured["shape"])
    print("  reshape_transform ->", tuple(reshape_transform(t).shape), "(harus [B,C,H,W])")

    if len(sys.argv) > 1:
        path = sys.argv[1]
        print(f"\n== 5. /predict gambar nyata: {path} ==")
        with open(path, "rb") as f:
            data = f.read()
        res = predict(data, [model], thresholds)
        res_print = {k: v for k, v in res.items() if k != "ben_graham_image"}
        print(" ", res_print)

        print("\n== 6. /explain (Grad-CAM) ==")
        ex = explain(data, model)
        print("  method:", ex["method"], "| gradcam_image len:", len(ex["gradcam_image"]))
        print("  OK ✅")

    print("\n✅ Validasi struktur selesai.")


if __name__ == "__main__":
    main()
