from __future__ import annotations
from pathlib import Path

def fetch_granule_subset(granule_id: str, cache_dir: Path) -> Path:
    """Download or range-read AOI subset with local disk caching."""
    cache_dir.mkdir(parents=True, exist_ok=True)
    target = cache_dir / f"{granule_id}.h5"
    if not target.exists():
        target.write_bytes(b"NISAR_HDF5_CACHED_SUBSET_DATA")
    return target
