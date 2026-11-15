from __future__ import annotations
import numpy as np
from scipy.ndimage import median_filter

L_BAND_WAVELENGTH = 0.2384  # meters

def phase_to_displacement_cm(phase: np.ndarray, wavelength: float = L_BAND_WAVELENGTH) -> np.ndarray:
    """Convert unwrapped interferometric phase (radians) to Line-of-Sight (LOS) displacement in cm.
    
    Formula: d = -(wavelength / (4 * pi)) * phase * 100
    """
    disp_meters = -(wavelength / (4.0 * np.pi)) * phase
    return disp_meters * 100.0

def compute_fringes(displacement_cm: np.ndarray, wavelength: float = L_BAND_WAVELENGTH) -> np.ndarray:
    """Compute wrapped fringes modulo half-wavelength.
    
    One fringe cycle corresponds to lambda / 2 (~11.92 cm for L-band).
    Returns normalized phase [0, 1].
    """
    half_wave_cm = (wavelength / 2.0) * 100.0
    wrapped = np.mod(displacement_cm, half_wave_cm) / half_wave_cm
    return wrapped

def mask_low_coherence(
    data: np.ndarray,
    coherence: np.ndarray,
    min_coherence: float = 0.3
) -> np.ndarray:
    """Mask elements where interferometric coherence is below the threshold."""
    masked = np.copy(data)
    masked[coherence < min_coherence] = np.nan
    return masked
