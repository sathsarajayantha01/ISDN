import { useState } from "react";
import { X, CreditCard, Calendar, Lock, MapPin, Clock } from "lucide-react";
import { Modal } from "../feedback/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";

export function PaymentModal({ isOpen, onClose, cart, onConfirmOrder }) {
  const [formData, setFormData] = useState({
    address: "",
    contactNumber: "",
    specialNotes: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const calculateDiscountedPrice = (item) => {
    if (item.promotion && item.promotion.active) {
      const discount = item.promotion.discountPercent || 0;
      return item.unitPrice * (1 - discount / 100);
    }
    return item.unitPrice;
  };

  const getCartTotal = () => {
    return cart.reduce(
      (sum, item) => sum + calculateDiscountedPrice(item) * item.quantity,
      0,
    );
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate address
    if (!formData.address) {
      newErrors.address = "Address is required";
    }

    // Validate contact number
    if (!formData.contactNumber) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^\d{10,11}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = "Contact number must be 10 or 11 digits";
    }

    // Validate card number (basic validation)
    if (!formData.cardNumber) {
      newErrors.cardNumber = "Card number is required";
    } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }

    // Validate card name
    if (!formData.cardName) {
      newErrors.cardName = "Cardholder name is required";
    }

    // Validate expiry date
    if (!formData.expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = "Format: MM/YY";
    }

    // Validate CVV
    if (!formData.cvv) {
      newErrors.cvv = "CVV is required";
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = "CVV must be 3 or 4 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Format card number with spaces
    if (name === "cardNumber") {
      const formatted = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim();
      setFormData({ ...formData, [name]: formatted });
    }
    // Format expiry date
    else if (name === "expiryDate") {
      let formatted = value.replace(/\D/g, "");
      if (formatted.length >= 2) {
        formatted = formatted.slice(0, 2) + "/" + formatted.slice(2, 4);
      }
      setFormData({ ...formData, [name]: formatted });
    }
    // Format CVV (numbers only)
    else if (name === "cvv") {
      const formatted = value.replace(/\D/g, "").slice(0, 4);
      setFormData({ ...formData, [name]: formatted });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    // Format delivery date
    const deliveryDateTime = new Date();

    try {
      await onConfirmOrder({
        address: formData.address,
        contactNumber: formData.contactNumber,
        deliveryDate: deliveryDateTime,
        specialNotes: formData.specialNotes || "None",
        paymentInfo: {
          cardNumber: formData.cardNumber,
          cardName: formData.cardName,
          expiryDate: formData.expiryDate,
          address: formData.address,
          contactNumber: formData.contactNumber,
        },
      });
    } catch (error) {
      console.error("Order submission error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Checkout</h2>
            <p className="text-sm text-slate-600 mt-1">Complete your order</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Order Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900 mb-3">Order Summary</h3>
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-slate-700">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium text-slate-900">
                  ${(calculateDiscountedPrice(item) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="pt-3 border-t border-blue-300 flex justify-between items-center">
              <span className="font-bold text-slate-900">
                Total ({getTotalItems()} items):
              </span>
              <span className="text-2xl font-bold text-blue-600">
                ${getCartTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </Card>

        {/* Delivery Information */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Delivery Information
          </h3>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows="2"
              placeholder="123 Main St, City, State, ZIP"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                errors.address ? "border-red-500" : "border-slate-300"
              }`}
            />
            {errors.address && (
              <p className="text-xs text-red-600 mt-1">{errors.address}</p>
            )}
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contact Number *
            </label>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              placeholder="1234567890"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                errors.contactNumber ? "border-red-500" : "border-slate-300"
              }`}
            />
            {errors.contactNumber && (
              <p className="text-xs text-red-600 mt-1">
                {errors.contactNumber}
              </p>
            )}
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Special Notes (Optional)
            </label>
            <textarea
              name="specialNotes"
              value={formData.specialNotes}
              onChange={handleInputChange}
              rows="2"
              placeholder="Any special delivery instructions..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Payment Information */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Payment Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Card Number *
              </label>
              <Input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                className={errors.cardNumber ? "border-red-500" : ""}
              />
              {errors.cardNumber && (
                <p className="text-xs text-red-600 mt-1">{errors.cardNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cardholder Name *
              </label>
              <Input
                type="text"
                name="cardName"
                value={formData.cardName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className={errors.cardName ? "border-red-500" : ""}
              />
              {errors.cardName && (
                <p className="text-xs text-red-600 mt-1">{errors.cardName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Expiry Date *
                </label>
                <Input
                  type="text"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  maxLength="5"
                  className={errors.expiryDate ? "border-red-500" : ""}
                />
                {errors.expiryDate && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.expiryDate}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <Lock className="inline h-3 w-3 mr-1" />
                  CVV *
                </label>
                <Input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  maxLength="4"
                  className={errors.cvv ? "border-red-500" : ""}
                />
                {errors.cvv && (
                  <p className="text-xs text-red-600 mt-1">{errors.cvv}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <Card className="bg-slate-50 border-slate-200">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">
                Secure Payment
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Your payment information is encrypted and secure. We never store
                your full card details.
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isProcessing}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing
              ? "Processing..."
              : `Pay $${getCartTotal().toFixed(2)}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
