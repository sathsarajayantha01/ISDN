import { useState, useEffect, useRef } from "react";

export function MapPicker({
  onLocationSelect,
  initialCenter,
  selectedLocation,
  apiKey,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Load Google Maps script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError("Failed to load Google Maps");
    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [apiKey]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const center = selectedLocation ||
      initialCenter || { lat: 6.9271, lng: 79.8612 };
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 13,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    mapInstanceRef.current = map;

    // Add click listener
    map.addListener("click", (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      // Update or create marker
      if (markerRef.current) {
        markerRef.current.setPosition({ lat, lng });
      } else {
        markerRef.current = new window.google.maps.Marker({
          position: { lat, lng },
          map: map,
          draggable: true,
        });

        // Add drag listener to marker
        markerRef.current.addListener("dragend", (e) => {
          const newLat = e.latLng.lat();
          const newLng = e.latLng.lng();
          onLocationSelect({ lat: newLat, lng: newLng });
        });
      }

      onLocationSelect({ lat, lng });
    });

    // Add initial marker if location is selected
    if (selectedLocation) {
      markerRef.current = new window.google.maps.Marker({
        position: selectedLocation,
        map: map,
        draggable: true,
      });

      markerRef.current.addListener("dragend", (e) => {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        onLocationSelect({ lat: newLat, lng: newLng });
      });
    }
  }, [isLoaded, initialCenter, selectedLocation, onLocationSelect]);

  // Update marker position when selectedLocation changes externally
  useEffect(() => {
    if (markerRef.current && selectedLocation) {
      markerRef.current.setPosition(selectedLocation);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo(selectedLocation);
      }
    }
  }, [selectedLocation]);

  if (error) {
    return (
      <div className="w-full h-64 bg-red-50 border-2 border-red-300 rounded-lg flex items-center justify-center">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-64 bg-slate-100 border-2 border-slate-300 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-slate-600 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-64 rounded-lg border-2 border-slate-300"
      style={{ minHeight: "256px" }}
    />
  );
}
