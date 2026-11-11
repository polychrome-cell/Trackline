import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { Station, Corridor, BuiltRoute, RegionId, ThemeMode, AccentColor, TrackType } from '../types';
import { interpolatePolyline, calculateBearing } from '../utils/geo';
import { ACCENT_PALETTES } from '../utils/theme';
import { calculateCorridorDensity, getDensityHeatColor } from '../game/routeAnalysis';
import { AnimatedTrainMarker } from './AnimatedTrainMarker';

interface NetworkMapProps {
  stations: Station[];
  corridors: Corridor[];
  builtRoutes: BuiltRoute[];
  selectedStationId: string | null;
  onSelectStation: (stationId: string) => void;
  selectedRegion: RegionId;
  simTime: number; // For animating train markers
  themeMode?: ThemeMode;
  accentColor?: AccentColor;
  showReferenceCorridors?: boolean;
  showDensityOverlay?: boolean;
  onToggleDensityOverlay?: (enabled: boolean) => void;
  onSelectRoute?: (routeId: string) => void;
}

// Tactical Dark Operation-Center Styling for Google Maps
const DARK_TACTICAL_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0d1318' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#090d10' }, { weight: 2 }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#687e8f' }] },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#273847' }, { weight: 1.2 }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#182430' }, { weight: 0.8 }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#889eb0' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#111820' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#10171e' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#070b0e' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#394d5e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#17222c' }, { lightness: -20 }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1d2c38' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1e2c38' }],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [{ color: '#203342' }],
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
];

// Clean Daytime Dispatcher Cartographic Styling for Light Mode
const LIGHT_DISPATCHER_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#eef2f6' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }, { weight: 2.5 }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#94a3b8' }, { weight: 1.2 }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#cbd5e1' }, { weight: 0.8 }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#f8fafc' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#93c5fd' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#e2e8f0' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [{ color: '#94a3b8' }],
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
];

// Region Camera Presets
const REGION_BOUNDS: Record<RegionId, { center: google.maps.LatLngLiteral; zoom: number }> = {
  all: { center: { lat: 26.5, lng: 98.0 }, zoom: 4 },
  south_asia: { center: { lat: 22.0, lng: 79.5 }, zoom: 5 },
  china: { center: { lat: 31.5, lng: 112.0 }, zoom: 5 },
  east_asia: { center: { lat: 35.5, lng: 132.5 }, zoom: 5 },
  southeast_asia: { center: { lat: 6.0, lng: 106.0 }, zoom: 5 },
  world: { center: { lat: 32.0, lng: 25.0 }, zoom: 3 },
};

// Map Controller for smooth panning and zooming on region / station changes
function MapCameraController({
  selectedRegion,
}: {
  selectedRegion: RegionId;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const target = REGION_BOUNDS[selectedRegion] || REGION_BOUNDS.all;
    map.panTo(target.center);
    map.setZoom(target.zoom);
  }, [map, selectedRegion]);

  return null;
}

// Map Zoom Listener to control level-of-detail for station labels
function MapZoomListener({ onZoomChanged }: { onZoomChanged: (zoom: number) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const updateZoom = () => {
      const z = map.getZoom();
      if (typeof z === 'number') {
        onZoomChanged(z);
      }
    };

    updateZoom();
    const listener = map.addListener('zoom_changed', updateZoom);
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, onZoomChanged]);

  return null;
}

// Declarative Polyline Renderer for Corridors and Built Railway Routes
function CustomPolyline({
  path,
  strokeColor,
  strokeOpacity,
  strokeWeight,
  zIndex = 1,
}: {
  path: google.maps.LatLngLiteral[];
  strokeColor: string;
  strokeOpacity: number;
  strokeWeight: number;
  zIndex?: number;
}) {
  const map = useMap();
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;
    const poly = new google.maps.Polyline({
      path,
      strokeColor,
      strokeOpacity,
      strokeWeight,
      zIndex,
      geodesic: true,
      map,
    });
    setPolyline(poly);

    return () => {
      poly.setMap(null);
    };
  }, [map]);

  useEffect(() => {
    if (!polyline) return;
    polyline.setOptions({
      path,
      strokeColor,
      strokeOpacity,
      strokeWeight,
      zIndex,
      geodesic: true,
    });
  }, [polyline, path, strokeColor, strokeOpacity, strokeWeight, zIndex]);

  return null;
}

