"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from "@react-google-maps/api";
import { Loader2, Navigation } from "lucide-react";

export interface Canteen {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: string;
  waitTime: string;
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

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

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

  // Standard Canteen Fetching Logic (Only run if no deliveryRoute is active)
  const fetchNearbyRestaurants = useCallback((location: {lat: number, lng: number}, currentMap: google.maps.Map) => {
    if (!currentMap || deliveryRoute) return;
    const centerLatLng = new window.google.maps.LatLng(location.lat, location.lng);

    const generateMockRestaurants = (baseLat: number, baseLng: number): Canteen[] => {
      const mocks = [
        { latOffset: 0.002, lngOffset: 0.002, name: "Main Campus Cafeteria" },
        { latOffset: -0.006, lngOffset: 0.005, name: "Engineering Block Canteen" },
        { latOffset: 0.012, lngOffset: -0.008, name: "Hostel Mess" },
      ];
      return mocks.map((mock, idx) => ({
        id: `mock-${idx}`,
        name: mock.name,
        lat: baseLat + mock.latOffset,
        lng: baseLng + mock.lngOffset,
        status: "available",
        waitTime: "5 mins"
      }));
    };

    try {
      const service = new window.google.maps.places.PlacesService(currentMap);
      service.nearbySearch({ location, radius: 2000, type: 'restaurant' }, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setRestaurants(results.slice(0, 15).map(place => ({
            id: place.place_id || Math.random().toString(),
            name: place.name || "Unknown",
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0,
            status: "available",
            waitTime: "10 mins"
          })));
        } else {
          setRestaurants(generateMockRestaurants(location.lat, location.lng));
        }
      });
    } catch (e) {
      setRestaurants(generateMockRestaurants(location.lat, location.lng));
    }
  }, [deliveryRoute]);

  useEffect(() => {
    if (map && position && !deliveryRoute) {
      fetchNearbyRestaurants(position, map);
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
              icon={{ path: window.google.maps.SymbolPath.CIRCLE, fillColor: '#10b981', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2, scale: 8 }} 
            />
            <Marker position={deliveryRoute.destination} title="NGO Location"
              icon={{ path: window.google.maps.SymbolPath.CIRCLE, fillColor: '#ef4444', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2, scale: 8 }} 
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

        {/* --- STANDARD CANTEEN MODE --- */}
        {!deliveryRoute && restaurants.map(restaurant => (
          <Marker
            key={restaurant.id}
            position={{ lat: restaurant.lat, lng: restaurant.lng }}
            icon={{ path: window.google.maps.SymbolPath.CIRCLE, fillColor: '#10b981', fillOpacity: 1, strokeOpacity: 0.3, strokeWeight: 12, scale: 8 }}
            onClick={() => {
              setActiveMarker(restaurant.id);
              onCanteenSelect?.(restaurant);
            }}
          >
            {activeMarker === restaurant.id && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div className="p-2 min-w-[200px] bg-white text-black rounded-lg shadow-xl">
                  <h3 className="font-bold text-gray-900">{restaurant.name}</h3>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>

      {/* Floating Controls */}
      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-3">
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-4 bg-[#1e1e1e]/90 backdrop-blur-md rounded-full shadow-2xl hover:bg-[#2a2a2a] transition-all text-white"><span className="text-xl leading-none">{isDarkMode ? '☀️' : '🌙'}</span></button>
        {!deliveryRoute && <button onClick={() => map?.panTo(position!)} className="p-4 bg-[#1e1e1e]/90 backdrop-blur-md rounded-full shadow-2xl hover:bg-[#2a2a2a] transition-all text-white"><Navigation size={20} /></button>}
      </div>
    </div>
  );
}
