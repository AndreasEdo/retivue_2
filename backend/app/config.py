"""
Konfigurasi aplikasi — dibaca dari environment (.env).

Secret (Mongo URI, Cloudinary keys, JWT secret) TIDAK pernah di-hardcode di sini.
Isi nilai aslinya di backend/.env (file itu di-gitignore).
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Database ---
    mongodb_uri: str = "mongodb://localhost:27017"
    db_name: str = "retivue"

    # --- Auth / JWT ---
    jwt_secret: str = "dev-secret-change-me"          # WAJIB diganti di produksi (.env)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24        # 24 jam

    # --- Seed akun demo (Fase 1) ---
    seed_demo: bool = True
    seed_password: str = "Retivue123!"                # password default semua akun demo

    # --- Cloudinary (penyimpanan gambar) ---
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

    # --- AI ---
    ensemble: bool = False

    # --- CORS ---
    cors_origins: str = "*"                            # comma-separated, atau *

    @property
    def cors_list(self) -> list[str]:
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def cloudinary_configured(self) -> bool:
        return bool(self.cloudinary_cloud_name and self.cloudinary_api_key and self.cloudinary_api_secret)


settings = Settings()