export const NetworkMap: React.FC<NetworkMapProps> = ({
  stations,
  corridors,
  builtRoutes,
  selectedStationId,
  onSelectStation,
  selectedRegion,
  simTime,
  themeMode = 'dark',
  accentColor = 'lime',
  showReferenceCorridors = true,
  showDensityOverlay,
  onToggleDensityOverlay,
  onSelectRoute,
}) => {
  const isWorld = selectedRegion === 'world';
  const isDark = themeMode === 'dark';
  const accent = ACCENT_PALETTES[accentColor] || ACCENT_PALETTES.lime;

  // Network Density state handling (supports controlled and uncontrolled modes)
  const [internalDensityOverlay, setInternalDensityOverlay] = useState<boolean>(false);
  const isDensityActive = showDensityOverlay !== undefined ? showDensityOverlay : internalDensityOverlay;

  const handleToggleDensity = () => {
    const next = !isDensityActive;
    setInternalDensityOverlay(next);
    onToggleDensityOverlay?.(next);
  };

  // Track map zoom for adaptive level-of-detail (hiding text at low zoom, revealing at zoom >= 6)
  const [currentZoom, setCurrentZoom] = useState<number>(4);
  const [hoveredStationId, setHoveredStationId] = useState<string | null>(null);

  const handleZoomChanged = useCallback((z: number) => {
    setCurrentZoom(z);
  }, []);

  // Station dictionary for fast coordinate lookup
  const stationLookup = useMemo(() => {
    const dict: Record<string, Station> = {};
    stations.forEach((s) => {
      dict[s.id] = s;
    });
    return dict;
  }, [stations]);

  // Corridor dictionary
  const corridorLookup = useMemo(() => {
    const dict: Record<string, Corridor> = {};
    corridors.forEach((c) => {
      dict[c.id] = c;
    });
    return dict;
  }, [corridors]);

  // Active Corridor IDs
  const activeRouteCorridorIds = useMemo(() => {
    const ids: Record<string, boolean> = {};
    builtRoutes.forEach((r) => {
      ids[r.corridorId] = true;
    });
    return ids;
  }, [builtRoutes]);

  // Visible stations based on world toggle
  const visibleStations = useMemo(() => {
    return stations.filter((s) => isWorld || s.regionId !== 'world');
  }, [stations, isWorld]);

  // Calculate moving train positions along real multi-point curved route lines
  const animatedTrains = useMemo(() => {
    return builtRoutes.map((route, idx) => {
      const stA = stationLookup[route.stationAId];
      const stB = stationLookup[route.stationBId];
      if (!stA || !stB) return null;

      const corridor = corridorLookup[route.corridorId];
      const fullPath: google.maps.LatLngLiteral[] = [
        { lat: stA.lat, lng: stA.lng },
        ...(corridor?.waypoints || []),
        { lat: stB.lat, lng: stB.lng },
      ];

      // Progress along route (0.001 to 0.999) based on simTime and route speed
      const speedMultiplier = route.trackType === 'high_speed' ? 0.08 : route.trackType === 'express' ? 0.06 : 0.04;
      const rawProgress = (simTime * speedMultiplier + idx * 0.37) % 1;
      const progress = Math.max(0.001, Math.min(0.999, rawProgress));
      const pos = interpolatePolyline(fullPath, progress);

      // Sample a small segment forward along the real track polyline to compute train heading angle
      const forwardProgress = Math.min(1.0, progress + 0.015);
      const nextPos = interpolatePolyline(fullPath, forwardProgress);
      const bearing = calculateBearing(pos, nextPos);

      const trackColor =
        route.trackType === 'high_speed'
          ? accent.hex
          : route.trackType === 'express'
          ? '#38bdf8'
          : '#a3e635';

      return {
        id: `train-${route.id}`,
        name: route.name,
        trainName: route.trackName || route.name,
        trackType: route.trackType,
        position: pos,
        color: trackColor,
        bearing,
        progressPercent: progress * 100,
        speedKmH: route.trackType === 'high_speed' ? 320 : route.trackType === 'express' ? 180 : 120,
      };
    }).filter(Boolean) as {
      id: string;
      name: string;
      trainName: string;
      trackType: TrackType;
      position: google.maps.LatLngLiteral;
      color: string;
      bearing: number;
      progressPercent: number;
      speedKmH: number;
    }[];
  }, [builtRoutes, stationLookup, corridorLookup, simTime, accent.hex]);

  return (
    <div className={`relative w-full h-full flex flex-col ${isDark ? 'bg-[#0b1014]' : 'bg-[#e2e8f0]'} select-none overflow-hidden`}>
      {/* Tactical Grid & Scanline Overlays on top of the Map */}
      <div className={`absolute inset-0 tactical-grid ${isDark ? 'opacity-25' : 'opacity-10'} pointer-events-none z-10`} />
      <div className={`absolute inset-0 scanlines ${isDark ? 'opacity-20' : 'opacity-5'} pointer-events-none z-10`} />

      {/* Network Density Heatmap Overlay Toggle (Top-Left) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={handleToggleDensity}
          data-tutorial="density-overlay-toggle"
          className={`px-3 py-1.5 rounded text-xs font-mono font-bold border transition-all cursor-pointer flex items-center gap-2 shadow-lg backdrop-blur-md ${
            isDensityActive
              ? 'bg-amber-500/20 text-amber-300 border-amber-400 ring-1 ring-amber-400/50'
              : isDark
              ? 'bg-[#0e141a]/90 text-slate-300 border-[#1e2a34] hover:border-slate-500'
              : 'bg-white/95 text-slate-700 border-slate-300 hover:border-slate-400'
          }`}
          title="Visualize passenger traffic intensity across network corridors using color-coded heat intensity"
        >
          <span className={isDensityActive ? 'animate-pulse' : ''}>🔥</span>
          <span>NETWORK DENSITY</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
              isDensityActive
                ? 'bg-amber-400 text-black font-extrabold'
                : isDark
                ? 'bg-slate-800 text-slate-400'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {isDensityActive ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Google Map Container */}
      <div className="w-full h-full relative">
        <Map
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          defaultCenter={REGION_BOUNDS.all.center}
          defaultZoom={REGION_BOUNDS.all.zoom}
          minZoom={3}
          maxZoom={12}
          disableDefaultUI={true}
          zoomControl={true}
          gestureHandling="greedy"
          className="w-full h-full"
        >
          {/* Smooth Camera Controller */}
          <MapCameraController selectedRegion={selectedRegion} />

          {/* Level-of-Detail Zoom Listener */}
          <MapZoomListener onZoomChanged={handleZoomChanged} />

          {/* 1. Railway Corridors (Real Curved Geographic Polylines with Density Heat Overlay) */}
          {showReferenceCorridors &&
            corridors.map((c) => {
              const posA = stationLookup[c.stationAId];
              const posB = stationLookup[c.stationBId];
              if (!posA || !posB) return null;
              if (!isWorld && (posA.regionId === 'world' || posB.regionId === 'world')) return null;

              const isRouteActive = Boolean(activeRouteCorridorIds[c.id]);
              // Real geographic path following railway waypoints
              const path: google.maps.LatLngLiteral[] = [
                { lat: posA.lat, lng: posA.lng },
                ...(c.waypoints || []),
                { lat: posB.lat, lng: posB.lng },
              ];

              if (isDensityActive) {
                const density = calculateCorridorDensity(c.id, builtRoutes, c.baseDailyDemand);
                const heat = getDensityHeatColor(density.totalDailyPassengers, isDark);
                return (
                  <React.Fragment key={`density-corridor-${c.id}`}>
                    <CustomPolyline
                      key={`density-glow-${c.id}`}
                      path={path}
                      strokeColor={heat.color}
                      strokeOpacity={0.35}
                      strokeWeight={heat.strokeWidth + 5}
                      zIndex={2}
                    />
                    <CustomPolyline
                      key={`density-line-${c.id}`}
                      path={path}
                      strokeColor={heat.color}
                      strokeOpacity={0.92}
                      strokeWeight={heat.strokeWidth}
                      zIndex={3}
                    />
                  </React.Fragment>
                );
              }

              return (
                <CustomPolyline
                  key={`corridor-${c.id}`}
                  path={path}
                  strokeColor={
                    isRouteActive 
                      ? (isDark ? '#155e75' : '#0284c7') 
                      : (isDark ? '#1e2936' : '#94a3b8')
                  }
                  strokeOpacity={isRouteActive ? 0.75 : 0.45}
                  strokeWeight={isRouteActive ? 3.5 : 2}
                  zIndex={2}
                />
              );
            })}

          {/* 2. Player-Owned Active Routes (Glowing High-Contrast Real Route Lines) */}
          {builtRoutes.map((route) => {
            const posA = stationLookup[route.stationAId];
            const posB = stationLookup[route.stationBId];
            if (!posA || !posB) return null;

            const corridor = corridorLookup[route.corridorId];
            const path: google.maps.LatLngLiteral[] = [
              { lat: posA.lat, lng: posA.lng },
              ...(corridor?.waypoints || []),
              { lat: posB.lat, lng: posB.lng },
            ];

            if (isDensityActive) {
              const routeHeat = getDensityHeatColor(route.dailyPassengers, isDark);
              return (
                <React.Fragment key={`density-built-route-${route.id}`}>
                  <CustomPolyline
                    key={`density-built-glow-${route.id}`}
                    path={path}
                    strokeColor={routeHeat.color}
                    strokeOpacity={0.5}
                    strokeWeight={routeHeat.strokeWidth + 6}
                    zIndex={4}
                  />
                  <CustomPolyline
                    key={`density-built-line-${route.id}`}
                    path={path}
                    strokeColor={routeHeat.color}
                    strokeOpacity={1.0}
                    strokeWeight={routeHeat.strokeWidth + 1}
                    zIndex={5}
                  />
                </React.Fragment>
              );
            }

            const trackColor =
              route.trackType === 'high_speed'
                ? accent.hex // Dynamically adheres to active accent color
                : route.trackType === 'express'
                ? '#38bdf8'
                : '#a3e635';

            return (
              <CustomPolyline
                key={`built-route-${route.id}`}
                path={path}
                strokeColor={trackColor}
                strokeOpacity={0.95}
                strokeWeight={4}
                zIndex={4}
              />
            );
          })}

          {/* 3. Animated Train Fleet Markers along Real Curved Paths */}
          {animatedTrains.map((train) => (
            <AdvancedMarker
              key={train.id}
              position={train.position}
              zIndex={12}
            >
              <AnimatedTrainMarker
                id={train.id}
                name={train.name}
                trainName={train.trainName}
                trackType={train.trackType}
                color={train.color}
                bearing={train.bearing}
                progressPercent={train.progressPercent}
                speedKmH={train.speedKmH}
              />
            </AdvancedMarker>
          ))}

          {/* 4. Interactive Railway Station Markers with Zoom-Aware Label Hierarchy */}
          {visibleStations.map((station) => {
            const isSelected = selectedStationId === station.id;
            const isHovered = hoveredStationId === station.id;
            // Level of detail rule:
            // At low zoom (<= 5), hide default station labels to avoid clutter,
            // but ALWAYS reveal if selected OR hovered. At zoom >= 6, reveal compact labels.
            const shouldShowLabel = currentZoom >= 6 || isSelected || isHovered;

            return (
              <AdvancedMarker
                key={station.id}
                position={{ lat: station.lat, lng: station.lng }}
                onClick={() => onSelectStation(station.id)}
                title={`${station.name} (${station.code})`}
                zIndex={isSelected ? 10 : isHovered ? 9 : station.isOwned ? 7 : 5}
              >
                <div 
                  className="relative group cursor-pointer flex flex-col items-center"
                  onMouseEnter={() => setHoveredStationId(station.id)}
                  onMouseLeave={() => setHoveredStationId(null)}
                >
                  {/* Selection Pulsing Ring */}
                  {isSelected && (
                    <div 
                      className="absolute -inset-2 rounded-full border-2 animate-pulse pointer-events-none"
                      style={{ borderColor: accent.hex }}
                    />
                  )}

                  {/* Station Marker Body clearly distinguishing Ownership */}
                  {station.isOwned ? (
                    // OWNED STATION: Double ring with glowing center in active accent color
                    <div 
                      className="w-4 h-4 rounded-full border-2 bg-[#0b1014] flex items-center justify-center shadow-[0_0_8px_rgba(0,0,0,0.6)]"
                      style={{ borderColor: accent.hex }}
                    >
                      <div 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: accent.hex }}
                      />
                    </div>
                  ) : (
                    // AVAILABLE STATION: Clean white/slate tactical circle with center node
                    <div className={`w-3 h-3 rounded-full border ${isDark ? 'border-slate-300 bg-[#0d1419]' : 'border-slate-700 bg-white'} flex items-center justify-center hover:scale-125 transition-transform shadow-sm`}>
                      <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-white' : 'bg-slate-700'}`} />
                    </div>
                  )}

                  {/* Station Label: 35% reduced font size, compact subtle dark background, anti-overlap zoom gating */}
                  {shouldShowLabel && (
                    <div className="mt-1 flex flex-col items-center pointer-events-none whitespace-nowrap">
                      <span
                        className={`text-[6.5px] font-mono tracking-tight leading-none px-1 py-0.5 rounded-[3px] shadow-sm transition-all ${
                          station.isOwned
                            ? 'font-bold bg-[#070b0f]/90 border'
                            : isSelected
                            ? 'text-white font-bold bg-[#141d26]/95 border border-slate-400'
                            : isHovered
                            ? 'text-white font-bold bg-[#090e13]/95 border border-slate-600 scale-105'
                            : isDark
                            ? 'text-slate-300 font-medium bg-[#070b0f]/80 border border-slate-800/80'
                            : 'text-slate-800 font-semibold bg-white/95 border border-slate-300'
                        }`}
                        style={{
                          ...(station.isOwned ? { color: accent.hex, borderColor: `${accent.hex}60` } : {}),
                          textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.9)' : 'none',
                        }}
                      >
                        {/* Always display full name if selected or hovered, otherwise compact name */}
                        {station.name}
                      </span>

                      {/* Station 3-4 Letter IATA / Railway Code (visible on hover or when selected) */}
                      {(isSelected || isHovered || currentZoom >= 7) && (
                        <span className={`text-[5.5px] font-mono font-bold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {station.code}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </AdvancedMarker>
            );
          })}
        </Map>
      </div>

      {/* Map Legend (Bottom-Left Corner) - Supports Standard and Network Density modes */}
      {isDensityActive ? (
        <div className={`absolute bottom-3 left-4 z-20 flex flex-col gap-1.5 px-3.5 py-2 ${isDark ? 'bg-[#0e141a]/95 border-[#1e2a34]' : 'bg-white/95 border-slate-300'} border rounded text-[10px] font-mono backdrop-blur-sm shadow-md`}>
          <div className="flex items-center justify-between gap-4 text-[9px] font-bold">
            <span className={isDark ? 'text-amber-400' : 'text-amber-600'}>🔥 PASSENGER TRAFFIC DENSITY</span>
            <span className="text-slate-400">INTENSITY SPECTRUM</span>
          </div>
          <div className="flex items-center gap-3 pt-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6] shadow-sm" />
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>&lt;5k</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#06b6d4] shadow-sm" />
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>5k–12k</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#a3e635] shadow-sm" />
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>12k–30k</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#f97316] shadow-sm" />
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>30k–60k</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444] shadow-sm" />
              <span className="text-red-500 font-bold">&gt;60k (Peak)</span>
            </div>
          </div>
        </div>
      ) : (
        <div className={`absolute bottom-3 left-4 z-20 flex flex-wrap items-center gap-3.5 px-3 py-1.5 ${isDark ? 'bg-[#0e141a]/92 border-[#1e2a34]' : 'bg-white/92 border-slate-300'} border rounded text-[10px] font-mono backdrop-blur-sm shadow-md`}>
          <div className="flex items-center gap-1.5">
            <div 
              className="w-2.5 h-2.5 rounded-full border-2 bg-[#0d1419] flex items-center justify-center"
              style={{ borderColor: accent.hex }}
            >
              <div 
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: accent.hex }}
              />
            </div>
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>OWNED</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full border ${isDark ? 'border-white bg-[#0d1419]' : 'border-slate-700 bg-white'}`} />
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>AVAILABLE</span>
          </div>

          {showReferenceCorridors && (
            <div className="flex items-center gap-1.5">
              <div className={`w-3.5 h-0.5 ${isDark ? 'bg-[#155e75]' : 'bg-[#0284c7]'}`} />
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>CORRIDOR</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <div 
              className="w-3.5 h-1 rounded-full shadow-[0_0_6px]"
              style={{ backgroundColor: accent.hex }}
            />
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>YOUR SERVICE</span>
          </div>

          {/* Current Zoom Telemetry Indicator */}
          <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-slate-700/50 text-[9px] text-slate-500">
            <span>ZOOM:</span>
            <span className="font-bold text-slate-400">LVL {currentZoom}</span>
          </div>
        </div>
      )}

      {/* Map Attribution Notice (Bottom-Right) */}
      <div className={`absolute bottom-3 right-4 z-20 hidden md:flex items-center gap-2.5 text-[9px] font-mono ${isDark ? 'text-slate-500 bg-[#0e141a]/85 border-[#1e2a34]/60' : 'text-slate-600 bg-white/85 border-slate-300'} px-2.5 py-1 rounded border shadow-sm`}>
        <span>GOOGLE MAPS JS API</span>
        <span>·</span>
        <span className={isDark ? 'text-slate-400' : 'text-slate-700'}>VERIFIED GEOGRAPHIC ALIGNMENTS</span>
      </div>
    </div>
  );
};
