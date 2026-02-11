import { useState, useEffect } from "react";
import { Modal } from "../../components/feedback/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { MapPicker } from "../../components/ui/MapPicker";
import { apiAdapter } from "../../services/apiAdapter";
import {
  GOOGLE_MAPS_API_KEY,
  DEFAULT_MAP_CENTER,
} from "../../config/maps.config";

export function LoginSignUpModel({ isOpen, onClose, onSuccess }) {
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [signUpData, setSignUpData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    roleId: "",
    branchId: "",
    contactNumber: "",
    businessName: "",
    customerCode: "",
    address: "",
    district: "",
    customerType: "",
    licenseNumber: "",
    latitude: "",
    longitude: "",
  });
  const [mapCenter, setMapCenter] = useState({ lat: 6.9271, lng: 79.8612 }); // Default to Colombo
  const [markerPosition, setMarkerPosition] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch roles and branches when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      fetchBranches();
    }
  }, [isOpen]);

  const fetchRoles = async () => {
    try {
      const response = await apiAdapter.get("/roles");
      if (response.success && response.data) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await apiAdapter.get("/branches");
      if (response.success && response.data) {
        setBranches(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSignUpData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      // Update customerType when roleId changes
      if (name === "roleId") {
        const selectedRole = roles.find((role) => role.id === value);
        if (selectedRole?.roleName === "Business Customer") {
          updated.customerType = "Business";
        } else if (selectedRole?.roleName === "Retail Customer") {
          updated.customerType = "Retail";
        }
      }

      return updated;
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!signUpData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!signUpData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!signUpData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(signUpData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!signUpData.password) {
      newErrors.password = "Password is required";
    } else if (signUpData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!signUpData.roleId) {
      newErrors.roleId = "Role is required";
    }

    if (!signUpData.branchId) {
      newErrors.branchId = "Branch is required";
    }

    if (!signUpData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    }

    if (!signUpData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!signUpData.latitude) {
      newErrors.latitude = "Please select location on map";
    }

    if (!signUpData.longitude) {
      newErrors.longitude = "Please select location on map";
    }

    // Only validate business-specific fields when customer type is Business
    if (signUpData.customerType === "Business") {
      if (!signUpData.district.trim()) {
        newErrors.district = "District is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiAdapter.post("/users/", signUpData);
      if (response.success) {
        // Reset form
        setSignUpData({
          name: "",
          username: "",
          email: "",
          password: "",
          roleId: "",
          branchId: "",
          contactNumber: "",
          businessName: "",
          customerCode: "",
          address: "",
          district: "",
          customerType: "",
          licenseNumber: "",
          latitude: "",
          longitude: "",
        });
        setMarkerPosition(null);
        setErrors({});
        onSuccess();
        onClose();
      }
    } catch (error) {
      setErrors({
        submit: "Failed to create account. Please try again.",
      });
      console.error("Error creating account:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (location) => {
    setMarkerPosition(location);
    setSignUpData((prev) => ({
      ...prev,
      latitude: location.lng.toFixed(6),
      longitude: location.lat.toFixed(6),
    }));

    // Clear location errors
    setErrors((prev) => ({
      ...prev,
      latitude: "",
      longitude: "",
    }));
  };

  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;
    handleChange(e);

    // Update marker position if both coordinates are valid
    const updatedData = { ...signUpData, [name]: value };
    const lat = parseFloat(
      name === "longitude" ? value : updatedData.longitude,
    );
    const lng = parseFloat(name === "latitude" ? value : updatedData.latitude);

    if (!isNaN(lat) && !isNaN(lng)) {
      setMarkerPosition({ lat, lng });
      setMapCenter({ lat, lng });
    }
  };

  const handleClose = () => {
    setSignUpData({
      name: "",
      username: "",
      email: "",
      password: "",
      roleId: "",
      branchId: "",
      contactNumber: "",
      businessName: "",
      customerCode: "",
      address: "",
      district: "",
      customerType: "",
      licenseNumber: "",
      latitude: "",
      longitude: "",
    });
    setMarkerPosition(null);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Account"
      maxWidth="max-w-6xl"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Account"}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errors.submit}
          </div>
        )}

        {/* Two Column Layout: Left Side (Form Fields) and Right Side (Map) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Input Details */}
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <Input
                label="Full Name"
                name="name"
                placeholder="Enter full name"
                value={signUpData.name}
                onChange={handleChange}
                error={errors.name}
              />
            </div>

            {/* Username and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Username"
                name="username"
                placeholder="e.g. john_doe"
                value={signUpData.username}
                onChange={handleChange}
                error={errors.username}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="e.g. john@example.com"
                value={signUpData.email}
                onChange={handleChange}
                error={errors.email}
              />
            </div>

            {/* Address */}
            <div>
              <Input
                label="Address"
                name="address"
                placeholder="Enter full address"
                value={signUpData.address}
                onChange={handleChange}
                error={errors.address}
              />
            </div>

            {/* Password and Contact Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={signUpData.password}
                onChange={handleChange}
                error={errors.password}
              />
              <Input
                label="Contact Number"
                name="contactNumber"
                placeholder="e.g. 1234567890"
                value={signUpData.contactNumber}
                onChange={handleChange}
                error={errors.contactNumber}
              />
            </div>

            {/* Role and Branch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Role"
                name="roleId"
                value={signUpData.roleId}
                onChange={handleChange}
                error={errors.roleId}
                options={[
                  { value: "", label: "Select role" },
                  ...(roles
                    .filter(
                      (role) =>
                        role.roleName === "Retail Customer" ||
                        role.roleName === "Business Customer",
                    )
                    .map((role) => ({
                      value: role.id,
                      label: role.roleName,
                    })) || []),
                ]}
              />
              <Select
                label="Branch"
                name="branchId"
                value={signUpData.branchId}
                onChange={handleChange}
                error={errors.branchId}
                options={[
                  { value: "", label: "Select branch" },
                  ...(branches.map((branch) => ({
                    value: branch.id,
                    label: branch.name,
                  })) || []),
                ]}
              />
            </div>

            {/* Coordinate Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Latitude"
                name="longitude"
                type="number"
                step="any"
                placeholder="e.g. 6.032370"
                value={signUpData.longitude}
                onChange={handleCoordinateChange}
                error={errors.latitude}
              />
              <Input
                label="Longitude"
                name="latitude"
                type="number"
                step="any"
                placeholder="e.g. 80.216472"
                value={signUpData.latitude}
                onChange={handleCoordinateChange}
                error={errors.longitude}
              />
            </div>

            {/* Business-specific fields - only show when customer type is Business */}
            {signUpData.customerType === "Business" && (
              <>
                {/* Business Name and Customer Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Business Name"
                    name="businessName"
                    placeholder="e.g. ABC Company"
                    value={signUpData.businessName}
                    onChange={handleChange}
                    error={errors.businessName}
                  />
                  <Input
                    label="Customer Code"
                    name="customerCode"
                    placeholder="e.g. CUST001"
                    value={signUpData.customerCode}
                    onChange={handleChange}
                    error={errors.customerCode}
                  />
                </div>

                {/* District and License Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="District"
                    name="district"
                    placeholder="e.g. Colombo"
                    value={signUpData.district}
                    onChange={handleChange}
                    error={errors.district}
                  />
                  <Input
                    label="License Number (Optional)"
                    name="licenseNumber"
                    placeholder="e.g. LIC-12345"
                    value={signUpData.licenseNumber}
                    onChange={handleChange}
                    error={errors.licenseNumber}
                  />
                </div>
              </>
            )}
          </div>

          {/* Right Side - Location Map View */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Select Location on Map <span className="text-red-500">*</span>
            </label>

            {/* Map Component */}
            <div className="h-[500px]">
              <MapPicker
                apiKey={GOOGLE_MAPS_API_KEY}
                initialCenter={mapCenter}
                selectedLocation={markerPosition}
                onLocationSelect={handleLocationSelect}
              />
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Click on the map to set your location,
                  or enter coordinates manually in the form. You can also drag
                  the marker to adjust.
                </p>
              </div>

              {/* Location Status Messages */}
              {markerPosition && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                  <p className="text-xs text-green-800">
                    ✓ Location selected: Lat {markerPosition.lat.toFixed(6)},
                    Lng {markerPosition.lng.toFixed(6)}
                  </p>
                </div>
              )}

              {(errors.latitude || errors.longitude) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                  <p className="text-xs text-red-800">
                    {errors.latitude || errors.longitude}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
