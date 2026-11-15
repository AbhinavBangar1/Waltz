from __future__ import annotations
import numpy as np

MIN_DB = -30.0
MAX_DB = 0.0

def quantize_db_to_uint8(db_array: np.ndarray, min_db: float = MIN_DB, max_db: float = MAX_DB) -> np.ndarray:
    """Quantize floating point dB values [-30, 0] into uint8 [1, 255].
    0 is reserved for no-data.
    """
    nan_mask = np.isnan(db_array)
    clipped = np.clip(db_array, min_db, max_db)
    # Scale min_db -> 1, max_db -> 255
    scaled = 1 + np.round(((clipped - min_db) / (max_db - min_db)) * 254.0).astype(np.uint8)
    scaled[nan_mask] = 0
    return scaled

def dequantize_uint8_to_db(uint8_val: int, min_db: float = MIN_DB, max_db: float = MAX_DB) -> float | None:
    """Reconstruct dB value from quantized uint8."""
    if uint8_val == 0:
        return None
    return min_db + ((uint8_val - 1) / 254.0) * (max_db - min_db)
