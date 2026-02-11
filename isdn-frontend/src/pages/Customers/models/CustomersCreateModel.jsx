import { useState, useEffect } from "react";
import { Modal } from "../../../components/feedback/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { MapPicker } from "../../../components/ui/MapPicker";
import {
  GOOGLE_MAPS_API_KEY,
  DEFAULT_MAP_CENTER,
} from "../../../config/maps.config";

export function CustomersCreateModel({
  isOpen,
  onClose,
  onSubmit,
  roles,
  branches,
  currentUser,
}) {
  // Find customer roles
  const businessCustomerRole = roles.find(
    (role) => role.roleName === "Business Customer",
  );
  const retailCustomerRole = roles.find(
    (role) => role.roleName === "Retail Customer",
  );
  const currentBranch = branches.find(
    (branch) => branch.id === currentUser?.branchId,
  );
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    roleId: "",
    branchId: currentUser?.branchId || "",
    contactNumber: "",
    businessName: "",
    customerCode: "",
    address: "",
    district: "",
    customerType: "",
    assignedBranchId: currentUser?.branchId || "",
    licenseNumber: "",
    latitude: "",
    longitude: "",
  });
  const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Update branchId when it becomes available
  useEffect(() => {
    if (currentUser?.branchId) {
      setFormData((prev) => ({
        ...prev,
        branchId: currentUser?.branchId || prev.branchId,
      }));
    }
  }, [currentUser?.branchId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update formData
    setFormData((prev) => {
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

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.roleId) {
      newErrors.roleId = "Role is required";
    }

    if (!formData.branchId) {
      newErrors.branchId = "Branch is required";
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.latitude) {
      newErrors.latitude = "Please select location on map";
    }

    if (!formData.longitude) {
      newErrors.longitude = "Please select location on map";
    }

    // Only validate business-specific fields when customer type is Business
    if (formData.customerType === "Business") {
      if (!formData.district.trim()) {
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

    setSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        roleId: "",
        branchId: currentUser?.branchId || "",
        contactNumber: "",
        businessName: "",
        customerCode: "",
        address: "",
        district: "",
        customerType: "",
        assignedBranchId: currentUser?.branchId || "",
        licenseNumber: "",
        latitude: "",
        longitude: "",
      });
      setMarkerPosition(null);
      setErrors({});
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLocationSelect = (location) => {
    setMarkerPosition(location);
    setFormData((prev) => ({
      ...prev,
      latitude: location.lng.toFixed(6),
      longitude: location.lat.toFixed(6),
    }));

    setErrors((prev) => ({
      ...prev,
      latitude: "",
      longitude: "",
    }));
  };

  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;
    handleChange(e);

    const updatedData = { ...formData, [name]: value };
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
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      roleId: "",
      branchId: currentUser?.branchId || "",
      contactNumber: "",
      businessName: "",
      customerCode: "",
      address: "",
      district: "",
      customerType: "",
      assignedBranchId: currentUser?.branchId || "",
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
      title="Create New Customer"
      maxWidth="max-w-2xl"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Creating..." : "Create Customer"}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Full Name */}
        <div>
          <Input
            label="Full Name"
            name="name"
            placeholder="Enter full name"
            value={formData.name}
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
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="e.g. john@example.com"
            value={formData.email}
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
            value={formData.address}
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
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
          <Input
            label="Contact Number"
            name="contactNumber"
            placeholder="e.g. 1234567890"
            value={formData.contactNumber}
            onChange={handleChange}
            error={errors.contactNumber}
          />
        </div>

        {/* Role and Branch - Read Only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Role"
            name="roleId"
            value={formData.roleId}
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
          <Input
            label="Branch"
            name="branchId"
            value={currentBranch?.name || ""}
            disabled
            placeholder="Branch"
          />
        </div>

        {/* Location Selection with Google Map */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Location on Map <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {/* Map Component */}
            <MapPicker
              apiKey={GOOGLE_MAPS_API_KEY}
              initialCenter={mapCenter}
              selectedLocation={markerPosition}
              onLocationSelect={handleLocationSelect}
            />

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Click on the map above to set customer
                location, or enter coordinates manually below. You can also drag
                the marker to adjust.
              </p>
            </div>

            {/* Coordinate Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Latitude"
                name="longitude"
                type="number"
                step="any"
                placeholder="e.g. 6.032370"
                value={formData.longitude}
                onChange={handleCoordinateChange}
                error={errors.latitude}
              />
              <Input
                label="Longitude"
                name="latitude"
                type="number"
                step="any"
                placeholder="e.g. 80.216472"
                value={formData.latitude}
                onChange={handleCoordinateChange}
                error={errors.longitude}
              />
            </div>

            {markerPosition && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-800">
                  ✓ Location selected: Lat {markerPosition.lat.toFixed(6)}, Lng{" "}
                  {markerPosition.lng.toFixed(6)}
                </p>
              </div>
            )}

            {(errors.latitude || errors.longitude) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-800">
                  {errors.latitude || errors.longitude}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Business-specific fields - only show when customer type is Business */}
        {formData.customerType === "Business" && (
          <>
            {/* Business Name and Customer Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Business Name"
                name="businessName"
                placeholder="e.g. ABC Company"
                value={formData.businessName}
                onChange={handleChange}
                error={errors.businessName}
              />
              <Input
                label="Customer Code"
                name="customerCode"
                placeholder="e.g. CUST001"
                value={formData.customerCode}
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
                value={formData.district}
                onChange={handleChange}
                error={errors.district}
              />
              <Input
                label="License Number (Optional)"
                name="licenseNumber"
                placeholder="e.g. LIC-12345"
                value={formData.licenseNumber}
                onChange={handleChange}
                error={errors.licenseNumber}
              />
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
