"""
XAI / Explainability — Grad-CAM untuk SwinV2 (endpoint /explain).

Catatan penting (lihat CLAUDE.md Section 8):
- Target = skor regresi (output skalar), BUKAN kelas.
- Target layer = norm di blok terakhir stage terakhir backbone.
- Grid spasial = 8x8 (input 256px, 256/32 = 8).
- timm SwinV2 mengeluarkan fitur channels-last [B, H, W, C] — reshape_transform
  cukup permute ke [B, C, H, W] (bukan reshape token seperti tutorial ViT).
- Jalur ini BUTUH gradien: tidak boleh torch.no_grad(). Dipisah dari /predict.
"""

import cv2
import numpy as np
import torch

from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image

from .preprocessing import preprocess_bytes
from .inference import encode_rgb_to_base64_png

GRID = 8  # 256 / 32


class RegressionScoreTarget:
    """
    Target Grad-CAM untuk model regresi: kembalikan skor skalar itu sendiri
    sebagai 'skor' yang gradiennya dihitung. Model kita output [B] (sudah
    di-squeeze), jadi model_output untuk satu sampel adalah skalar.
    """

    def __call__(self, model_output):
        # model_output bisa berupa tensor 0-dim atau 1-elemen.
        if model_output.dim() == 0:
            return model_output
        return model_output[0]


def reshape_transform(tensor, height=GRID, width=GRID):
    """
    Ubah aktivasi target layer SwinV2 -> [B, C, H, W] untuk Grad-CAM.

    timm SwinV2 umumnya channels-last [B, H, W, C]. Tetap defensif terhadap
    format token [B, N, C] kalau struktur berubah.
    """
    if tensor.dim() == 4:
        # [B, H, W, C] -> [B, C, H, W]
        result = tensor.permute(0, 3, 1, 2)
    elif tensor.dim() == 3:
        # [B, N, C] -> [B, H, W, C] -> [B, C, H, W]
        result = tensor.reshape(tensor.size(0), height, width, tensor.size(2))
        result = result.permute(0, 3, 1, 2)
    else:
        result = tensor
    return result.contiguous()


def get_target_layer(model):
    """
    Layer norm di blok terakhir stage terakhir backbone.
    Diambil dari struktur timm SwinV2 (backbone.layers[-1].blocks[-1].norm1).
    """
    return model.backbone.layers[-1].blocks[-1].norm1


GRADCAM_NOTE = (
    "The heatmap shows the regions that most influenced the prediction; "
    "a verification aid, not proof of a diagnosis."
)


def explain(image_bytes, model):
    """
    Hasilkan overlay Grad-CAM di atas gambar Ben Graham.

    Returns dict siap response /explain.
    """
    ben_rgb, tensor = preprocess_bytes(image_bytes)

    target_layer = get_target_layer(model)

    # GradCAM butuh gradien — JANGAN no_grad / eval-freeze gradien di sini.
    cam = GradCAM(
        model=model,
        target_layers=[target_layer],
        reshape_transform=reshape_transform,
    )

    grayscale_cam = cam(
        input_tensor=tensor,
        targets=[RegressionScoreTarget()],
    )[0]  # [H, W] dalam [0,1]

    # Pastikan ukuran heatmap == ukuran gambar Ben Graham (256x256).
    if grayscale_cam.shape[:2] != ben_rgb.shape[:2]:
        grayscale_cam = cv2.resize(grayscale_cam, (ben_rgb.shape[1], ben_rgb.shape[0]))

    rgb_float = ben_rgb.astype(np.float32) / 255.0
    overlay = show_cam_on_image(rgb_float, grayscale_cam, use_rgb=True)  # RGB uint8

    return {
        "gradcam_image": encode_rgb_to_base64_png(overlay),
        "method": "grad-cam",
        "note": GRADCAM_NOTE,
    }
