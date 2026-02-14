import { useState } from "react";
import {
  ShoppingCart as ShoppingCartIcon,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Package,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useCart, getEffectivePrice } from "../../context/CartContext";
import { AlertModal } from "../../components/feedback/AlertModal";

export function ShoppingCart({ onNavigate }) {
  const { cart, updateQuantity, removeFromCart, getTotalItems, getCartTotal } =
    useCart();

  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    message: "",
    isSuccess: false,
  });

  const getProductImage = (product) => {
    if (product.imageUrl) {
      return `http://localhost:3100${product.imageUrl}`;
    }
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e2e8f0' width='100' height='100'/%3E%3Ctext fill='%2394a3b8' font-family='Arial' font-size='12' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
  };

  const handleRemove = (productId, productName) => {
    removeFromCart(productId);
    setAlertModal({
      isOpen: true,
      message: `${productName} removed from cart`,
      isSuccess: true,
    });
  };

  if (cart.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
          Shopping Cart
        </h1>
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingCartIcon className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Your cart is empty
            </h3>
            <p className="text-slate-500 mb-6">
              Browse our product catalog and add items to get started.
            </p>
            <Button
              onClick={() => onNavigate && onNavigate("product-catalog")}
              leftIcon={<Package className="h-4 w-4" />}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Shopping Cart
          </h1>
          <p className="text-slate-600 mt-1">
            {getTotalItems()} items in your cart
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const discountedPrice = getEffectivePrice(item);
            const hasDiscount =
              item.promotion &&
              item.promotion.active &&
              item.promotion.discountPercent > 0;
            const maxQuantity = item.inventories?.[0]?.quantity || 99;

            return (
              <Card key={item.id}>
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={getProductImage(item)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        if (!e.target.src.startsWith("data:image")) {
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e2e8f0' width='100' height='100'/%3E%3Ctext fill='%2394a3b8' font-family='Arial' font-size='12' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {item.category?.name} &middot; {item.productCode}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id, item.name)}
                        className="p-1.5 hover:bg-red-100 rounded transition-colors"
                        title="Remove from cart"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-lg font-bold text-slate-900">
                        ${discountedPrice.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-slate-500 line-through">
                          ${item.unitPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-xs text-slate-500">
                        / {item.unitType}
                      </span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1),
                            )
                          }
                          className="p-1.5 hover:bg-slate-200 rounded transition-colors border border-slate-200"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4 text-slate-600" />
                        </button>
                        <span className="text-sm font-medium text-slate-900 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.min(maxQuantity, item.quantity + 1),
                            )
                          }
                          className="p-1.5 hover:bg-slate-200 rounded transition-colors border border-slate-200"
                          disabled={item.quantity >= maxQuantity}
                        >
                          <Plus className="h-4 w-4 text-slate-600" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-slate-900">
                        Subtotal: $
                        {(discountedPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">
                  Items ({getTotalItems()})
                </span>
                <span className="font-medium text-slate-900">
                  ${getCartTotal().toFixed(2)}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between">
                <span className="text-lg font-bold text-slate-900">Total</span>
                <span className="text-lg font-bold text-blue-600">
                  ${getCartTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              onClick={() => onNavigate && onNavigate("checkout")}
              className="w-full"
              size="lg"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Proceed to Checkout
            </Button>
          </Card>
        </div>
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() =>
          setAlertModal({ isOpen: false, message: "", isSuccess: false })
        }
        message={alertModal.message}
        isSuccess={alertModal.isSuccess}
      />
    </div>
  );
}
