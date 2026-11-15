export type PackType = 'deformation' | 'inundation' | 'timeseries';
export type MaturityLevel = 'BETA' | 'PROVISIONAL' | 'VALIDATED';

export interface Granule {
  product: 'GUNW' | 'GCOV' | 'GOFF';
  id: string;
  maturity: MaturityLevel;
  crid: string;
  acquisition_date?: string;
}

export interface Story {
  what_changed: string;
  drivers: string;
  caveats: string;
  radar_explainer: string;
}

export interface Layer {
  id: string;
  label: string;
  file: string;
  type: string;
  bounds: [number, number, number, number];
  colormap?: string;
  legend_min?: number;
  legend_max?: number;
  units?: string;
  dates?: string[];
}

export interface PackManifest {
  id: string;
  title: string;
  type: PackType;
  hook: string;
  event_date?: string;
  aoi_bbox: [number, number, number, number];
  layers: Layer[];
  granules: Granule[];
  story: Story;
  references: string[];
  parameters: Record<string, any>;
  downloads: Record<string, string>;
  citation: string;
  build_timestamp: string;
  pipeline_version: string;
}

export interface TransectPoint {
  distance_km: number;
  disp_cm: number;
}

export interface TimeSeriesPoint {
  id: string;
  name: string;
  lon: number;
  lat: number;
  signal: string;
  values: number[];
  summary: string;
}
