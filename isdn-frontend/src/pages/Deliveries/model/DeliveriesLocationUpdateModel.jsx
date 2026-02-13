import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/feedback/Modal";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { MapPin, Navigation } from "lucide-react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import {
  GOOGLE_MAPS_API_KEY,
  DEFAULT_MAP_CENTER,
} from "../../../config/maps.config";

// Map container style
const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "0.5rem",
};

export function DeliveriesLocationUpdateModel({
  isOpen,
  onClose,
  order,
  onUpdate,
}) {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER);
  const [markerPosition, setMarkerPosition] = useState(null);

  useEffect(() => {
    if (order && isOpen) {
      // Pre-fill with current location if available
      if (order.customerLocation) {
        const lat = order.customerLocation.latitude || "";
        const lng = order.customerLocation.longitude || "";
        setLatitude(lat);
        setLongitude(lng);

        console.log("Order Latitude", lat);
        console.log("Order Longitude", lng);

        // Set map center and marker to current location if valid coordinates exist
        if (lat && lng) {
          const position = { lat: parseFloat(lat), lng: parseFloat(lng) };
          setMapCenter(position);
          setMarkerPosition(position);
        } else {
          // If no valid coordinates, use default center
          setMapCenter(DEFAULT_MAP_CENTER);
          setMarkerPosition(null);
        }
      } else {
        // No current location, reset to defaults
        setLatitude("");
        setLongitude("");
        setMapCenter(DEFAULT_MAP_CENTER);
        setMarkerPosition(null);
      }
    }
  }, [order, isOpen]);

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
    setMarkerPosition({ lat, lng });
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setLatitude(lat.toFixed(6));
          setLongitude(lng.toFixed(6));

          // Update map center and marker
          const newPosition = { lat, lng };
          setMapCenter(newPosition);
          setMarkerPosition(newPosition);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your current location. Please enter manually.");
        },
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleLatitudeChange = (e) => {
    const value = e.target.value;
    setLatitude(value);

    // Update marker position if both coordinates are valid
    const lat = parseFloat(value);
    const lng = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      const position = { lat, lng };
      setMarkerPosition(position);
      setMapCenter(position);
    }
  };

  const handleLongitudeChange = (e) => {
    const value = e.target.value;
    setLongitude(value);

    // Update marker position if both coordinates are valid
    const lat = parseFloat(latitude);
    const lng = parseFloat(value);
    if (!isNaN(lat) && !isNaN(lng)) {
      const position = { lat, lng };
      setMarkerPosition(position);
      setMapCenter(position);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!latitude || !longitude) {
      alert("Please enter both latitude and longitude");
      return;
    }

    // Validate latitude and longitude
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      alert("Latitude must be between -90 and 90");
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      alert("Longitude must be between -180 and 180");
      return;
    }

    setLoading(true);
    try {
      await onUpdate(order.id, {
        latitude: lat,
        longitude: lng,
      });
      onClose();
    } catch (error) {
      console.error("Error updating location:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Location - ${order.orderNumber}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Current Location Display */}
        {order.currentLocation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col-3  gap-2 items-center">
                <div>
                  <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
                </div>
                <div className="font-semibold text-blue-900">
                  Current Location -
                </div>
                <div className="flex items-center gap-4 text-sm text-blue-800">
                  <span>
                    <span className="font-medium">Latitude:</span>{" "}
                    {order.currentLocation.latitude}
                  </span>
                  <span>
                    <span className="font-medium">Longitude:</span>{" "}
                    {order.currentLocation.longitude}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Google Map */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={13}
              onClick={handleMapClick}
              options={{
                streetViewControl: false,
                mapTypeControl: true,
                fullscreenControl: false,
              }}
            >
              {markerPosition && (
                <Marker
                  position={markerPosition}
                  draggable={true}
                  onDragEnd={handleMapClick}
                />
              )}
            </GoogleMap>
          </LoadScript>
        </div>

        {/* Instructions */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <p className="text-sm text-slate-700">
            <span className="font-medium">💡 Tip:</span> Click anywhere on the
            map to set the location, or drag the marker to adjust the position.
          </p>
        </div>

        {/* Update Location Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Latitude <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g., 6.9271"
                value={latitude}
                onChange={handleLatitudeChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Longitude <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g., 79.8612"
                value={longitude}
                onChange={handleLongitudeChange}
                required
              />
            </div>
          </div>

          {/* Get Current Location Button */}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Updating..." : "Update Location"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
