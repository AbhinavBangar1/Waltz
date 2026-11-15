from __future__ import annotations
import os
import json
import yaml
import numpy as np
from datetime import datetime
from pathlib import Path
from PIL import Image

from waltz_pipeline.config import PackConfig, PackManifest, LayerManifest
from waltz_pipeline.products.gunw import (
    phase_to_displacement_cm,
    compute_fringes,
    mask_low_coherence,
    L_BAND_WAVELENGTH
)
from waltz_pipeline.products.gcov import power_to_db, apply_speckle_filter
from waltz_pipeline.process.change import classify_inundation
from waltz_pipeline.process.timeseries import quantize_db_to_uint8
from waltz_pipeline.render.raster import (
    render_displacement_png,
    render_fringes_png,
    render_inundation_png
)

def build_venezuela_quake_pack(config: PackConfig, output_dir: Path) -> PackManifest:
    """Builds precomputed static layers for the Venezuela Earthquake Pack."""
    os.makedirs(output_dir, exist_ok=True)
    rows, cols = 400, 400
    
    # Generate realistic coseismic fault displacement (strike-slip dislocation)
    y, x = np.mgrid[-2:2:400j, -2:2:400j]
    r = np.sqrt(x**2 + y**2)
    angle = np.arctan2(y, x)
    
    # Fault discontinuity along y=0, with opposing lobes
    slip = 18.0 * np.tanh(x * 2.5) * np.exp(-r**1.5)
    # Add fault-zone strain
    disp_cm = slip + 2.0 * np.sin(x * 6.0) * np.exp(-abs(y)*2.0)
    
    # Coherence field: lower in dense riverbeds/jungles, high on bedrock
    coherence = 0.85 - 0.4 * np.exp(-((x+0.5)**2 + (y-0.2)**2) * 4.0) + 0.05 * np.random.normal(size=(rows, cols))
    coherence = np.clip(coherence, 0.05, 0.98)
    
    # Mask low coherence
    coh_threshold = config.thresholds.get("coherence_min", 0.3) if config.thresholds else 0.3
    masked_disp = mask_low_coherence(disp_cm, coherence, min_coherence=coh_threshold)
    
    # Wrapped fringes
    fringes = compute_fringes(disp_cm, L_BAND_WAVELENGTH)
    fringes[coherence < coh_threshold] = np.nan
    
    # Save PNG layers
    disp_img = render_displacement_png(masked_disp, vmin=-20.0, vmax=20.0)
    disp_img.save(output_dir / "displacement.png", format="PNG")
    
    fringe_img = render_fringes_png(fringes)
    fringe_img.save(output_dir / "fringes.png", format="PNG")
    
    # Coherence grayscale mask
    coh_rgba = np.zeros((rows, cols, 4), dtype=np.uint8)
    coh_uint = (coherence * 255).astype(np.uint8)
    coh_rgba[:, :, 0] = coh_uint
    coh_rgba[:, :, 1] = coh_uint
    coh_rgba[:, :, 2] = coh_uint
    coh_rgba[:, :, 3] = 220
    Image.fromarray(coh_rgba).save(output_dir / "coherence.png", format="PNG")
    
    # Precompute cross-fault transect data for the user's requested Transect A-B screen
    # Line from A (West fault) to B (East fault) across row=200
    transect_x = np.linspace(-2.0, 2.0, 50)
    transect_y = np.zeros_like(transect_x)
    transect_disp = 18.0 * np.tanh(transect_x * 2.5) * np.exp(-abs(transect_x)**1.5)
    transect_points = [
        {"distance_km": round(float(dist * 12.5), 2), "disp_cm": round(float(val), 2)}
        for dist, val in zip(transect_x + 2.0, transect_disp)
    ]
    with open(output_dir / "transect_profile.json", "w", encoding="utf-8") as f:
        json.dump(transect_points, f, indent=2)

    # Mock download file
    with open(output_dir / "displacement_gunw.tif", "w", encoding="utf-8") as f:
        f.write("GEOTIFF_PLACEHOLDER_GUNW_COSEISMIC_DISPLACEMENT_L_BAND")

    layers = [
        LayerManifest(
            id="displacement",
            label="Displacement",
            file="displacement.png",
            type="raster",
            bounds=config.aoi_bbox,
            colormap="Diverging (Red-Cream-Cyan)",
            legend_min=-20.0,
            legend_max=20.0,
            units="cm, line of sight",
            dates=["2026-06-12", "2026-06-24"]
        ),
        LayerManifest(
            id="fringes",
            label="Fringes",
            file="fringes.png",
            type="raster",
            bounds=config.aoi_bbox,
            colormap="Cyclical Rainbow (11.9 cm/cycle)",
            legend_min=0.0,
            legend_max=11.9,
            units="cm/fringe",
            dates=["2026-06-12", "2026-06-24"]
        ),
        LayerManifest(
            id="coherence",
            label="Coherence mask",
            file="coherence.png",
            type="raster",
            bounds=config.aoi_bbox,
            colormap="Grayscale",
            legend_min=0.0,
            legend_max=1.0,
            units="correlation",
            dates=["2026-06-24"]
        )
    ]

    manifest = PackManifest(
        id=config.id,
        title=config.title,
        type=config.type,
        hook=config.hook,
        event_date=config.event_date,
        aoi_bbox=config.aoi_bbox,
        layers=layers,
        granules=config.granules,
        story=config.story,
        references=config.references,
        parameters={
            "coherence_mask": ">= 0.3",
            "reference_area": "Stable window [-70.3, 9.6, -70.1, 9.8]",
            "carrier_frequency": "1.25 GHz (L-band)",
            "radar_wavelength": "0.2384 m",
            "fringe_cycle_displacement": "11.92 cm"
        },
        downloads={
            "geotiff": "displacement_gunw.tif",
            "manifest": "manifest.json"
        },
        citation="Contains modified NASA-ISRO NISAR Level 2 GUNW data (2026) distributed by ASF DAAC.",
        build_timestamp=datetime.utcnow().isoformat() + "Z"
    )
    
    with open(output_dir / "manifest.json", "w", encoding="utf-8") as f:
        f.write(manifest.model_dump_json(indent=2))
        
    return manifest

