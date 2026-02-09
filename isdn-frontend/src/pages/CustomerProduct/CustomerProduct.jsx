import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Package,
  AlertCircle,
  Filter,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { CartDrawer } from "../../components/cart/CartDrawer";
import { PaymentModal } from "../../components/cart/PaymentModal";
import { apiAdapter } from "../../services/apiAdapter";
import { useToast } from "../../hooks/useToast";

export function CustomerProduct() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [addingToCart, setAddingToCart] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [quantities, setQuantities] = useState({});
  const { addToast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("customerCart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("customerCart", JSON.stringify(cart));
  }, [cart]);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter and sort products when dependencies change
  useEffect(() => {
    let result = [...products];

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (product) => product.categoryId === selectedCategory,
      );
    }

    // Apply sorting
    if (sortOrder === "price-asc") {
      result.sort((a, b) => a.unitPrice - b.unitPrice);
    } else if (sortOrder === "price-desc") {
      result.sort((a, b) => b.unitPrice - a.unitPrice);
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, sortOrder]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get branchId from localStorage or use default
      const branchId = localStorage.getItem("branchId") || "1";

      const response = await apiAdapter.get("/products", { branchId });

      if (response.success) {
        setProducts(response.data);

        // Extract unique categories
        const uniqueCategories = response.data.reduce((acc, product) => {
          if (
            product.category &&
            !acc.find((cat) => cat.id === product.category.id)
          ) {
            acc.push(product.category);
          }
          return acc;
        }, []);
        setCategories(uniqueCategories);
      } else {
        setError(response.message || "Failed to fetch products");
      }
    } catch (err) {
      setError("An error occurred while fetching products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    const quantity = quantities[product.id] || 1;
    const maxQuantity = product.inventories?.[0]?.quantity || 0;

    if (quantity > maxQuantity) {
      addToast("error", "Not enough stock available");
      return;
    }

    setAddingToCart(product.id);

    // Simulate adding to cart
    setTimeout(() => {
      const existingItem = cart.find((item) => item.id === product.id);

      if (existingItem) {
        setCart(
          cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          ),
        );
        addToast("success", `Added ${quantity} more to cart`);
      } else {
        setCart([...cart, { ...product, quantity }]);
        addToast("success", `${product.name} added to cart`);
      }

      // Reset quantity selector for this product
      setQuantities({ ...quantities, [product.id]: 1 });
      setAddingToCart(null);
    }, 300);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    const product = products.find((p) => p.id === productId);
    const maxQuantity = product?.inventories?.[0]?.quantity || 99;

    if (newQuantity > maxQuantity) {
      addToast("error", "Not enough stock available");
      return;
    }

    if (newQuantity < 1) {
      return;
    }

    setCart(
      cart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
    addToast("info", "Item removed from cart");
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmOrder = async (orderData) => {
    try {
      // Get user info from localStorage
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userId = userInfo.id || 2;
      const branchId = localStorage.getItem("branchId") || "1";
      const token = localStorage.getItem("token");

      if (!token) {
        addToast("error", "Please login to place an order");
        return;
      }

      // Prepare order items
      const items = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      // Prepare order payload
      const orderPayload = {
        userId: parseInt(userId),
        branchId: parseInt(branchId),
        items,
        address: orderData.address,
        contactNumber: orderData.contactNumber,
        specialNotes: orderData.specialNotes,
      };

      // Call order API
      const response = await apiAdapter.post("/orders", orderPayload);

      if (response.success) {
        addToast("success", "Order placed successfully!");
        // Clear cart
        setCart([]);
        localStorage.removeItem("customerCart");
        setIsPaymentModalOpen(false);
      } else {
        addToast("error", response.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      addToast("error", "An error occurred while creating the order");
    }
  };

  const getCartItemCount = (productId) => {
    const item = cart.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const calculateDiscountedPrice = (product) => {
    if (product.promotion && product.promotion.active) {
      const discount = product.promotion.discountPercent || 0;
      return product.unitPrice * (1 - discount / 100);
    }
    return product.unitPrice;
  };

  const getProductImage = (product) => {
    if (product.imageUrl) {
      return `http://localhost:3100${product.imageUrl}`;
    }
    // Return a data URI placeholder to avoid external requests
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23e2e8f0' width='300' height='300'/%3E%3Ctext fill='%2394a3b8' font-family='Arial' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Error Loading Products</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
          <Button onClick={fetchProducts} className="mt-4" size="sm">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div
        className="flex flex-col bg-slate-50"
        style={{ height: "calc(100vh - 4rem)" }}
      >
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 p-4 sm:p-6 bg-slate-50 border-b border-slate-200">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Browse Products
                </h1>
                <p className="text-slate-600 mt-1">
                  {filteredProducts.length} products available
                </p>
              </div>

              {/* Cart Summary */}
              {cart.length > 0 && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <Card className="bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          {getTotalCartItems()} items in cart
                        </p>
                        <p className="text-xs text-blue-700">
                          Total: $
                          {cart
                            .reduce(
                              (sum, item) =>
                                sum +
                                calculateDiscountedPrice(item) * item.quantity,
                              0,
                            )
                            .toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </button>
              )}
            </div>
          </div>

          {/* Filters and Sorting */}
          <Card className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Filter className="inline h-4 w-4 mr-1" />
                  Filter by Category
                </label>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Price Sorting */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sort by Price
                </label>
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="default">Default Order</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </Select>
              </div>

              {/* Clear Filters */}
              {(selectedCategory !== "all" || sortOrder !== "default") && (
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory("all");
                      setSortOrder("default");
                    }}
                    leftIcon={<X className="h-4 w-4" />}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Scrollable Products Section */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 min-h-0">
          {filteredProducts.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  No Products Found
                </h3>
                <p className="text-slate-500">
                  Try adjusting your filters to see more products.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => {
                const discountedPrice = calculateDiscountedPrice(product);
                const hasDiscount =
                  product.promotion &&
                  product.promotion.active &&
                  product.promotion.discountPercent > 0;
                const cartQuantity = getCartItemCount(product.id);
                const inventory = product.inventories?.[0];
                const availableStock = inventory?.quantity || 0;

                return (
                  <Card
                    key={product.id}
                    className="hover:shadow-lg transition-shadow duration-200"
                    noPadding
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square bg-slate-100 overflow-hidden">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Prevent infinite loop by checking if already using fallback
                          if (!e.target.src.startsWith("data:image")) {
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23e2e8f0' width='300' height='300'/%3E%3Ctext fill='%2394a3b8' font-family='Arial' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }
                        }}
                      />

                      {/* Discount Badge */}
                      {hasDiscount && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          {product.promotion.discountPercent}% OFF
                        </div>
                      )}

                      {/* Stock Badge */}
                      <div className="absolute top-2 left-2 bg-teal-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        {availableStock > 0 ? "In Stock" : "Out of Stock"}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-4">
                      {/* Category */}
                      <div className="text-xs font-medium text-teal-500 mb-1">
                        {product.category?.name || "Uncategorized"}
                      </div>

                      {/* Product Name */}
                      <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
                        {product.name}
                      </h3>

                      {/* Product Code */}
                      <p className="text-xs text-slate-500 mb-2">
                        Code: {product.productCode}
                      </p>

                      {/* Price */}
                      <div className="mb-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-slate-900">
                            ${discountedPrice.toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-500">
                            / {product.unitType}
                          </span>
                        </div>
                        {hasDiscount && (
                          <span className="text-sm text-slate-500 line-through">
                            ${product.unitPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Add to Cart Section */}
                      <div className="space-y-2">
                        {/* Quantity Selector */}
                        {availableStock > 0 && (
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <button
                              onClick={() =>
                                setQuantities({
                                  ...quantities,
                                  [product.id]: Math.max(
                                    1,
                                    (quantities[product.id] || 1) - 1,
                                  ),
                                })
                              }
                              className="p-1.5 hover:bg-slate-200 rounded transition-colors disabled:opacity-50"
                              disabled={(quantities[product.id] || 1) <= 1}
                            >
                              <Minus className="h-4 w-4 text-slate-600" />
                            </button>
                            <Input
                              type="number"
                              min="1"
                              max={availableStock}
                              value={quantities[product.id] || 1}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 1;
                                setQuantities({
                                  ...quantities,
                                  [product.id]: Math.min(
                                    availableStock,
                                    Math.max(1, value),
                                  ),
                                });
                              }}
                              className="w-16 text-center px-2 py-1 text-sm"
                            />
                            <button
                              onClick={() =>
                                setQuantities({
                                  ...quantities,
                                  [product.id]: Math.min(
                                    availableStock,
                                    (quantities[product.id] || 1) + 1,
                                  ),
                                })
                              }
                              className="p-1.5 hover:bg-slate-200 rounded transition-colors disabled:opacity-50"
                              disabled={
                                (quantities[product.id] || 1) >= availableStock
                              }
                            >
                              <Plus className="h-4 w-4 text-slate-600" />
                            </button>
                          </div>
                        )}

                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={
                            availableStock === 0 || addingToCart === product.id
                          }
                          isLoading={addingToCart === product.id}
                          className="w-full "
                          size="sm"
                          leftIcon={
                            !addingToCart && (
                              <ShoppingCart className="h-4 w-4" />
                            )
                          }
                        >
                          {availableStock === 0
                            ? "Out of Stock"
                            : addingToCart === product.id
                              ? "Adding..."
                              : "Add to Cart"}
                        </Button>

                        {/* Cart Item Counter */}
                        {cartQuantity > 0 && (
                          <div className="text-center text-sm text-green-600 font-medium">
                            ✓ {cartQuantity} in cart
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        cart={cart}
        onConfirmOrder={handleConfirmOrder}
      />
    </>
  );
}
