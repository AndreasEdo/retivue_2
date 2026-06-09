"""
Arsitektur model + loader checkpoint.

DRSwinV2Model disalin PERSIS dari notebook (arsitektur & urutan head harus 1:1
dengan training, kalau tidak load_state_dict gagal / prediksi salah).
"""

import os
import numpy as np
import torch
import torch.nn as nn
import timm

MODEL_NAME = "swinv2_base_window16_256"
NUM_CLASSES = 1  # regression output (skor kontinu)

# Threshold default kalau checkpoint tidak punya 'thresholds'.
DEFAULT_THRESHOLDS = [0.5, 1.5, 2.5, 3.5]

DR_CLASS_NAMES = [
    "No DR",
    "Mild",
    "Moderate",
    "Severe",
    "Proliferative DR",
]

# Selalu CPU — HF Spaces free tier tidak punya GPU.
DEVICE = torch.device("cpu")


class DRSwinV2Model(nn.Module):
    """
    SwinV2-Base backbone + regression head.

    Saat inference pakai pretrained=False: bobot ImageNet tidak perlu di-download
    karena model_state_dict di checkpoint sudah berisi seluruh bobot.

    Head (urutan persis dari notebook):
        Dropout(0.3) -> Linear(in_features, 512) -> SiLU() -> Linear(512, 1)
    forward() mengembalikan output.squeeze(1) -> shape [B] (satu skalar per gambar).
    """

    def __init__(self, pretrained=False):
        super().__init__()

        self.backbone = timm.create_model(
            MODEL_NAME,
            pretrained=pretrained,
            num_classes=0,        # buang classifier head bawaan
            global_pool="avg",    # global average pooling
        )

        in_features = self.backbone.num_features  # jangan hardcode

        self.head = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(in_features, 512),
            nn.SiLU(),
            nn.Linear(512, NUM_CLASSES),
        )

    def forward(self, x):
        features = self.backbone(x)   # [B, num_features]
        output = self.head(features)  # [B, 1]
        return output.squeeze(1)      # [B] — aman untuk batch_size=1


def load_model(checkpoint_path):
    """
    Load model + threshold dari checkpoint .pth.

    Checkpoint adalah dict (bukan state_dict mentah), jadi WAJIB weights_only=False
    (PyTorch >= 2.6 default-nya True dan akan gagal karena ada objek non-tensor
    seperti 'config' di dalam checkpoint).

    Returns:
        (model, thresholds)
    """
    if not os.path.exists(checkpoint_path):
        raise FileNotFoundError(
            f"Checkpoint tidak ditemukan: {checkpoint_path}. "
            "Pastikan file .pth ada di backend/models/."
        )

    ckpt = torch.load(checkpoint_path, map_location=DEVICE, weights_only=False)

    model = DRSwinV2Model(pretrained=False).to(DEVICE)
    model.load_state_dict(ckpt["model_state_dict"])
    model.eval()

    thresholds = ckpt.get("thresholds", DEFAULT_THRESHOLDS)
    return model, thresholds


def load_models(checkpoint_paths):
    """
    Load satu atau beberapa fold sekaligus (untuk ensemble).

    Returns:
        (models, thresholds)
        models     : list[DRSwinV2Model]
        thresholds : rata-rata threshold antar-fold (atau threshold tunggal kalau 1 fold).
                     Sama seperti avg_thresholds di ensemble_predict notebook.
    """
    import gc

    models = []
    all_thresholds = []
    for path in checkpoint_paths:
        model, thr = load_model(path)
        models.append(model)
        all_thresholds.append(thr)
        gc.collect()  # bebaskan dict checkpoint transien sebelum load fold berikutnya

    avg_thresholds = [float(x) for x in np.mean(all_thresholds, axis=0)]
    return models, avg_thresholds


def warmup(models):
    """Satu forward pass dummy per model supaya request pertama tidak kena lazy-init lambat."""
    model_list = models if isinstance(models, (list, tuple)) else [models]
    with torch.no_grad():
        dummy = torch.zeros(1, 3, 256, 256, device=DEVICE)
        for m in model_list:
            m(dummy)
