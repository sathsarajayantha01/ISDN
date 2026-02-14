import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Package,
  AlertCircle,
  Filter,
  X,
  Plus,
  Minus,
  Search,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { apiAdapter } from "../../services/apiAdapter";
import { AlertModal } from "../../components/feedback/AlertModal";
import { useCart, getEffectivePrice } from "../../context/CartContext";

export function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    message: "",
    isSuccess: false,
  });

  const { cart, addToCart, getCartItemCount, getTotalItems, getCartTotal } =
    useCart();

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter and sort products when dependencies change
  useEffect(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.productCode.toLowerCase().includes(q) ||
          (p.category?.name || "").toLowerCase().includes(q),
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    // Sort
    if (sortOrder === "price-asc") {
      result.sort((a, b) => a.unitPrice - b.unitPrice);
    } else if (sortOrder === "price-desc") {
      result.sort((a, b) => b.unitPrice - a.unitPrice);
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, sortOrder, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const branchId = localStorage.getItem("branchId") || "1";
      const response = await apiAdapter.get("/products", { branchId });

      if (response.success) {
        setProducts(response.data);
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

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1;
    const maxQuantity = product.inventories?.[0]?.quantity || 0;

    if (quantity > maxQuantity) {
      setAlertModal({
        isOpen: true,
        message: "Not enough stock available",
        isSuccess: false,
      });
      return;
    }

    setAddingToCart(product.id);
    setTimeout(() => {
      addToCart(product, quantity);
      setQuantities({ ...quantities, [product.id]: 1 });
      setAddingToCart(null);
      setAlertModal({
        isOpen: true,
        message: `${product.name} added to cart`,
        isSuccess: true,
      });
    }, 200);
  };

  const getProductImage = (product) => {
    if (product.imageUrl) {
      return `http://localhost:3100${product.imageUrl}`;
    }
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23e2e8f0' width='300' height='300'/%3E%3Ctext fill='%2394a3b8' font-family='Arial' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
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
        {/* Header */}
        <div className="flex-shrink-0 p-4 sm:p-6 bg-slate-50 border-b border-slate-200">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Product Catalog
                </h1>
                <p className="text-slate-600 mt-1">
                  {filteredProducts.length} products available
                </p>
              </div>

              {/* Cart Summary */}
              {cart.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        {getTotalItems()} items in cart
                      </p>
                      <p className="text-xs text-blue-700">
                        Total: ${getCartTotal().toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Search + Filters */}
          <Card className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <Filter className="inline h-4 w-4 mr-1" />
                  Category
                </label>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
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

              {/* Clear */}
              {(selectedCategory !== "all" ||
                sortOrder !== "default" ||
                searchQuery) && (
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory("all");
                      setSortOrder("default");
                      setSearchQuery("");
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

        {/* Product Grid */}
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
                const discountedPrice = getEffectivePrice(product);
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
                          if (!e.target.src.startsWith("data:image")) {
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23e2e8f0' width='300' height='300'/%3E%3Ctext fill='%2394a3b8' font-family='Arial' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }
                        }}
                      />
                      {hasDiscount && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          {product.promotion.discountPercent}% OFF
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-teal-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        {availableStock > 0 ? "In Stock" : "Out of Stock"}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <div className="text-xs font-medium text-teal-500 mb-1">
                        {product.category?.name || "Uncategorized"}
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
                        {product.name}
                      </h3>
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

                      {/* Quantity + Add to Cart */}
                      <div className="space-y-2">
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
                          className="w-full"
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

                        {cartQuantity > 0 && (
                          <div className="text-center text-sm text-green-600 font-medium">
                            {cartQuantity} in cart
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

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() =>
          setAlertModal({ isOpen: false, message: "", isSuccess: false })
        }
        message={alertModal.message}
        isSuccess={alertModal.isSuccess}
      />
    </>
  );
}
