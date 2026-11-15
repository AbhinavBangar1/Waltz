from __future__ import annotations
from typing import List, Dict, Any

def search_asf_granules(
    bbox: List[float],
    start_date: str,
    end_date: str,
    product_type: str = "GUNW"
) -> List[Dict[str, Any]]:
    """Query ASF API for candidate NISAR granules matching spatial bounding box and date range."""
    # Stub representing the discover stage of TRD section 5.1
    return [
        {
            "granule_id": f"NISAR_L2_PR_{product_type}_001_004_A_084_{start_date.replace('-','')}T104522_P05023",
            "product": product_type,
            "maturity": "PROVISIONAL",
            "crid": "P05023",
            "bbox": bbox,
            "date": start_date
        }
    ]
