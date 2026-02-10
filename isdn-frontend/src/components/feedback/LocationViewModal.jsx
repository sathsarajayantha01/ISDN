import React, { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { MapPin } from "lucide-react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

// Google Maps API Key from environment variables
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

// Map container style
const mapContainerStyle = {
  width: "100%",
  height: "450px",
  borderRadius: "0.5rem",
};

// Default center (Sri Lanka - Colombo)
const defaultCenter = {
  lat: 6.9271,
  lng: 79.8612,
};

export function LocationViewModal({ isOpen, onClose, order }) {
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(null);

  useEffect(() => {
    if (order && isOpen) {
      if (order.currentLocation) {
        const lat = order.currentLocation.latitude;
        const lng = order.currentLocation.longitude;

        if (lat && lng) {
          const position = { lat: parseFloat(lat), lng: parseFloat(lng) };
          setMapCenter(position);
          setMarkerPosition(position);
        }
      } else {
        setMapCenter(defaultCenter);
        setMarkerPosition(null);
      }
    }
  }, [order, isOpen]);

  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Location - ${order.orderNumber}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Location Display */}
        {order.currentLocation ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <MapPin className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="font-semibold text-green-900">
                  Current Location
                </span>
                <div className="flex items-center gap-4 text-sm text-green-800">
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
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900">
                  Location Not Available
                </p>
                <p className="text-sm text-amber-700">
                  The driver hasn't updated the location for this order yet.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Google Map */}
        {order.currentLocation && (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={15}
                options={{
                  streetViewControl: false,
                  mapTypeControl: true,
                  fullscreenControl: false,
                  zoomControl: true,
                  disableDefaultUI: false,
                }}
              >
                {markerPosition && (
                  <Marker
                    position={markerPosition}
                    label={{
                      text: order.orderNumber,
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  />
                )}
              </GoogleMap>
            </LoadScript>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h4 className="font-semibold text-slate-900 mb-3">Order Details</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-600">Order Number:</span>
              <p className="font-medium text-slate-900">{order.orderNumber}</p>
            </div>
            <div>
              <span className="text-slate-600">Status:</span>
              <p className="font-medium text-slate-900">{order.status}</p>
            </div>
            {order.address && (
              <div className="col-span-2">
                <span className="text-slate-600">Delivery Address:</span>
                <p className="font-medium text-slate-900">{order.address}</p>
              </div>
            )}
            {order.contactNumber && (
              <div>
                <span className="text-slate-600">Contact:</span>
                <p className="font-medium text-slate-900">
                  {order.contactNumber}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
