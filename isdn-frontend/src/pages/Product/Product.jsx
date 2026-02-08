import { useState, useEffect } from "react";
import { DataTable } from "../../components/data/DataTable";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Plus, Search, Image } from "lucide-react";
import { apiAdapter } from "../../services/apiAdapter";
import { ProductCreateModel } from "./models/ProductCreateModel";
import { ProductUpdateModel } from "./models/ProductUpdateModel";
import { ProductImagesModal } from "./models/ProductImagesModal";

export function Product() {
  const [product, setProduct] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredProduct = product.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const columns = [
    {
      key: "productCode",
      header: "Product Code",
      sortable: true,
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (categoryValue, item) => item.category?.name || "-",
    },
    {
      key: "unitPrice",
      header: "Unit Price",
      sortable: true,
      render: (priceValue) => `$${priceValue}`,
    },
    {
      key: "unitType",
      header: "Unit Type",
      sortable: true,
    },
    {
      key: "promotion",
      header: "Promotion",
      sortable: true,
      render: (promotionValue, item) => item.promotion?.title || "-",
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
    },
  ];

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser !== null) {
      fetchProduct();
    }
  }, [currentUser]);

  const fetchCurrentUser = async () => {
    const userStr = localStorage.getItem("user");
    const storedUser = userStr ? JSON.parse(userStr) : null;

    if (storedUser) {
      setCurrentUser({
        branchId: storedUser.branch?.id || null,
      });
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    console.log("Get Products");
    try {
      const response = await apiAdapter.get("/products");
      if (response.success && response.data) {
        setProduct(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (productData) => {
    try {
      const response = await apiAdapter.post("/products/", productData);
      if (response.success) {
        setIsCreateModalOpen(false);
        fetchProduct();
      }
    } catch (error) {
      console.error("Failed to create product:", error);
      throw error;
    }
  };

  const handleUpdateProduct = async (productId, productData) => {
    try {
      const response = await apiAdapter.put(
        `/products/${productId}`,
        productData,
      );
      if (response.success) {
        setIsUpdateModalOpen(false);
        setSelectedProduct(null);
        fetchProduct();
      }
    } catch (error) {
      console.error("Failed to update product:", error);
      throw error;
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsUpdateModalOpen(true);
  };

  const handleViewImages = (product) => {
    setSelectedProduct(product);
    setIsImagesModalOpen(true);
  };

  const handleDeleteProduct = async (product) => {
    if (confirm(`Are you sure you want to delete product ${product.name}?`)) {
      try {
        const response = await apiAdapter.delete(`/products/${product.id}`);
        if (response.success) {
          fetchProduct();
        }
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Products
          </h1>
          <p className="text-slate-500 mt-1 text-sm hidden sm:block">
            Manage system products and their details.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
          className="w-full sm:w-auto"
        >
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
        <Input
          placeholder="Search products..."
          icon={<Search className="h-4 w-4" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Results count */}
      <p className="text-xs sm:text-sm text-slate-500">
        Showing {filteredProduct.length} of {product.length} products
      </p>

      <DataTable
        data={filteredProduct}
        columns={columns}
        keyField="id"
        onView={handleViewImages}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />

      {/* Create Product Modal */}
      <ProductCreateModel
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProduct}
        currentUser={currentUser}
      />

      {/* Update Product Modal */}
      <ProductUpdateModel
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleUpdateProduct}
        product={selectedProduct}
      />

      {/* Product Images Modal */}
      <ProductImagesModal
        isOpen={isImagesModalOpen}
        onClose={() => {
          setIsImagesModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </div>
  );
}
