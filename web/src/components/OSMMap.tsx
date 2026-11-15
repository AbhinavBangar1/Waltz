import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

export interface MapPoint {
  lat: number;
  lng: number;
  label: string;
  color: string;
}

interface OSMMapProps {
  bounds: [number, number, number, number]; // [West, South, East, North]
  overlayUrl?: string;
  overlayOpacity?: number;
  mode: 'earthquake' | 'floodplain' | 'crop';
  // Earthquake Line A to B
  linePoints?: { a: [number, number]; b: [number, number] };
  onLineChange?: (line: { a: [number, number]; b: [number, number] }) => void;
  isDrawingLine?: boolean;
  onFinishDrawing?: () => void;
  // Crop points
  cropPoints?: MapPoint[];
  onMapClick?: (lat: number, lng: number) => void;
  // Basemap style toggle
  basemapType?: 'osm_light' | 'satellite';
}

export const OSMMap: React.FC<OSMMapProps> = ({
  bounds,
  overlayUrl,
  overlayOpacity = 0.85,
  mode,
  linePoints,
  onLineChange,
  isDrawingLine = false,
  onFinishDrawing,
  cropPoints,
  onMapClick,
  basemapType = 'osm_light',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const overlayLayerRef = useRef<L.ImageOverlay | null>(null);
  const lineLayerRef = useRef<L.LayerGroup | null>(null);
  const pointsLayerRef = useRef<L.LayerGroup | null>(null);

  const [drawState, setDrawState] = useState<'idle' | 'awaiting_b'>('idle');
  const [currentBasemap, setCurrentBasemap] = useState<'osm' | 'satellite'>('osm');
  const tempARef = useRef<[number, number] | null>(null);

  // Convert [West, South, East, North] to Leaflet LatLngBounds
  const leafletBounds = L.latLngBounds(
    [bounds[1], bounds[0]], // South-West
    [bounds[3], bounds[2]]  // North-East
  );

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: leafletBounds.getCenter(),
        zoom: 9,
        zoomControl: false,
        attributionControl: false,
      });

      // Add Zoom Control to bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
      lineLayerRef.current = L.layerGroup().addTo(map);
      pointsLayerRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    map.fitBounds(leafletBounds, { padding: [20, 20] });

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Basemap Tiles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    // 100% Free public tile providers requiring NO API key:
    // Standard OpenStreetMap (OSM) or Esri World Imagery (Satellite)
    const tileUrl =
      currentBasemap === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

    const newTileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [currentBasemap]);

  // Update Radar Overlay Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (overlayLayerRef.current) {
      map.removeLayer(overlayLayerRef.current);
      overlayLayerRef.current = null;
    }

    if (overlayUrl) {
      const overlay = L.imageOverlay(overlayUrl, leafletBounds, {
        opacity: overlayOpacity,
        interactive: false,
      }).addTo(map);
      overlayLayerRef.current = overlay;
    }
  }, [overlayUrl, overlayOpacity, bounds[0], bounds[1], bounds[2], bounds[3]]);

  // Handle Earthquake Line A to B Rendering
  useEffect(() => {
    const lineGroup = lineLayerRef.current;
    if (!lineGroup || mode !== 'earthquake' || !linePoints) return;

    lineGroup.clearLayers();

    const { a, b } = linePoints;
    const latlngs: L.LatLngExpression[] = [a, b];

    // Polyline
    L.polyline(latlngs, {
      color: '#1c1917',
      weight: 2.5,
      opacity: 0.9,
    }).addTo(lineGroup);

    // Custom A Marker Icon
    const iconA = L.divIcon({
      className: 'custom-map-marker',
      html: `<div style="background-color: white; color: #1c1917; border: 2px solid #1c1917; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; font-family: monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.25);">A</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // Custom B Marker Icon
    const iconB = L.divIcon({
      className: 'custom-map-marker',
      html: `<div style="background-color: white; color: #1c1917; border: 2px solid #1c1917; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; font-family: monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.25);">B</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const markerA = L.marker(a, { icon: iconA, draggable: true }).addTo(lineGroup);
    const markerB = L.marker(b, { icon: iconB, draggable: true }).addTo(lineGroup);

    markerA.on('dragend', () => {
      const pos = markerA.getLatLng();
      if (onLineChange) onLineChange({ a: [pos.lat, pos.lng], b: linePoints.b });
    });

    markerB.on('dragend', () => {
      const pos = markerB.getLatLng();
      if (onLineChange) onLineChange({ a: linePoints.a, b: [pos.lat, pos.lng] });
    });
  }, [linePoints, mode, onLineChange]);

  // Handle Crop Cycle Points & Crosshairs
  useEffect(() => {
    const pointsGroup = pointsLayerRef.current;
    if (!pointsGroup || mode !== 'crop' || !cropPoints) return;

    pointsGroup.clearLayers();

    cropPoints.forEach((pt) => {
      // Circle marker matching Screenshot 1
      const isPoint1 = pt.color === '#b4432c' || pt.label.includes('Point 1');
      const borderColor = isPoint1 ? '#b4432c' : '#155e75';

      const customIcon = L.divIcon({
        className: 'crop-crosshair-icon',
        html: `
          <div style="position: relative; width: 32px; height: 32px; pointer-events: none;">
            <!-- Crosshairs -->
            <div style="position: absolute; left: -100px; top: 15px; width: 232px; height: 1px; background-color: ${borderColor}; opacity: 0.5;"></div>
            <div style="position: absolute; left: 15px; top: -100px; width: 1px; height: 232px; background-color: ${borderColor}; opacity: 0.5;"></div>
            <!-- Circle Ring -->
            <div style="position: absolute; left: 6px; top: 6px; width: 20px; height: 20px; border-radius: 50%; border: 2.5px solid ${borderColor}; background-color: rgba(255,255,255,0.85); box-shadow: 0 2px 5px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;">
              <div style="width: 5px; height: 5px; border-radius: 50%; background-color: ${borderColor};"></div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([pt.lat, pt.lng], { icon: customIcon, interactive: false }).addTo(pointsGroup);
    });
  }, [cropPoints, mode]);

  // Handle Click Events (for Drawing Line or Placing Crop Points)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClickInternal = (e: L.LeafletMouseEvent) => {
      if (isDrawingLine && mode === 'earthquake') {
        if (drawState === 'idle') {
          tempARef.current = [e.latlng.lat, e.latlng.lng];
          setDrawState('awaiting_b');
        } else if (drawState === 'awaiting_b' && tempARef.current) {
          const a = tempARef.current;
          const b: [number, number] = [e.latlng.lat, e.latlng.lng];
          if (onLineChange) onLineChange({ a, b });
          setDrawState('idle');
          tempARef.current = null;
          if (onFinishDrawing) onFinishDrawing();
        }
      } else if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    };

    map.on('click', handleMapClickInternal);
    return () => {
      map.off('click', handleMapClickInternal);
    };
  }, [isDrawingLine, drawState, mode, onLineChange, onFinishDrawing, onMapClick]);

  const handleResetZoom = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(leafletBounds, { padding: [25, 25], animate: true });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-stone-100 dark:bg-stone-900 rounded-xl overflow-hidden">
      {/* Real Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left: Draw Line Tool (Earthquake mode, matches Image 2) */}
      {mode === 'earthquake' && (
        <button
          onClick={() => {
            if (isDrawingLine && onFinishDrawing) {
              onFinishDrawing();
              setDrawState('idle');
            } else if (onFinishDrawing) {
              onFinishDrawing();
            }
          }}
          className={`absolute top-4 left-4 z-20 px-3 py-1.5 rounded-lg border text-xs font-mono tracking-wider shadow-sm transition-all ${
            isDrawingLine
              ? 'bg-waltz-rust text-white border-waltz-rust animate-pulse'
              : 'bg-white/95 dark:bg-stone-900/95 border-paper-border dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-paper-200'
          }`}
        >
          {isDrawingLine
            ? drawState === 'awaiting_b'
              ? 'Click Point B on map...'
              : 'Click Point A on map...'
            : 'Draw line'}
        </button>
      )}

      {/* Top Right: Basemap Layer Toggle & Reset Zoom */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
        <button
          onClick={() => {
            const nextType = currentBasemap === 'osm' ? 'satellite' : 'osm';
            setCurrentBasemap(nextType);
          }}
          className="px-2.5 py-1.5 rounded-lg border border-paper-border dark:border-stone-700 bg-white/95 dark:bg-stone-900/95 text-stone-800 dark:text-stone-200 text-xs font-mono tracking-wider shadow-sm hover:bg-paper-200 dark:hover:bg-stone-800 transition-colors"
        >
          {currentBasemap === 'osm' ? 'Satellite' : 'Street (OSM)'}
        </button>

        <button
          onClick={handleResetZoom}
          className="px-3 py-1.5 rounded-lg border border-paper-border dark:border-stone-700 bg-white/95 dark:bg-stone-900/95 text-stone-800 dark:text-stone-200 text-xs font-mono tracking-wider shadow-sm hover:bg-paper-200 dark:hover:bg-stone-800 transition-colors"
        >
          Reset zoom
        </button>
      </div>

      {/* Bottom Left: Real OpenStreetMap Attribution */}
      <div className="absolute bottom-3 left-4 z-20 text-[10px] font-mono text-stone-500 bg-white/90 dark:bg-stone-900/90 px-2.5 py-1 rounded border border-stone-200 dark:border-stone-800 shadow-sm pointer-events-auto">
        Basemap © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-stone-900">OpenStreetMap</a> contributors · NASA-ISRO NISAR
      </div>
    </div>
  );
};
