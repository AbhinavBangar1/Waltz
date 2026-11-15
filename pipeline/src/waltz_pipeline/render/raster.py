from __future__ import annotations
import numpy as np
from PIL import Image

def render_displacement_png(disp_cm: np.ndarray, vmin: float = -20.0, vmax: float = 20.0) -> Image.Image:
    """Render diverging colormap: Red (moved away) -> Cream/White (zero) -> Blue/Cyan (moved toward).
    NaN values become fully transparent (alpha 0).
    """
    rows, cols = disp_cm.shape
    rgba = np.zeros((rows, cols, 4), dtype=np.uint8)
    
    valid = ~np.isnan(disp_cm)
    norm = np.clip((disp_cm[valid] - vmin) / (vmax - vmin), 0.0, 1.0)
    
    # Diverging color palette:
    # 0.0 (negative, away): Deep Rust/Red [194, 65, 12]
    # 0.5 (zero motion): Warm Paper Cream [245, 240, 230]
    # 1.0 (positive, toward): Deep Cyan/Blue [21, 94, 117]
    r = np.zeros_like(norm)
    g = np.zeros_like(norm)
    b = np.zeros_like(norm)
    
    # First half [0.0 to 0.5]
    mask1 = norm < 0.5
    t1 = norm[mask1] * 2.0
    r[mask1] = (194 * (1.0 - t1) + 245 * t1).astype(np.uint8)
    g[mask1] = (65 * (1.0 - t1) + 240 * t1).astype(np.uint8)
    b[mask1] = (12 * (1.0 - t1) + 230 * t1).astype(np.uint8)
    
    # Second half [0.5 to 1.0]
    mask2 = ~mask1
    t2 = (norm[mask2] - 0.5) * 2.0
    r[mask2] = (245 * (1.0 - t2) + 21 * t2).astype(np.uint8)
    g[mask2] = (240 * (1.0 - t2) + 94 * t2).astype(np.uint8)
    b[mask2] = (230 * (1.0 - t2) + 117 * t2).astype(np.uint8)
    
    rgba[valid, 0] = r
    rgba[valid, 1] = g
    rgba[valid, 2] = b
    rgba[valid, 3] = 230  # High opacity
    
    return Image.fromarray(rgba, mode="RGBA")

def render_fringes_png(fringes_norm: np.ndarray) -> Image.Image:
    """Render cyclical InSAR rainbow fringes.
    Matches the concentric line-of-sight fringes seen in the UI designs.
    """
    rows, cols = fringes_norm.shape
    rgba = np.zeros((rows, cols, 4), dtype=np.uint8)
    
    valid = ~np.isnan(fringes_norm)
    theta = fringes_norm[valid] * 2.0 * np.pi
    
    # Sine/Cosine phase palette for smooth cyclical rainbow
    r = np.clip(128 + 127 * np.cos(theta), 0, 255).astype(np.uint8)
    g = np.clip(128 + 127 * np.cos(theta - 2.0 * np.pi / 3.0), 0, 255).astype(np.uint8)
    b = np.clip(128 + 127 * np.cos(theta - 4.0 * np.pi / 3.0), 0, 255).astype(np.uint8)
    
    rgba[valid, 0] = r
    rgba[valid, 1] = g
    rgba[valid, 2] = b
    rgba[valid, 3] = 240
    
    return Image.fromarray(rgba, mode="RGBA")

def render_inundation_png(classes: np.ndarray) -> Image.Image:
    """Render categorical inundation classification:
    0 = Transparent (No change)
    1 = Candidate Open Water Gain (Dark Blue/Teal #155e75)
    2 = Candidate Flooded Veg Gain (Rust/Terracotta #c2410c)
    """
    rows, cols = classes.shape
    rgba = np.zeros((rows, cols, 4), dtype=np.uint8)
    
    water = classes == 1
    rgba[water] = [21, 94, 117, 220]
    
    flooded_veg = classes == 2
    rgba[flooded_veg] = [194, 65, 12, 220]
    
    return Image.fromarray(rgba, mode="RGBA")
