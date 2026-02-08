import { useState, useEffect } from "react";
import { Modal } from "../../../components/feedback/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { apiAdapter } from "../../../services/apiAdapter";

export function ProductCreateModel({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    productCode: "",
    name: "",
    categoryId: "",
    unitPrice: "",
    unitType: "pcs",
    promotionId: "",
    description: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchPromotions();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await apiAdapter.get("/product-categories");
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await apiAdapter.get("/promotions");
      if (response.success && response.data) {
        setPromotions(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch promotions:", error);
    }
  };

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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    // Clear error for image field
    if (errors.image) {
      setErrors((prev) => ({
        ...prev,
        image: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.productCode.trim()) {
      newErrors.productCode = "Product code is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    if (!formData.unitPrice || formData.unitPrice <= 0) {
      newErrors.unitPrice = "Valid unit price is required";
    }

    if (!formData.unitType.trim()) {
      newErrors.unitType = "Unit type is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
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
      const submitFormData = new FormData();
      submitFormData.append("productCode", formData.productCode);
      submitFormData.append("name", formData.name);
      submitFormData.append("categoryId", formData.categoryId);
      submitFormData.append("unitPrice", formData.unitPrice);
      submitFormData.append("unitType", formData.unitType);
      submitFormData.append("description", formData.description);

      if (formData.promotionId) {
        submitFormData.append("promotionId", formData.promotionId);
      }

      // Append image files
      selectedFiles.forEach((file) => {
        submitFormData.append("image", file);
      });

      await onSubmit(submitFormData);

      // Reset form on success
      setFormData({
        productCode: "",
        name: "",
        categoryId: "",
        unitPrice: "",
        unitType: "pcs",
        promotionId: "",
        description: "",
      });
      setSelectedFiles([]);
      setErrors({});
    } catch (error) {
      console.error("Error creating product:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      productCode: "",
      name: "",
      categoryId: "",
      unitPrice: "",
      unitType: "pcs",
      promotionId: "",
      description: "",
    });
    setSelectedFiles([]);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Product"
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
            {submitting ? "Creating..." : "Create Product"}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Product Code */}
        <div>
          <Input
            label="Product Code"
            name="productCode"
            placeholder="Enter product code"
            value={formData.productCode}
            onChange={handleChange}
            error={errors.productCode}
          />
        </div>

        {/* Name */}
        <div>
          <Input
            label="Name"
            name="name"
            placeholder="Enter product name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
          />
        </div>

        {/* Category */}
        <div>
          <Select
            label="Category"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            error={errors.categoryId}
            disabled={loading}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Unit Price */}
        <div>
          <Input
            label="Unit Price"
            name="unitPrice"
            type="number"
            step="0.01"
            placeholder="Enter unit price"
            value={formData.unitPrice}
            onChange={handleChange}
            error={errors.unitPrice}
          />
        </div>

        {/* Unit Type */}
        <div>
          <Select
            label="Unit Type"
            name="unitType"
            value={formData.unitType}
            onChange={handleChange}
            error={errors.unitType}
          >
            <option value="pcs">Pieces (pcs)</option>
            <option value="kg">Kilogram (kg)</option>
            <option value="ltr">Liter (ltr)</option>
            <option value="box">Box</option>
            <option value="pack">Pack</option>
          </Select>
        </div>

        {/* Promotion (Optional) */}
        <div>
          <Select
            label="Promotion (Optional)"
            name="promotionId"
            value={formData.promotionId}
            onChange={handleChange}
          >
            <option value="">No promotion</option>
            {promotions.map((promotion) => (
              <option key={promotion.id} value={promotion.id}>
                {promotion.title} ({promotion.discountPercent}% off)
              </option>
            ))}
          </Select>
        </div>

        {/* Description */}
        <div>
          <Input
            label="Description"
            name="description"
            placeholder="Enter description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
          />
        </div>

        {/* Product Images */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Product Images
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {selectedFiles.length > 0 && (
            <p className="mt-2 text-sm text-slate-600">
              {selectedFiles.length} file(s) selected
            </p>
          )}
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image}</p>
          )}
        </div>
      </form>
    </Modal>
  );
}
