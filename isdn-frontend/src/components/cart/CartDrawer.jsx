import { X, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) {
  const calculateDiscountedPrice = (item) => {
    if (item.promotion && item.promotion.active) {
      const discount = item.promotion.discountPercent || 0;
      return item.unitPrice * (1 - discount / 100);
    }
    return item.unitPrice;
  };

  const getItemTotal = (item) => {
    return calculateDiscountedPrice(item) * item.quantity;
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + getItemTotal(item), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getProductImage = (product) => {
    if (product.imageUrl) {
      return `http://localhost:3100${product.imageUrl}`;
    }
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e2e8f0' width='100' height='100'/%3E%3Ctext fill='%2394a3b8' font-family='Arial' font-size='12' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Your Cart</h2>
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
              {getTotalItems()} items
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Your cart is empty
              </h3>
              <p className="text-slate-500 text-sm">
                Add some products to get started!
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const discountedPrice = calculateDiscountedPrice(item);
              const hasDiscount =
                item.promotion &&
                item.promotion.active &&
                item.promotion.discountPercent > 0;
              const maxQuantity = item.inventories?.[0]?.quantity || 99;

              return (
                <Card key={item.id} className="p-3">
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
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

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 text-sm truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-500 mb-1">
                        {item.category?.name}
                      </p>

                      {/* Price */}
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-lg font-bold text-slate-900">
                          ${discountedPrice.toFixed(2)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-slate-500 line-through">
                            ${item.unitPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              onUpdateQuantity(
                                item.id,
                                Math.max(1, item.quantity - 1),
                              )
                            }
                            className="p-1 hover:bg-slate-200 rounded transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4 text-slate-600" />
                          </button>
                          <span className="text-sm font-medium text-slate-900 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              onUpdateQuantity(
                                item.id,
                                Math.min(maxQuantity, item.quantity + 1),
                              )
                            }
                            className="p-1 hover:bg-slate-200 rounded transition-colors"
                            disabled={item.quantity >= maxQuantity}
                          >
                            <Plus className="h-4 w-4 text-slate-600" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1.5 hover:bg-red-100 rounded transition-colors"
                          title="Remove from cart"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="mt-2 text-right">
                        <span className="text-xs text-slate-500">
                          Subtotal:{" "}
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          ${getItemTotal(item).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Footer with Total and Checkout */}
        {cart.length > 0 && (
          <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-3">
            {/* Total */}
            <div className="flex items-center justify-between text-lg font-bold">
              <span className="text-slate-700">Total:</span>
              <span className="text-blue-600">
                ${getCartTotal().toFixed(2)}
              </span>
            </div>

            {/* Checkout Button */}
            <Button onClick={onCheckout} className="w-full" size="lg">
              Proceed to Checkout
            </Button>

            <button
              onClick={onClose}
              className="w-full text-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
