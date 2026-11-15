from __future__ import annotations
from typing import List, Optional, Literal, Dict, Any, Union
from datetime import date
from pydantic import BaseModel, Field, field_validator

MaturityLevel = Literal["BETA", "PROVISIONAL", "VALIDATED"]
PackType = Literal["deformation", "inundation", "timeseries"]
ProductType = Literal["GUNW", "GCOV", "GOFF"]

class GranuleConfig(BaseModel):
    product: ProductType
    id: str
    maturity: MaturityLevel
    crid: str
    acquisition_date: Optional[Union[str, date]] = None

    @field_validator("acquisition_date", mode="before")
    def format_date(cls, v):
        if isinstance(v, date):
            return v.isoformat()
        return v

class StoryConfig(BaseModel):
    what_changed: str
    drivers: str
    caveats: str
    radar_explainer: str

class PackConfig(BaseModel):
    id: str
    title: str
    type: PackType
    hook: str
    event_date: Optional[Union[str, date]] = None
    aoi_bbox: List[float] = Field(..., min_length=4, max_length=4, description="[West, South, East, North]")
    stable_reference_window: Optional[List[float]] = None
    thresholds: Optional[Dict[str, float]] = None
    granules: List[GranuleConfig]
    story: StoryConfig
    references: List[str] = Field(default_factory=list)

    @field_validator("event_date", mode="before")
    def format_event_date(cls, v):
        if isinstance(v, date):
            return v.isoformat()
        return v

class LayerManifest(BaseModel):
    id: str
    label: str
    file: str
    type: str
    bounds: List[float]
    colormap: Optional[str] = None
    legend_min: Optional[float] = None
    legend_max: Optional[float] = None
    units: Optional[str] = None
    dates: Optional[List[str]] = None

class PackManifest(BaseModel):
    id: str
    title: str
    type: PackType
    hook: str
    event_date: Optional[str] = None
    aoi_bbox: List[float]
    layers: List[LayerManifest]
    granules: List[GranuleConfig]
    story: StoryConfig
    references: List[str]
    parameters: Dict[str, Any] = Field(default_factory=dict)
    downloads: Dict[str, str] = Field(default_factory=dict)
    citation: str
    build_timestamp: str
    pipeline_version: str = "0.1.0"
