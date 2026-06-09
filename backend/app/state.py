"""State global model AI (di-load sekali saat startup, dibaca oleh router)."""

STATE = {"models": None, "thresholds": None, "mode": None}


def models_ready() -> bool:
    return STATE["models"] is not None
