import React, { useState } from "react";
import { Modal } from "../../../components/feedback/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";

export function UserCreateModel({
  isOpen,
  onClose,
  onSubmit,
  roles,
  branches,
}) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    roleId: "",
    branchId: "",
    contactNumber: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        branchId: "",
        contactNumber: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      roleId: "",
      branchId: "",
      contactNumber: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New User"
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
            {submitting ? "Creating..." : "Create User"}
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

        {/* Role and Branch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Role"
            name="roleId"
            value={formData.roleId}
            onChange={handleChange}
            options={[
              { value: "", label: "Select a role" },
              ...roles
                .filter((role) =>
                  [
                    "RDC Staff",
                    "Logistics Officer",
                    "Head Office Manager",
                  ].includes(role.roleName),
                )
                .map((role) => ({
                  value: role.id,
                  label: role.roleName,
                })),
            ]}
            error={errors.roleId}
          />
          <Select
            label="Branch"
            name="branchId"
            value={formData.branchId}
            onChange={handleChange}
            options={[
              { value: "", label: "Select a branch" },
              ...branches.map((branch) => ({
                value: branch.id,
                label: branch.name,
              })),
            ]}
            error={errors.branchId}
          />
        </div>
      </form>
    </Modal>
  );
}
