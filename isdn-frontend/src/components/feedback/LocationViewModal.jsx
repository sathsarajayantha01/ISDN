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
  const [userLocation, setUserLocation] = useState(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  useEffect(() => {
    if (order && isOpen) {
      let userPos = null;
      let deliveryPos = null;

      // Get user location (customer/destination)
      if (
        order.customerLocation &&
        order.customerLocation.latitude &&
        order.customerLocation.longitude
      ) {
        userPos = {
          lat: parseFloat(order.customerLocation.latitude),
          lng: parseFloat(order.customerLocation.longitude),
        };
        setUserLocation(userPos);
      } else {
        setUserLocation(null);
      }

      // Get current delivery location (driver's current position)
      if (order.currentLocation) {
        const lat = order.currentLocation.latitude;
        const lng = order.currentLocation.longitude;

        if (lat && lng) {
          deliveryPos = { lat: parseFloat(lat), lng: parseFloat(lng) };
          setDeliveryLocation(deliveryPos);
        }
      } else {
        setDeliveryLocation(null);
      }

      // Center map between both locations or use available location
      if (userPos && deliveryPos) {
        // Calculate center between two points
        const centerLat = (userPos.lat + deliveryPos.lat) / 2;
        const centerLng = (userPos.lng + deliveryPos.lng) / 2;
        setMapCenter({ lat: centerLat, lng: centerLng });
      } else if (deliveryPos) {
        setMapCenter(deliveryPos);
      } else if (userPos) {
        setMapCenter(userPos);
      } else {
        setMapCenter(defaultCenter);
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
        {/* User Location (Customer/Destination) */}
        {userLocation ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="font-semibold text-blue-900">
                  Customer Location (Destination)
                </span>
                <div className="flex items-center gap-4 text-sm text-blue-800">
                  <span>
                    <span className="font-medium">Name:</span>{" "}
                    {order.customerLocation?.name || "N/A"}
                  </span>
                  <span>
                    <span className="font-medium">Lat:</span>{" "}
                    {userLocation.lat.toFixed(6)}
                  </span>
                  <span>
                    <span className="font-medium">Lng:</span>{" "}
                    {userLocation.lng.toFixed(6)}
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
                  Customer Location Not Available
                </p>
                <p className="text-sm text-amber-700">
                  Customer location information is missing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Delivery Location (Driver's Position) */}
        {deliveryLocation ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <MapPin className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="font-semibold text-green-900">
                  Current Delivery Location
                </span>
                <div className="flex items-center gap-4 text-sm text-green-800">
                  {order.driver && (
                    <span>
                      <span className="font-medium">Driver:</span>{" "}
                      {order.driver?.name || "N/A"}
                    </span>
                  )}
                  <span>
                    <span className="font-medium">Lat:</span>{" "}
                    {deliveryLocation.lat.toFixed(6)}
                  </span>
                  <span>
                    <span className="font-medium">Lng:</span>{" "}
                    {deliveryLocation.lng.toFixed(6)}
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
                  Delivery Location Not Available
                </p>
                <p className="text-sm text-amber-700">
                  The driver hasn't updated the location for this order yet.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Google Map */}
        {(userLocation || deliveryLocation) && (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={userLocation && deliveryLocation ? 13 : 15}
                options={{
                  streetViewControl: false,
                  mapTypeControl: true,
                  fullscreenControl: false,
                  zoomControl: true,
                  disableDefaultUI: false,
                }}
              >
                {/* User Location Marker (Blue - Destination) */}
                {userLocation && (
                  <Marker
                    position={userLocation}
                    label={{
                      text: "📍",
                      fontSize: "24px",
                    }}
                    title="Customer Location (Destination)"
                    icon={{
                      url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    }}
                  />
                )}

                {/* Delivery Location Marker (Green - Driver's Position) */}
                {deliveryLocation && (
                  <Marker
                    position={deliveryLocation}
                    label={{
                      text: "🚚",
                      fontSize: "24px",
                    }}
                    title="Current Delivery Location"
                    icon={{
                      url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                    }}
                  />
                )}
              </GoogleMap>
            </LoadScript>

            {/* Map Legend */}
            <div className="bg-slate-50 border-t border-slate-200 p-3">
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-slate-700">
                    Customer Location (Destination)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-slate-700">
                    Current Delivery Location
                  </span>
                </div>
              </div>
            </div>
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
