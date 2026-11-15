import pytest
import numpy as np
import yaml
from pathlib import Path

from waltz_pipeline.config import PackConfig
from waltz_pipeline.products.gunw import (
    phase_to_displacement_cm,
    compute_fringes,
    mask_low_coherence,
    L_BAND_WAVELENGTH
)
from waltz_pipeline.products.gcov import power_to_db
from waltz_pipeline.process.change import classify_inundation, CLASS_WATER_GAIN, CLASS_FLOODED_VEG
from waltz_pipeline.process.timeseries import quantize_db_to_uint8, dequantize_uint8_to_db

def test_phase_to_displacement():
    # If phase is -4 * pi, displacement should be exactly wavelength * 100 cm
    phase = np.array([-4.0 * np.pi])
    disp = phase_to_displacement_cm(phase, wavelength=0.2384)
    assert np.isclose(disp[0], 23.84)

def test_compute_fringes():
    half_wave = (0.2384 / 2.0) * 100.0
    disp = np.array([0.0, half_wave * 0.5, half_wave, half_wave * 1.5])
    fringes = compute_fringes(disp, wavelength=0.2384)
    assert np.isclose(fringes[0], 0.0)
    assert np.isclose(fringes[1], 0.5)
    assert np.isclose(fringes[2], 0.0)
    assert np.isclose(fringes[3], 0.5)

def test_power_to_db():
    power = np.array([1.0, 0.1, 0.01])
    db = power_to_db(power)
    assert np.isclose(db[0], 0.0)
    assert np.isclose(db[1], -10.0)
    assert np.isclose(db[2], -20.0)

def test_quantization_roundtrip():
    original = np.array([-30.0, -20.0, -10.0, 0.0])
    quantized = quantize_db_to_uint8(original)
    assert quantized.dtype == np.uint8
    assert quantized[0] == 1
    assert quantized[-1] == 255
    
    # Dequantize error must be below 0.15 dB (TRD section 8)
    for orig, q in zip(original, quantized):
        reconstructed = dequantize_uint8_to_db(int(q))
        assert abs(orig - reconstructed) < 0.15

def test_inundation_classification():
    # Open water: low HV and negative delta
    target_hv = np.array([-22.0])
    target_hh = np.array([-20.0])
    ref_hv = np.array([-15.0])
    ref_hh = np.array([-12.0])
    classes, _ = classify_inundation(target_hv, target_hh, ref_hv, ref_hh)
    assert classes[0] == CLASS_WATER_GAIN

def test_pack_configs_valid():
    packs = ["venezuela-quake-2026", "floodplain-wet-season", "crop-cycle-radar"]
    for p in packs:
        path = Path("packs-src") / p / "pack.yaml"
        assert path.exists()
        with open(path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
            config = PackConfig.model_validate(data)
            assert config.id == p
