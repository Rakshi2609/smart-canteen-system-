"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from "@react-google-maps/api";
import { Loader2, Navigation, Flame } from "lucide-react";

export interface Canteen {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: string;
  waitTime: string;
  cuisine?: string;
  address?: string;
  openNow?: boolean;
}

interface LocationPoint {
  lat: number;
  lng: number;
  address: string;
}

interface LiveMapProps {
  onCanteenSelect?: (canteen: Canteen) => void;
  deliveryRoute?: { origin: LocationPoint; destination: LocationPoint };
}

const libraries: ("places" | "geometry" | "visualization")[] = ["places", "geometry", "visualization"];

const mapContainerStyle = {
  width: "100%",
  height: "100%"
};

// Dark theme for Google Maps
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
  ],
};

export default function LiveMap({ onCanteenSelect, deliveryRoute }: LiveMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(null);
  const [restaurants, setRestaurants] = useState<Canteen[]>([]);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);

  // Imperatively control the heatmap layer so it actually cleans up on toggle
  useEffect(() => {
    if (!map || !window.google || restaurants.length === 0) return;
    if (showHeatmap) {
      const points = restaurants.map(r => new window.google.maps.LatLng(r.lat, r.lng));
      if (!heatmapRef.current) {
        heatmapRef.current = new window.google.maps.visualization.HeatmapLayer({
          data: points,
          radius: 50,
          opacity: 0.65,
          gradient: [
            "rgba(0,0,0,0)",
            "rgba(255,235,0,0.6)",
            "rgba(255,128,0,0.85)",
            "rgba(220,38,38,1)"
          ]
        });
      } else {
        heatmapRef.current.setData(points);
      }
      heatmapRef.current.setMap(map);
    } else {
      if (heatmapRef.current) {
        heatmapRef.current.setMap(null);
      }
    }

    return () => {
      if (heatmapRef.current) heatmapRef.current.setMap(null);
    };
  }, [showHeatmap, map, restaurants]);

  // --- DELIVERY ROUTE STATE (OSRM) ---
  const [routePath, setRoutePath] = useState<{lat: number, lng: number}[]>([]);
  const [bikePosition, setBikePosition] = useState<{lat: number, lng: number} | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoaded && "geolocation" in navigator && !deliveryRoute) {
      navigator.geolocation.getCurrentPosition(
        (loc) => setPosition({ lat: loc.coords.latitude, lng: loc.coords.longitude }),
        () => setPosition({ lat: 12.9716, lng: 77.5946 })
      );
    } else if (isLoaded && !deliveryRoute) {
      setPosition({ lat: 12.9716, lng: 77.5946 });
    }
  }, [isLoaded, deliveryRoute]);

  // --- OSRM ROUTING LOGIC ---
  useEffect(() => {
    if (!deliveryRoute || !map) return;

    // Focus map on delivery origin
    setPosition(deliveryRoute.origin);

    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${deliveryRoute.origin.lng},${deliveryRoute.origin.lat};${deliveryRoute.destination.lng},${deliveryRoute.destination.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          // GeoJSON coordinates are [lng, lat]
          const path = route.geometry.coordinates.map((coord: number[]) => ({
            lat: coord[1],
            lng: coord[0]
          }));
          setRoutePath(path);
          setBikePosition(path[0]); // Start bike at origin

          // Fit Map Bounds
          const bounds = new window.google.maps.LatLngBounds();
          path.forEach((p: any) => bounds.extend(p));
          map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });

          // Start Animation Loop
          // We will simulate the ride over 15 seconds for visual demo purposes, regardless of actual duration
          const durationMs = 15000; 
          const startTime = performance.now();

          const animate = (time: number) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / durationMs, 1);
            
            // Find current segment
            const totalPoints = path.length - 1;
            const exactIndex = progress * totalPoints;
            const index = Math.floor(exactIndex);
            
            if (index < totalPoints) {
              const p1 = path[index];
              const p2 = path[index + 1];
              const segmentProgress = exactIndex - index;
              
              const currentLat = p1.lat + (p2.lat - p1.lat) * segmentProgress;
              const currentLng = p1.lng + (p2.lng - p1.lng) * segmentProgress;
              
              setBikePosition({ lat: currentLat, lng: currentLng });
              
              if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
              }
            } else {
              setBikePosition(path[path.length - 1]);
            }
          };
          
          animationRef.current = requestAnimationFrame(animate);
        }
      } catch (err) {
        console.error("OSRM Routing Error:", err);
      }
    };

    fetchRoute();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [deliveryRoute, map]);

  const fetchNearbyRestaurants = useCallback(async (location: {lat: number, lng: number}) => {
    if (deliveryRoute) return;
    const { lat, lng } = location;
    const radius = 2500;
    const query = `
      [out:json][timeout:15];
      (
        node["amenity"~"restaurant|cafe|fast_food|food_court|canteen|bar|pub"](around:${radius},${lat},${lng});
        way["amenity"~"restaurant|cafe|fast_food|food_court|canteen|bar|pub"](around:${radius},${lat},${lng});
      );
      out body;
    `;
    const statuses = ["available", "medium-priority", "high-priority"];
    const waitTimes = ["2 min walk", "5 min walk", "8 min walk", "12 min walk", "3 min walk"];
    try {
      const res = await fetch(`https://overpass-api.de/api/interpreter`, {
        method: "POST",
        body: query,
      });
      const data = await res.json();
      const elements = (data.elements as any[])
        .filter(e => e.tags?.name && e.lat && e.lon)
        .slice(0, 25);
      if (elements.length > 0) {
        setRestaurants(elements.map((el, idx) => ({
          id: String(el.id),
          name: el.tags.name,
          lat: el.lat,
          lng: el.lon,
          status: statuses[idx % 3],
          waitTime: waitTimes[idx % waitTimes.length],
          cuisine: el.tags.cuisine?.replace(/_/g, " ") || "Restaurant",
          address: el.tags["addr:street"] ? `${el.tags["addr:housenumber"] || ""} ${el.tags["addr:street"]}`.trim() : undefined,
          openNow: idx % 4 !== 0, // simulate ~75% open
        })));
      } else {
        setRestaurants(generateFallbackPlaces(lat, lng));
      }
    } catch {
      setRestaurants(generateFallbackPlaces(lat, lng));
    }
  }, [deliveryRoute]);

  const generateFallbackPlaces = (baseLat: number, baseLng: number): Canteen[] => {
    const mocks = [
      { lo: 0.003, la: 0.001, name: "Green Garden Cafe", cuisine: "vegetarian", status: "available" },
      { lo: -0.005, la: 0.004, name: "Spice Route Restaurant", cuisine: "Indian", status: "medium-priority" },
      { lo: 0.010, la: -0.007, name: "The Urban Kitchen", cuisine: "continental", status: "high-priority" },
      { lo: 0.007, la: 0.013, name: "Sunrise Fast Food", cuisine: "fast food", status: "available" },
      { lo: -0.013, la: -0.004, name: "Corner Brew & Bite", cuisine: "cafe", status: "medium-priority" },
      { lo: 0.016, la: 0.003, name: "Tandoor Palace", cuisine: "Indian", status: "high-priority" },
      { lo: -0.003, la: -0.010, name: "City Noodle Bar", cuisine: "Chinese", status: "available" },
      { lo: -0.009, la: 0.016, name: "Grand Buffet House", cuisine: "buffet", status: "medium-priority" },
      { lo: 0.020, la: -0.013, name: "Campus Canteen", cuisine: "canteen", status: "available" },
    ];
    return mocks.map((m, idx) => ({
      id: `fb-${idx}`,
      name: m.name,
      lat: baseLat + m.la,
      lng: baseLng + m.lo,
      status: m.status,
      waitTime: `${2 + idx * 2} min walk`,
      cuisine: m.cuisine,
      openNow: idx % 4 !== 0,
    }));
  };

  useEffect(() => {
    if (map && position && !deliveryRoute) {
      fetchNearbyRestaurants(position);
    }
  }, [map, position, fetchNearbyRestaurants, deliveryRoute]);

  const onLoad = useCallback((map: google.maps.Map) => setMap(map), []);
  const onUnmount = useCallback(() => setMap(null), []);

  if (loadError) return <div className="text-red-500 p-4">Error loading Maps: {loadError.message}</div>;
  if (!isLoaded || (!position && !deliveryRoute)) return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#242f3e]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={position!}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{ ...mapOptions, styles: isDarkMode ? mapOptions.styles : [] }}
      >
        {/* --- DELIVERY ROUTE MODE --- */}
        {deliveryRoute && (
          <>
            <Marker position={deliveryRoute.origin} title="Donor Location"
              icon={{ path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z", fillColor: '#10b981', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2, scale: 1.5, anchor: new window.google.maps.Point(12, 22) }} 
            />
            <Marker position={deliveryRoute.destination} title="NGO Location"
              icon={{ path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z", fillColor: '#ef4444', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2, scale: 1.5, anchor: new window.google.maps.Point(12, 22) }} 
            />
            {routePath.length > 0 && (
              <Polyline path={routePath} options={{ strokeColor: "#3b82f6", strokeOpacity: 0.8, strokeWeight: 6 }} />
            )}
            {/* Animated Bike Marker */}
            {bikePosition && (
              <Marker position={bikePosition} zIndex={999}
                label={{ text: "🛵", fontSize: "32px" }}
                icon={{ url: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" }} // Transparent pixel so only emoji shows
              />
            )}
          </>
        )}

        {/* Heatmap is controlled imperatively via heatmapRef, no JSX needed */}

        {/* --- STANDARD CANTEEN MODE --- */}
        {!deliveryRoute && restaurants.map(restaurant => {
          let color = '#059669'; // Darker Green (emerald-600)
          if (restaurant.status === 'high-priority') color = '#dc2626'; // Darker Red (red-600)
          if (restaurant.status === 'medium-priority') color = '#d97706'; // Darker Orange (amber-600)
          
          return (
            <Marker
              key={restaurant.id}
              position={{ lat: restaurant.lat, lng: restaurant.lng }}
              icon={{ 
                path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z", 
                fillColor: color, 
                fillOpacity: 1, 
                strokeColor: '#ffffff', 
                strokeWeight: 2, 
                scale: 1.5,
                anchor: new window.google.maps.Point(12, 22)
              }}
              onClick={() => {
                setActiveMarker(restaurant.id);
                onCanteenSelect?.(restaurant);
              }}
            >
              {activeMarker === restaurant.id && (
                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                  <div className="p-2 min-w-[200px] bg-white text-black rounded-lg shadow-xl">
                    <h3 className="font-bold text-gray-900">{restaurant.name}</h3>
                    <p className="text-sm font-medium mt-1" style={{ color }}>
                      {restaurant.status === 'high-priority' ? 'Critical Action Required' : 
                       restaurant.status === 'medium-priority' ? 'Pickup Pending' : 'Available for Pickup'}
                    </p>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          );
        })}
      </GoogleMap>

      {/* Floating Controls */}
      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-3">
        {!deliveryRoute && (
          <button 
            onClick={() => setShowHeatmap(!showHeatmap)} 
            className={`p-4 backdrop-blur-md rounded-full shadow-2xl transition-all text-white ${showHeatmap ? 'bg-red-500 hover:bg-red-600' : 'bg-[#1e1e1e]/90 hover:bg-[#2a2a2a]'}`}
            title="Toggle Expiry Heatmap"
          >
            <Flame size={20} />
          </button>
        )}
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-4 bg-[#1e1e1e]/90 backdrop-blur-md rounded-full shadow-2xl hover:bg-[#2a2a2a] transition-all text-white"><span className="text-xl leading-none">{isDarkMode ? '☀️' : '🌙'}</span></button>
        {!deliveryRoute && <button onClick={() => map?.panTo(position!)} className="p-4 bg-[#1e1e1e]/90 backdrop-blur-md rounded-full shadow-2xl hover:bg-[#2a2a2a] transition-all text-white"><Navigation size={20} /></button>}
      </div>
    </div>
  );
}
