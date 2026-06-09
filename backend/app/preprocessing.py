"""
Preprocessing Ben Graham — disalin PERSIS dari notebook training.

Paritas preprocessing adalah segalanya: kalau urutan/parameter berbeda
sedikit saja dari notebook, prediksi akan ngaco. Jangan ubah apa pun di sini
tanpa mengubah notebook juga.

Pipeline:
    cv2.imread() -> BGR -> RGB -> crop border hitam -> resize 256x256
    -> Ben Graham contrast -> Normalize(ImageNet) -> ToTensorV2 -> unsqueeze(0)
"""

import cv2
import numpy as np
import albumentations as A
from albumentations.pytorch import ToTensorV2

IMG_SIZE = 256

# Normalisasi ImageNet — sama dengan get_valid_transforms() di notebook.
NORM_MEAN = [0.485, 0.456, 0.406]
NORM_STD = [0.229, 0.224, 0.225]


def crop_image_from_gray(img, tol=7):
    """
    Buang border hitam dominan pada gambar fundus retina.
    Piksel grayscale <= tol dianggap background gelap dan dipotong.
    Disalin persis dari notebook.
    """
    if img.ndim == 2:
        mask = img > tol
        return img[np.ix_(mask.any(1), mask.any(0))]

    elif img.ndim == 3:
        gray_img = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        mask = gray_img > tol

        check_shape = img[:, :, 0][np.ix_(mask.any(1), mask.any(0))].shape[0]

        if check_shape == 0:
            # Gambar terlalu gelap seluruhnya — jangan crop, kembalikan apa adanya.
            return img

        img1 = img[:, :, 0][np.ix_(mask.any(1), mask.any(0))]
        img2 = img[:, :, 1][np.ix_(mask.any(1), mask.any(0))]
        img3 = img[:, :, 2][np.ix_(mask.any(1), mask.any(0))]

        return np.stack([img1, img2, img3], axis=-1)

    return img


def ben_color_preprocessing(image, sigmaX=10):
    """
    Ben Graham's preprocessing (disalin persis dari notebook):
      1. BGR -> RGB
      2. Crop border hitam
      3. Resize 256x256
      4. Gaussian local normalization (enhance contrast):
         result = 4*img - 4*GaussianBlur(img) + 128

    Input  : array hasil cv2.imread() (format BGR, uint8).
    Output : array RGB uint8 256x256 (citra "yang dilihat model").
    """
    # Step 1: BGR -> RGB
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    # Step 2: Crop border hitam
    image = crop_image_from_gray(image)
    # Step 3: Resize 256x256
    image = cv2.resize(image, (IMG_SIZE, IMG_SIZE))
    # Step 4: Ben Graham contrast enhancement
    image = cv2.addWeighted(
        image, 4,
        cv2.GaussianBlur(image, (0, 0), sigmaX), -4,
        128,
    )
    return image


def get_valid_transforms():
    """
    Transform validasi (TANPA augmentasi) — sama persis dengan notebook.
    Hanya Normalize + ToTensor.
    """
    return A.Compose([
        A.Normalize(mean=NORM_MEAN, std=NORM_STD),
        ToTensorV2(),
    ])


# Satu instance transform dipakai ulang (transform validasi bersifat stateless).
_VALID_TRANSFORM = get_valid_transforms()


def preprocess_bytes(image_bytes):
    """
    Decode bytes gambar -> Ben Graham -> tensor siap model.

    Returns:
        (ben_rgb, tensor)
        ben_rgb : np.ndarray RGB uint8 256x256 (untuk ditampilkan / overlay XAI)
        tensor  : torch.Tensor [1, C, H, W] (input model)

    Raises:
        ValueError kalau bytes bukan gambar valid.
    """
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    image_bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if image_bgr is None:
        raise ValueError("File is not a valid image or the image is corrupted.")

    ben_rgb = ben_color_preprocessing(image_bgr)
    tensor = _VALID_TRANSFORM(image=ben_rgb)["image"].unsqueeze(0)  # [1, C, H, W]
    return ben_rgb, tensor