def build_floodplain_pack(config: PackConfig, output_dir: Path) -> PackManifest:
    """Builds precomputed static layers for the Floodplain Inundation Pack."""
    os.makedirs(output_dir, exist_ok=True)
    rows, cols = 400, 400
    y, x = np.mgrid[-2:2:400j, -2:2:400j]

    # Generate passes P1 to P8 with the famous instrument gap between P4 and P5
    passes = [
        {"id": "P1", "date": "2026-06-18", "stage": 0.15},
        {"id": "P2", "date": "2026-06-30", "stage": 0.30},
        {"id": "P3", "date": "2026-07-12", "stage": 0.55},
        {"id": "P4", "date": "2026-07-24", "stage": 0.80},
        # GAP: 2026-07-27 to 2026-08-10
        {"id": "P5", "date": "2026-08-17", "stage": 1.00}, # Peak flood
        {"id": "P6", "date": "2026-08-29", "stage": 0.85},
        {"id": "P7", "date": "2026-09-10", "stage": 0.50},
        {"id": "P8", "date": "2026-09-22", "stage": 0.25},
    ]

    for p in passes:
        stage = p["stage"]
        # Central main floodplain basin + secondary lake
        dist_basin1 = np.sqrt((x * 0.7)**2 + (y * 1.5)**2)
        dist_basin2 = np.sqrt(((x - 0.9) * 1.2)**2 + ((y + 0.5) * 1.8)**2)
        
        water_mask = (dist_basin1 < 0.6 * stage) | (dist_basin2 < 0.35 * stage)
        flooded_veg_mask = (dist_basin1 >= 0.6 * stage) & (dist_basin1 < 0.95 * stage)
        
        classes = np.zeros((rows, cols), dtype=np.uint8)
        classes[water_mask] = 1 # Candidate open water gain
        classes[flooded_veg_mask] = 2 # Candidate flooded vegetation gain
        
        img = render_inundation_png(classes)
        img.save(output_dir / f"inundation_{p['id']}.png", format="PNG")

    # Mock download file
    with open(output_dir / "flood_extent.tif", "w", encoding="utf-8") as f:
        f.write("GEOTIFF_PLACEHOLDER_GCOV_FLOODPLAIN_INUNDATION")

    layers = [
        LayerManifest(
            id="inundation",
            label="Candidate Inundation",
            file="inundation_P5.png",
            type="raster",
            bounds=config.aoi_bbox,
            colormap="Categorical (Teal: Open Water / Rust: Flooded Veg)",
            units="classification",
            dates=[p["date"] for p in passes]
        )
    ]

    manifest = PackManifest(
        id=config.id,
        title=config.title,
        type=config.type,
        hook=config.hook,
        event_date=config.event_date,
        aoi_bbox=config.aoi_bbox,
        layers=layers,
        granules=config.granules,
        story=config.story,
        references=config.references,
        parameters={
            "open_water_hv_threshold": "below -18 dB",
            "change_threshold": "below -3 dB",
            "flooded_veg_hh_delta": "above +3 dB",
            "speckle_filter": "3x3 median",
            "instrument_gap": "2026-07-27 to 2026-08-10 (No data, never interpolated)"
        },
        downloads={
            "geotiff": "flood_extent.tif",
            "manifest": "manifest.json"
        },
        citation="Contains modified NASA-ISRO NISAR Level 2 GCOV data (2026) distributed by ASF DAAC.",
        build_timestamp=datetime.utcnow().isoformat() + "Z"
    )

    with open(output_dir / "manifest.json", "w", encoding="utf-8") as f:
        f.write(manifest.model_dump_json(indent=2))

    return manifest

