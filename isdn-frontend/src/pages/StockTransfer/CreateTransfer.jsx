import { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { apiAdapter } from "../../services/apiAdapter";
import { useToast } from "../../context/ToastContext";

export function CreateTransfer() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    fromBranchId: "",
    toBranchId: "",
    quantity: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProducts();
    fetchBranches();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiAdapter.get("/products");
      if (response.success) {
        setProducts(response.data || []);
      }
    } catch (error) {
      addToast("Failed to fetch products", "error");
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await apiAdapter.get("/branches");
      if (response.success) {
        setBranches(response.data || []);
      }
    } catch (error) {
      addToast("Failed to fetch branches", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.productId) newErrors.productId = "Product is required";
    if (!formData.fromBranchId)
      newErrors.fromBranchId = "Source branch is required";
    if (!formData.toBranchId)
      newErrors.toBranchId = "Destination branch is required";
    if (!formData.quantity || parseInt(formData.quantity, 10) <= 0)
      newErrors.quantity = "Quantity must be greater than zero";
    if (formData.fromBranchId && formData.fromBranchId === formData.toBranchId)
      newErrors.toBranchId =
        "Destination branch must be different from source branch";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await apiAdapter.post("/stock-transfers/request", {
        productId: formData.productId,
        fromBranchId: formData.fromBranchId,
        toBranchId: formData.toBranchId,
        quantity: parseInt(formData.quantity, 10),
        notes: formData.notes || undefined,
      });

      if (response.success) {
        addToast("Stock transfer request created successfully!", "success");
        setFormData({
          productId: "",
          fromBranchId: "",
          toBranchId: "",
          quantity: "",
          notes: "",
        });
        setErrors({});
      } else {
        addToast(response.message || "Failed to create transfer request", "error");
      }
    } catch (error) {
      addToast("An error occurred while creating the transfer request", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Create Stock Transfer
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Submit a new stock transfer request between branches.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Product"
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              error={errors.productId}
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.productCode})
                </option>
              ))}
            </Select>

            <Input
              label="Quantity"
              name="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Enter quantity"
              error={errors.quantity}
            />

            <Select
              label="Source Branch (From)"
              name="fromBranchId"
              value={formData.fromBranchId}
              onChange={handleChange}
              error={errors.fromBranchId}
            >
              <option value="">Select source branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} ({branch.code})
                </option>
              ))}
            </Select>

            <Select
              label="Destination Branch (To)"
              name="toBranchId"
              value={formData.toBranchId}
              onChange={handleChange}
              error={errors.toBranchId}
            >
              <option value="">Select destination branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} ({branch.code})
                </option>
              ))}
            </Select>
          </div>

          <Input
            label="Notes (Optional)"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add any notes for this transfer..."
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={loading}>
              Submit Transfer Request
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
