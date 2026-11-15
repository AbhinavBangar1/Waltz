from __future__ import annotations
import numpy as np
from scipy.ndimage import median_filter

def power_to_db(power: np.ndarray, floor_val: float = 1e-6) -> np.ndarray:
    """Convert radiometric radar backscatter linear power to decibels (dB).
    
    Formula: dB = 10 * log10(power)
    """
    clipped = np.clip(power, floor_val, None)
    return 10.0 * np.log10(clipped)

def apply_speckle_filter(data: np.ndarray, size: int = 3) -> np.ndarray:
    """Apply median filter for display-grade speckle reduction."""
    return median_filter(data, size=size)