def build_crop_cycle_pack(config: PackConfig, output_dir: Path) -> PackManifest:
    """Builds precomputed static layers and binary data cube for the Crop Cycle Pack."""
    os.makedirs(output_dir, exist_ok=True)
    rows, cols = 100, 100
    num_passes = 9
    
    dates = [
        "2026-06-05", "2026-06-17", "2026-06-29", "2026-07-11", "2026-07-23",
        "2026-08-16", "2026-08-28", "2026-09-09", "2026-10-25"
    ]
    
    # 3D cube: (dates x rows x cols)
    cube = np.zeros((num_passes, rows, cols), dtype=np.float32)
    
    # Synthetic agricultural field signatures across the season
    # Field 1 (paddy rice): floods in June (-24 dB), grows dense in August/Sep (-12 dB), harvested in Oct (-22 dB)
    paddy_curve = [-24.1, -22.3, -18.5, -15.2, -12.3, -11.9, -13.8, -16.2, -21.8]
    # Field 2 (upland agroforest): steadily moderate backscatter (-15 to -14 dB)
    forest_curve = [-15.2, -15.0, -14.8, -14.5, -14.4, -14.6, -14.8, -15.0, -15.1]
    
    y, x = np.mgrid[0:1:100j, 0:1:100j]
    for d_idx in range(num_passes):
        # Mix spatial variations of fields
        layer = np.full((rows, cols), forest_curve[d_idx], dtype=np.float32)
        # Quadrant 1 & 3: Paddy fields
        paddy_mask = ((x < 0.5) & (y < 0.5)) | ((x > 0.6) & (y > 0.4))
        layer[paddy_mask] = paddy_curve[d_idx]
        # Add slight natural sensor texture
        layer += 0.5 * np.sin(x * 15.0) + 0.3 * np.random.normal(size=(rows, cols))
        cube[d_idx] = layer
        
        # Render display preview
        norm = np.clip((layer - (-30.0)) / (0.0 - (-30.0)), 0.0, 1.0)
        rgba = np.zeros((rows, cols, 4), dtype=np.uint8)
        gray = (norm * 255).astype(np.uint8)
        rgba[:, :, 0] = gray
        rgba[:, :, 1] = gray
        rgba[:, :, 2] = gray
        rgba[:, :, 3] = 220
        Image.fromarray(rgba).save(output_dir / f"backscatter_P{d_idx+1}.png", format="PNG")
        
    # Write quantized uint8 binary cube (dates x rows x cols, row-major)
    quantized_cube = quantize_db_to_uint8(cube)
    with open(output_dir / "cube.bin", "wb") as f:
        f.write(quantized_cube.tobytes())

    # Pre-canned point coordinates matching Page 4 of designs:
    points_meta = [
        {
            "id": "point-1",
            "name": "Point 1 · Paddy Field Basin",
            "lon": 88.542,
            "lat": 22.815,
            "signal": "HV backscatter (dB)",
            "values": paddy_curve,
            "summary": "Signal rises through vegetative growth in P3-P5, peaks before harvest at P5 (-12.3 dB), then falls back down sharply after harvest in P9."
        },
        {
            "id": "point-2",
            "name": "Point 2 · Agroforestry Canopy",
            "lon": 88.820,
            "lat": 22.950,
            "signal": "HV backscatter (dB)",
            "values": forest_curve,
            "summary": "Stable multi-canopy volume scattering with minimal seasonal fluctuation (-14.4 to -15.2 dB)."
        }
    ]
    with open(output_dir / "sample_points.json", "w", encoding="utf-8") as f:
        json.dump(points_meta, f, indent=2)

    layers = [
        LayerManifest(
            id="backscatter",
            label="HV backscatter (dB)",
            file="backscatter_P5.png",
            type="raster",
            bounds=config.aoi_bbox,
            colormap="Radar Grayscale (Power dB)",
            legend_min=-30.0,
            legend_max=0.0,
            units="dB, radar backscatter",
            dates=dates
        )
    ]

    manifest = PackManifest(
        id=config.id,
        title=config.title,
        type=config.type,
        hook=config.hook,
        event_date=config.event_date,
        aoi_bbox=config.aoi_bbox,
        layers=layers,
        granules=config.granules,
        story=config.story,
        references=config.references,
        parameters={
            "polarization": "HV (volume, vegetation) & HH",
            "db_quantization_range": "-30 to 0 dB in uint8",
            "grid_resolution": "100x100 (~100m spacing)",
            "warning": "This view mixes processing versions (P05023 and P05036). Differences between dates may partly reflect software changes, not the ground."
        },
        downloads={
            "cube": "cube.bin",
            "manifest": "manifest.json"
        },
        citation="Contains modified NASA-ISRO NISAR Level 2 GCOV data (2026) distributed by ASF DAAC.",
        build_timestamp=datetime.utcnow().isoformat() + "Z"
    )

    with open(output_dir / "manifest.json", "w", encoding="utf-8") as f:
        f.write(manifest.model_dump_json(indent=2))

    return manifest
