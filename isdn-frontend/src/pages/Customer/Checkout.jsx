import { useState } from "react";
import {
  CreditCard,
  MapPin,
  Phone,
  FileText,
  ShoppingCart,
  CheckCircle,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { apiAdapter } from "../../services/apiAdapter";
import { useCart, getEffectivePrice } from "../../context/CartContext";
import { AlertModal } from "../../components/feedback/AlertModal";

export function Checkout({ onNavigate }) {
  const { cart, clearCart, getTotalItems, getCartTotal } = useCart();

  const [formData, setFormData] = useState({
    address: "",
    contactNumber: "",
    specialNotes: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    message: "",
    isSuccess: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^\d{10,11}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = "Must be 10 or 11 digits";
    }
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required";
    } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
      newErrors.cardNumber = "Must be 16 digits";
    }
    if (!formData.cardName.trim())
      newErrors.cardName = "Cardholder name is required";
    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = "Expiry date is required";
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = "Format: MM/YY";
    }
    if (!formData.cvv.trim()) {
      newErrors.cvv = "CVV is required";
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = "Must be 3 or 4 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsProcessing(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id;
      const branchId = localStorage.getItem("branchId") || "1";

      if (!userId) {
        setAlertModal({
          isOpen: true,
          message: "Please login to place an order",
          isSuccess: false,
        });
        setIsProcessing(false);
        return;
      }

      const items = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const payload = {
        userId: parseInt(userId),
        branchId: parseInt(branchId),
        items,
        address: formData.address,
        contactNumber: formData.contactNumber,
        specialNotes: formData.specialNotes || undefined,
      };

      const response = await apiAdapter.post("/orders", payload);

      if (response.success) {
        clearCart();
        setAlertModal({
          isOpen: true,
          message: "Order placed successfully!",
          isSuccess: true,
        });
      } else {
        setAlertModal({
          isOpen: true,
          message: response.message || "Failed to place order",
          isSuccess: false,
        });
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setAlertModal({
        isOpen: true,
        message: "An error occurred while placing the order",
        isSuccess: false,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAlertClose = () => {
    const wasSuccess = alertModal.isSuccess;
    setAlertModal({ isOpen: false, message: "", isSuccess: false });
    if (wasSuccess && onNavigate) {
      onNavigate("my-orders");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
          Checkout
        </h1>
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingCart className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Your cart is empty
            </h3>
            <p className="text-slate-500 mb-6">
              Add products to your cart before checking out.
            </p>
            <Button
              onClick={() => onNavigate && onNavigate("product-catalog")}
            >
              Browse Products
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
        Checkout
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shipping & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Shipping Information
              </h2>
              <div className="space-y-4">
                <Input
                  label="Delivery Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your full delivery address"
                  error={errors.address}
                />
                <Input
                  label="Contact Number"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="e.g. 0771234567"
                  icon={<Phone className="h-4 w-4" />}
                  error={errors.contactNumber}
                />
                <Input
                  label="Special Notes (Optional)"
                  name="specialNotes"
                  value={formData.specialNotes}
                  onChange={handleChange}
                  placeholder="Any special delivery instructions"
                  icon={<FileText className="h-4 w-4" />}
                />
              </div>
            </Card>

            {/* Payment (Simulation) */}
            <Card>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Payment Details
              </h2>
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-4">
                This is a simulated payment. No real charges will be made.
              </p>
              <div className="space-y-4">
                <Input
                  label="Card Number"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength={16}
                  error={errors.cardNumber}
                />
                <Input
                  label="Cardholder Name"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleChange}
                  placeholder="Name on card"
                  error={errors.cardName}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Expiry Date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    error={errors.expiryDate}
                  />
                  <Input
                    label="CVV"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    placeholder="123"
                    maxLength={4}
                    type="password"
                    error={errors.cvv}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.map((item) => {
                  const price = getEffectivePrice(item);
                  return (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-slate-600 truncate mr-2">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="font-medium text-slate-900 whitespace-nowrap">
                        ${(price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    Subtotal ({getTotalItems()} items)
                  </span>
                  <span className="font-medium">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-slate-900">Total</span>
                  <span className="text-blue-600">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isProcessing}
                leftIcon={<CheckCircle className="h-4 w-4" />}
              >
                {isProcessing ? "Processing..." : "Place Order"}
              </Button>
            </Card>
          </div>
        </div>
      </form>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={handleAlertClose}
        message={alertModal.message}
        isSuccess={alertModal.isSuccess}
      />
    </div>
  );
}
