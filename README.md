# Waltz: A NISAR Surface-Change Explorer

[![NASA Space Apps Challenge 2026](https://img.shields.io/badge/NASA%20Space%20Apps%202026-Dancing%20with%20the%20SARs-orange.svg)](https://www.spaceappschallenge.org)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff.svg)](https://vitejs.dev/)
[![Leaflet & OpenStreetMap](https://img.shields.io/badge/Basemap-OpenStreetMap-brightgreen.svg)](https://www.openstreetmap.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **2026 NASA Space Apps Challenge Submission**  
> **Challenge:** Dancing with the SARs  
> **Topic:** Democratizing NASA-ISRO Synthetic Aperture Radar (NISAR) Level 2 Products for All

---

## 🌍 Executive Summary

Synthetic Aperture Radar (SAR) is one of NASA and ISRO's most powerful Earth observation technologies. Operating at L-band microwave frequencies (1.25 GHz, wavelength $\lambda = 23.84\text{ cm}$), NISAR transmits its own energy pulses to penetrate straight through clouds, rain, dense smoke, and darkness, imaging Earth's surface with 12-day systematic repeat cycles.

However, raw scientific NISAR data is locked inside massive **2 to 8 GB HDF5 files** containing complex polarimetric covariance matrices (GCOV) and unwrapped interferograms (GUNW). To local emergency managers, environmental journalists, educators, and community planners, these files represent an insurmountable technical barrier requiring specialized GIS workstations and high-performance computing clusters.

**Waltz** bridges this gap. It is an open-source, zero-server-cost web application backed by an automated Python data pipeline that translates Level 2 NISAR radar products into lightweight, interactive, human-understandable stories over real **OpenStreetMap** basemaps. Without installing specialized software, users can inspect centimeter-scale earthquake fault slips, track floodwaters spreading beneath dense forest canopies, and chart agricultural crop growth cycles with sub-5 millisecond response times.

---

## 🏛️ System Architecture

Waltz decouples heavy scientific data processing from client-side exploration using a precomputed static pack architecture:

```mermaid
flowchart TD
    subgraph DataSources["1. Satellite & Data Sources"]
        NISAR["NASA-ISRO NISAR Satellite\n(L-band 1.25 GHz, λ = 23.84 cm)"]
        ASF["Alaska Satellite Facility (ASF) DAAC\nLevel 2 HDF5 Products (GUNW & GCOV)"]
        NISAR -->|Downlink & L2 Processing| ASF
    end

    subgraph Pipeline["2. Python Data Pipeline (waltz-pipeline CLI)"]
        CLI["Typer CLI: waltz build / build-all"]
        GUNW_PROC["InSAR Phase Unwrapping\nΔd = -(λ / 4π) · φ\nFringe Modulo (11.92 cm/cycle)"]
        GCOV_PROC["Radiometric Calibration\nσ°(dB) = 10 · log10(power)\n3x3 Median Spatial Despeckling"]
        CUBE_PROC["Multi-Temporal Quantization\nuint8 Linear Compression → cube.bin"]
        
        ASF --> CLI
        CLI --> GUNW_PROC
        CLI --> GCOV_PROC
        CLI --> CUBE_PROC
    end

    subgraph StaticPacks["3. Precomputed Static Packs (web/public/packs/)"]
        PACK_A["Pack A: Venezuela Quake\ndisplacement.png · fringes.png\ntransect_profile.json · GeoTIFF"]
        PACK_B["Pack B: Pantanal Flood\ninundation_P1..P8.png\nflood_extent.tif · Data Gap Mask"]
        PACK_C["Pack C: Bengal Delta Crops\nbackscatter_P1..P9.png\ncube.bin (Quantized Cube)"]
        MANIFEST["manifest.json\n(Granule IDs, CRID, BBox, Provenance)"]
        
        GUNW_PROC --> PACK_A
        GCOV_PROC --> PACK_B
        CUBE_PROC --> PACK_C
        CLI --> MANIFEST
    end

    subgraph WebClient["4. Interactive Web Client (React 18 + Leaflet)"]
        OSM["Real OpenStreetMap Basemap\n(Zero API Key, Pan & Zoom)"]
        TRANSECT["Line A-to-B Transect Tool\n(Dynamic Cross-Section Fault Profile)"]
        INUNDATION_VIEW["Flood Extent & Polarization\n(Hatched Instrument Data Gap)"]
        PHENOLOGY["Click-to-Chart Agriculture\n(Sub-5ms Binary Data Cube Query)"]
        PROVENANCE["Methods & Provenance Modal\n(Where Every Pixel Comes From)"]
        
        PACK_A & PACK_B & PACK_C & MANIFEST --> WebClient
        WebClient --> OSM
        WebClient --> TRANSECT
        WebClient --> INUNDATION_VIEW
        WebClient --> PHENOLOGY
        WebClient --> PROVENANCE
    end
```

---

## 🔬 Scientific Radar Physics: How It Works

### 1. InSAR Ground Deformation Mechanics ($\text{GUNW}$)
When an earthquake shifts Earth's crust, the distance between the ground and the satellite changes between orbital passes. NISAR's Level 2 Geocoded Unwrapped Interferogram ($\text{GUNW}$) records this phase shift ($\phi$). Waltz converts this phase into physical line-of-sight ground displacement:

$$\Delta d_{\text{LOS}} = -\frac{\lambda}{4\pi}\phi$$

- **Wavelength:** NISAR operates at L-band with $\lambda = 23.84\text{ cm}$.
- **Fringe Resolution:** One wrapped interferometric fringe (a complete $2\pi$ color cycle) corresponds to exactly half a wavelength:
  $$\text{Fringe Cycle} = \frac{\lambda}{2} = 11.92\text{ cm}$$
- **Interactive Transect Tool:** Users draw or click any cross-section line from **Point A to Point B** across the active fault to plot a centimeter-scale displacement profile showing coseismic offset (e.g., $+18.2\text{ cm}$ uplift vs. $-14.6\text{ cm}$ subsidence along the Boconó Fault).

### 2. Wetland Inundation & Double-Bounce Scattering ($\text{GCOV}$)
Optical satellites cannot see floodwaters beneath dense tropical forests. L-band microwaves easily penetrate leafy canopies to interact with the ground below:
- **Calm Open Water:** Smooth water acts like a specular mirror, bouncing microwave pulses away from the radar antenna. This produces very low cross-polarized radar echo ($HV < -18\text{ dB}$, appearing dark).
- **Flooded Forest:** Standing water beneath tree trunks forms a natural 90° dihedral corner reflector. The radar pulse bounces off the water onto the trunk (or vice-versa) and directly back to the satellite, producing an intense surge in co-polarized echo ($HH > -5\text{ dB}$, appearing bright).
- **Data Honesty:** Waltz explicitly highlights the permanent **NISAR Instrument Data Gap (July 27 – August 10, 2026)** with a distinct hatched column in its temporal timeline. Rather than smoothing over or guessing missing passes, Waltz maintains complete scientific truth.

### 3. Agricultural Crop Phenology Data Cube
Monitoring smallholder crops across dynamic seasons requires high temporal fidelity:
- **Sub-5ms Query Latency:** Multi-temporal backscatter stacks are linearly quantized into 8-bit unsigned integers (`uint8`) and packaged into a binary data cube (`cube.bin`).
- **Click-to-Chart:** Clicking any field parcel queries the in-memory array directly, rendering 9-pass growth trajectories from paddy flooding ($-24\text{ dB}$) through vegetative elongation (peaking at $-12.3\text{ dB}$) to post-harvest drop-off.

---

## 🌐 Global Pipeline vs. Demonstration Packs

### Is this a toy or does the pipeline work globally?

**The Python data pipeline is a full, generic, extensible processing engine.** It is **not** hardcoded to the three demonstration areas:

1. **Generic Configuration Schema:** Every pack is defined by an open YAML configuration schema (`pack.yaml`) specifying geographic bounding box coordinates, orbit pass metadata, polarization channels, and detection thresholds.
2. **Global Extensibility:** Any researcher, educator, or civic team can author a new pack anywhere in the world by writing a `pack.yaml` and running:
   ```bash
   waltz build --config my-region/pack.yaml --output-dir web/public/packs
   ```
3. **Deterministic Algorithms:** All mathematical conversions—including HDF5 dataset extraction, phase-to-displacement calculation, 3x3 median spatial despeckling, radiometric decibel calibration, and binary quantization—are implemented as reusable, tested library modules in `pipeline/src/waltz_pipeline/`.
4. **Why 3 Precomputed Packs for the Hackathon?**  
   Raw NISAR HDF5 granules are 2 to 8 GB each. A live multi-pass time-series requires over 50 GB of raw radar files and requires NASA Earthdata authenticated credentials. For the hackathon, we used the pipeline to precompute three geographically distinct, scientifically calibrated reference packs (South America, Pantanal, South Asia). This enables zero-server hosting on GitHub Pages / Vercel with instant sub-second browser rendering during judging.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ (tested on Node 20 & 24)
- Python 3.11+ with `uv` or `pip`

### 1. Run the Web Application

```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Build and Test the Python Pipeline

```bash
# Install pipeline in editable mode with development dependencies
uv pip install -e pipeline

# Run the full unit test suite (phase math, dB conversion, quantization, configs)
pytest pipeline/tests/

# Validate any pack configuration
waltz validate packs-src/venezuela-quake-2026/pack.yaml

# Build all static packs from source
waltz build-all --output-dir web/public/packs
```

---

## 📁 Repository Structure

```
Waltz/
├── packs-src/                    # Pack source specifications (human-authored YAML)
│   ├── venezuela-quake-2026/     # Pack A: Coseismic fault displacement
│   │   └── pack.yaml
│   ├── floodplain-wet-season/    # Pack B: Wetland inundation & data gap
│   │   └── pack.yaml
│   └── crop-cycle-radar/         # Pack C: 9-pass agricultural phenology
│       └── pack.yaml
├── pipeline/                     # Python CLI & processing package
│   ├── pyproject.toml            # Package configuration (Typer, Pydantic, NumPy, Rasterio)
│   ├── src/waltz_pipeline/       # Modular processing library
│   │   ├── cli.py                # CLI commands (build, build-all, validate, inspect)
│   │   ├── config.py             # Pydantic v2 validation models
│   │   ├── package.py            # Manifest generation & asset packaging
│   │   ├── process/              # Change detection, despeckle, & time-series
│   │   ├── products/             # GUNW & GCOV product parsers
│   │   └── render/               # Web Mercator rasterizer & binary cube writer
│   └── tests/                    # Automated regression & mathematical unit tests
└── web/                          # React 18 + Vite frontend client
    ├── public/packs/             # Precomputed static packs served directly to browser
    ├── src/
    │   ├── components/           # UI components matching PRD/TRD specs
    │   │   ├── OSMMap.tsx        # Real Leaflet OpenStreetMap integration
    │   │   ├── DeformationView.tsx # Pack A view with Line A-B transect
    │   │   ├── InundationView.tsx  # Pack B view with instrument gap timeline
    │   │   ├── TimeSeriesView.tsx  # Pack C view with sub-5ms click-to-chart
    │   │   ├── MethodsModal.tsx    # "Where every pixel comes from" modal
    │   │   └── SystemStatesModal.tsx # Error boundary, offline, & fallback states
    │   ├── types/                # TypeScript interface definitions
    │   └── App.tsx               # Client router & state synchronization
```

---

## 📜 Citations, Data Sources & Disclaimers

- **NASA Space Apps Challenge:** Developed for the 2026 NASA Space Apps Challenge under the *"Dancing with the SARs"* challenge category.
- **Data Source:** Based on Level 2 science data specifications for the **NASA-ISRO Synthetic Aperture Radar (NISAR)** mission, distributed by the **Alaska Satellite Facility (ASF) DAAC**.
- **Basemap Attribution:** Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, rendered via Leaflet.
- **Educational Disclaimer:** Waltz is designed for educational exploration, civic awareness, and scientific communication. It is not an official hazard warning or emergency response product.
- **License:** Open source under the [MIT License](LICENSE).
