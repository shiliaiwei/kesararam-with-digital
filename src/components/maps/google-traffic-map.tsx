"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Navigation, MapPin } from "lucide-react";

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
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

  useEffect(() => {
    // Load Google Maps script
    const loadGoogleMaps = () => {
      if (typeof window !== 'undefined' && !window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => initMap();
        document.head.appendChild(script);
      } else if (window.google) {
        initMap();
      }
    };

    const initMap = () => {
      if (!mapRef.current || !window.google) return;

      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat, lng: lon },
        zoom: zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      // Add traffic layer
      const trafficLayer = new (window as any).google.maps.TrafficLayer();
      trafficLayer.setMap(map);

      // Add marker for center point
      new (window as any).google.maps.Marker({
        position: { lat, lng: lon },
        map: map,
        title: "Phnom Penh, Cambodia",
        icon: {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#EF4444",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        },
      });

      setMapLoaded(true);
    };

    loadGoogleMaps();
  }, [lat, lon, zoom]);

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
        className="w-full bg-gray-100" 
        style={{ height: "500px" }}
      >
        {!mapLoaded && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-black border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-bold text-gray-600">Loading map...</p>
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
