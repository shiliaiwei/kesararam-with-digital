"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Navigation, RefreshCw } from "lucide-react";

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
    googleMapsLoading?: boolean;
  }
}

interface GoogleTrafficMapProps {
  lat?: number;
  lon?: number;
  zoom?: number;
}

export function GoogleTrafficMap({ 
  lat = 13.41013, 
  lon = 103.94728, 
  zoom = 12 
}: GoogleTrafficMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let checkInterval: NodeJS.Timeout;

    // Set timeout to show message after 5 seconds
    timeoutId = setTimeout(() => {
      if (!mapLoaded) {
        setLoadingTimeout(true);
      }
    }, 5000);

    const initMap = () => {
      if (!mapRef.current || !window.google?.maps) return;

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat, lng: lon },
          zoom: zoom,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        // Add traffic layer
        const trafficLayer = new window.google.maps.TrafficLayer();
        trafficLayer.setMap(map);

        // Add marker
        new window.google.maps.Marker({
          position: { lat, lng: lon },
          map: map,
          title: "Phnom Penh, Cambodia",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#EF4444",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
          },
        });

        setMapLoaded(true);
        setError(null);
      } catch (err) {
        console.error("Map initialization error:", err);
        setError("Failed to initialize map");
        setMapLoaded(true);
      }
    };

    // Wait for Google Maps to be available (preloaded in layout)
    if (window.google?.maps) {
      initMap();
    } else {
      // Poll for Google Maps availability
      checkInterval = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkInterval);
          initMap();
        }
      }, 100);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [lat, lon, zoom]);

  const handleRetry = () => {
    setMapLoaded(false);
    setError(null);
    setLoadingTimeout(false);
    window.location.reload();
  };

  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] overflow-hidden">
      {/* Header */}
      <div className="bg-red-500 border-b-4 border-black px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
            <Navigation size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Live Traffic Map</h3>
            <p className="text-xs font-bold text-white/90">Real-time road conditions</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white border-2 border-black px-3 py-1.5">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs font-black uppercase">Live</span>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef}
        className="w-full bg-gray-100 relative" 
        style={{ height: "500px" }}
      >
        {!mapLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-black border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-bold text-gray-600">
                {loadingTimeout ? "Almost ready..." : "Loading traffic data..."}
              </p>
              {loadingTimeout && (
                <p className="text-xs text-gray-500 mt-2">
                  Connecting to Google Maps
                </p>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-500 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-white" />
              </div>
              <p className="text-lg font-black text-red-900 mb-2">Map Failed to Load</p>
              <p className="text-sm text-red-700 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="bg-red-500 text-white border-2 border-black px-6 py-2 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-yellow-400 border-t-4 border-black px-6 py-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black mb-1">Stay Safe on the Road</p>
            <p className="text-xs font-medium text-black/80">
              View real-time traffic conditions powered by Google Maps. 
              Green = smooth traffic, Yellow = moderate, Red = heavy congestion.
            </p>
          </div>
        </div>
        
        {/* Traffic Legend */}
        <div className="mt-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-green-500 border border-black" />
            <span className="text-xs font-bold">Smooth</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-yellow-500 border border-black" />
            <span className="text-xs font-bold">Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-red-500 border border-black" />
            <span className="text-xs font-bold">Heavy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-red-900 border border-black" />
            <span className="text-xs font-bold">Stopped</span>
          </div>
        </div>
      </div>
    </div>
  );
}
