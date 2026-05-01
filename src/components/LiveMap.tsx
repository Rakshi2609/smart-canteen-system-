"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Autocomplete } from "@react-google-maps/api";
import { Loader2, Navigation, Search } from "lucide-react";

export interface Canteen {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: string;
  waitTime: string;
}

interface LiveMapProps {
  onCanteenSelect?: (canteen: Canteen) => void;
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
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ],
};

export default function LiveMap({ onCanteenSelect }: LiveMapProps) {
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
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const panoRef = useRef<HTMLDivElement>(null);

  // Helper to generate simulated Canteen data for real places
  const generateSimulatedData = (place: google.maps.places.PlaceResult): Canteen => {
    const statuses = ["available", "low_stock", "sold_out"];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const waitTimes = ["5 mins", "10 mins", "15 mins", "25 mins", "45 mins"];
    
    return {
      id: place.place_id || Math.random().toString(),
      name: place.name || "Unknown Restaurant",
      lat: place.geometry?.location?.lat() || 0,
      lng: place.geometry?.location?.lng() || 0,
      status: randomStatus,
      waitTime: waitTimes[Math.floor(Math.random() * waitTimes.length)]
    };
  };

  const fetchNearbyRestaurants = useCallback((location: google.maps.LatLng | {lat: number, lng: number}, currentMap: google.maps.Map) => {
    if (!currentMap) return;
    
    // Extract raw lat/lng for center
    const centerLat = 'lat' in location && typeof location.lat === 'function' ? location.lat() : (location as any).lat;
    const centerLng = 'lng' in location && typeof location.lng === 'function' ? location.lng() : (location as any).lng;
    const centerLatLng = new window.google.maps.LatLng(centerLat, centerLng);

    const generateMockRestaurants = (baseLat: number, baseLng: number): Canteen[] => {
      const mocks = [
        { latOffset: 0.002, lngOffset: 0.002, name: "Main Campus Cafeteria" },
        { latOffset: -0.006, lngOffset: 0.005, name: "Engineering Block Canteen" },
        { latOffset: 0.012, lngOffset: -0.008, name: "Hostel Mess" },
        { latOffset: -0.015, lngOffset: -0.015, name: "Sports Complex Kiosk" },
        { latOffset: 0.004, lngOffset: -0.003, name: "Library Cafe" },
        { latOffset: -0.012, lngOffset: 0.010, name: "Global Cuisine Court" },
        { latOffset: 0.018, lngOffset: 0.015, name: "Highway Dhaba" },
        { latOffset: -0.008, lngOffset: -0.012, name: "Student Corner" },
      ];

      const waitTimes = ["5 mins", "10 mins", "15 mins", "25 mins", "45 mins"];

      return mocks.map((mock, idx) => {
        const placeLatLng = new window.google.maps.LatLng(baseLat + mock.latOffset, baseLng + mock.lngOffset);
        let distance = 0;
        try {
          distance = window.google.maps.geometry.spherical.computeDistanceBetween(centerLatLng, placeLatLng);
        } catch (e) {
          // Fallback simple distance if geometry library fails
          distance = Math.sqrt(Math.pow(mock.latOffset, 2) + Math.pow(mock.lngOffset, 2)) * 111000;
        }
        
        let derivedStatus = "available"; // green for nearby (< 500m)
        if (distance > 1500) {
          derivedStatus = "sold_out"; // red for far
        } else if (distance > 500) {
          derivedStatus = "low_stock"; // yellow for moderate
        }

        return {
          id: `mock-${idx}`,
          name: mock.name,
          lat: baseLat + mock.latOffset,
          lng: baseLng + mock.lngOffset,
          status: derivedStatus,
          waitTime: waitTimes[Math.floor(Math.random() * waitTimes.length)]
        };
      });
    };

    try {
      const service = new window.google.maps.places.PlacesService(currentMap);
      
      const request = {
        location,
        radius: 2000, // 2km radius
        type: 'restaurant'
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          const waitTimes = ["5 mins", "10 mins", "15 mins", "25 mins", "45 mins"];

          const mappedRestaurants = results.slice(0, 15).map(place => {
            const placeLatLng = place.geometry?.location;
            let distance = 0;
            if (placeLatLng) {
              distance = window.google.maps.geometry.spherical.computeDistanceBetween(centerLatLng, placeLatLng);
            }
            
            let derivedStatus = "available"; // green for nearby (< 500m)
            if (distance > 1500) {
              derivedStatus = "sold_out"; // red for far
            } else if (distance > 500) {
              derivedStatus = "low_stock"; // yellow for moderate
            }

            return {
              id: place.place_id || Math.random().toString(),
              name: place.name || "Unknown Restaurant",
              lat: placeLatLng?.lat() || 0,
              lng: placeLatLng?.lng() || 0,
              status: derivedStatus,
              waitTime: waitTimes[Math.floor(Math.random() * waitTimes.length)]
            };
          });

          setRestaurants(mappedRestaurants);
        } else {
          // Fallback if no results or API error
          setRestaurants(generateMockRestaurants(centerLat, centerLng));
        }
      });
    } catch (e) {
      // If PlacesService fails to instantiate completely, use mocks
      setRestaurants(generateMockRestaurants(centerLat, centerLng));
    }
  }, []);

  useEffect(() => {
    if (isLoaded && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (loc) => {
          const newPos = { lat: loc.coords.latitude, lng: loc.coords.longitude };
          setPosition(newPos);
        },
        (err) => {
          console.error("Error getting location:", err);
          setPosition({ lat: 12.9716, lng: 77.5946 }); // Fallback to Bangalore
        }
      );
    } else if (isLoaded) {
      setPosition({ lat: 12.9716, lng: 77.5946 });
    }
  }, [isLoaded]);

  // When map loads or center changes dramatically, fetch new restaurants
  useEffect(() => {
    if (map && position) {
      fetchNearbyRestaurants(position, map);
    }
  }, [map, position, fetchNearbyRestaurants]);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
    
    // Instantiate StreetViewPanorama and link it to the map
    if (panoRef.current) {
      const panorama = new window.google.maps.StreetViewPanorama(panoRef.current, {
        position: map.getCenter() || { lat: 12.9716, lng: 77.5946 },
        pov: {
          heading: 34,
          pitch: 10,
        },
        // Match the map dark theme styling for the street view controls where possible
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
        },
        panControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
        },
        addressControlOptions: {
          position: window.google.maps.ControlPosition.BOTTOM_CENTER,
        },
      });
      map.setStreetView(panorama);
    }
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const newPos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setPosition(newPos);
        map?.panTo(newPos);
        map?.setZoom(15);
      }
    }
  };

  if (loadError) {
    return <div className="text-red-500 p-4">Error loading Maps: {loadError.message}</div>;
  }

  if (!isLoaded || !position) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-slate-400">Loading Google Maps...</p>
      </div>
    );
  }

  const getMarkerIcon = (status: string) => {
    const color = status === 'available' ? '#10b981' : status === 'low_stock' ? '#f59e0b' : '#ef4444';
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: color,
      strokeOpacity: 0.3,
      strokeWeight: 12,
      scale: 8,
    };
  };

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={position}
        zoom={16}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{ ...mapOptions, styles: isDarkMode ? mapOptions.styles : [] }}
      >
        {/* User Location Marker */}
        <Marker 
          position={position}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: '#3b82f6',
            fillOpacity: 1,
            strokeColor: '#3b82f6',
            strokeOpacity: 0.3,
            strokeWeight: 12,
            scale: 8,
          }}
          title="You are here"
        />

        {/* Restaurant Markers */}
        {restaurants.map(restaurant => (
          <Marker
            key={restaurant.id}
            position={{ lat: restaurant.lat, lng: restaurant.lng }}
            icon={getMarkerIcon(restaurant.status)}
            onClick={() => {
              setActiveMarker(restaurant.id);
              onCanteenSelect?.(restaurant);
            }}
          >
            {activeMarker === restaurant.id && (
              <InfoWindow
                onCloseClick={() => setActiveMarker(null)}
                options={{
                  pixelOffset: new window.google.maps.Size(0, -10),
                  disableAutoPan: false,
                }}
              >
                <div className="p-2 min-w-[200px] bg-white text-black rounded-lg shadow-xl">
                  <h3 className="font-bold text-gray-900 text-base">{restaurant.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      restaurant.status === 'available' ? 'bg-emerald-500' :
                      restaurant.status === 'low_stock' ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm font-medium capitalize text-gray-700">
                      {restaurant.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 font-medium">Wait Time: {restaurant.waitTime}</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>

      {/* Floating Controls */}
      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-3">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-4 bg-[#1e1e1e]/90 backdrop-blur-md border border-white/20 rounded-full shadow-2xl hover:bg-[#2a2a2a] transition-all text-white flex items-center justify-center"
          title="Toggle Map Style"
        >
          <span className="text-xl leading-none">{isDarkMode ? '☀️' : '🌙'}</span>
        </button>
        <button 
          onClick={() => map?.panTo(position)}
          className="p-4 bg-[#1e1e1e]/90 backdrop-blur-md border border-white/20 rounded-full shadow-2xl hover:bg-[#2a2a2a] transition-all text-white flex items-center justify-center"
          title="Recenter to my location"
        >
          <Navigation size={20} />
        </button>
      </div>
    </div>
  );
}
