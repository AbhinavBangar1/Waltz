from __future__ import annotations
import numpy as np

CLASS_NO_CHANGE = 0
CLASS_WATER_GAIN = 1
CLASS_FLOODED_VEG = 2

def classify_inundation(
    target_hv_db: np.ndarray,
    target_hh_db: np.ndarray,
    ref_hv_db: np.ndarray,
    ref_hh_db: np.ndarray,
    open_water_hv_max_db: float = -18.0,
    change_threshold_db: float = -3.0,
    flooded_veg_delta_min_db: float = 3.0,
) -> tuple[np.ndarray, np.ndarray]:
    """Classify wetland inundation change from GCOV backscatter pairs.
    
    Returns:
        classification_raster: 0=no change, 1=water gain, 2=flooded veg gain
        delta_hv_db: unclassified delta layer (target - reference)
    """
    delta_hv = target_hv_db - ref_hv_db
    delta_hh = target_hh_db - ref_hh_db
    
    classes = np.zeros_like(target_hv_db, dtype=np.uint8)
    
    # Open water condition: low backscatter and substantial decrease
    water_mask = (target_hv_db <= open_water_hv_max_db) & (delta_hv <= change_threshold_db)
    classes[water_mask] = CLASS_WATER_GAIN
    
    # Flooded vegetation condition: HH double-bounce surge with maintained HV
    flooded_veg_mask = (delta_hh >= flooded_veg_delta_min_db) & (target_hv_db > -22.0)
    # Give priority to flooded veg where double bounce occurs
    classes[flooded_veg_mask] = CLASS_FLOODED_VEG
    
    return classes, delta_hv
