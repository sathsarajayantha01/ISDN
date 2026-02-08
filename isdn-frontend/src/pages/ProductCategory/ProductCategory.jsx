import { useState, useEffect } from "react";
import { DataTable } from "../../components/data/DataTable";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Plus, Search } from "lucide-react";
import { apiAdapter } from "../../services/apiAdapter";
import { ProductCategoryCreateModel } from "./models/ProductCategoryCreateModel";
import { ProductCategoryUpdateModel } from "./models/ProductCategoryUpdateModel";

export function ProductCategory() {
  const [productCategory, setProductCategory] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedProductCategory, setSelectedProductCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredProductCategory = productCategory.filter((category) => {
    const matchesSearch =
      category.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const columns = [
    {
      key: "name",
      header: "Name",
      sortable: true,
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
      fetchProductCategory();
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

  const fetchProductCategory = async () => {
    setLoading(true);
    console.log("Get Product Categories");
    try {
      const response = await apiAdapter.get("/product-categories");
      if (response.success && response.data) {
        setProductCategory(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch product categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProductCategory = async (productCategoryData) => {
    try {
      const response = await apiAdapter.post(
        "/product-categories/",
        productCategoryData,
      );
      if (response.success) {
        setIsCreateModalOpen(false);
        fetchProductCategory();
      }
    } catch (error) {
      console.error("Failed to create product category:", error);
      throw error;
    }
  };

  const handleUpdateProductCategory = async (
    productCategoryId,
    productCategoryData,
  ) => {
    try {
      const response = await apiAdapter.put(
        `/product-categories/${productCategoryId}`,
        productCategoryData,
      );
      if (response.success) {
        setIsUpdateModalOpen(false);
        setSelectedProductCategory(null);
        fetchProductCategory();
      }
    } catch (error) {
      console.error("Failed to update product category:", error);
      throw error;
    }
  };

  const handleEditProductCategory = (productCategory) => {
    setSelectedProductCategory(productCategory);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteProductCategory = async (productCategory) => {
    if (
      confirm(
        `Are you sure you want to delete product category ${productCategory.name}?`,
      )
    ) {
      try {
        const response = await apiAdapter.delete(
          `/product-categories/${productCategory.id}`,
        );
        if (response.success) {
          fetchProductCategory();
        }
      } catch (error) {
        console.error("Failed to delete product category:", error);
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Product Categories
          </h1>
          <p className="text-slate-500 mt-1 text-sm hidden sm:block">
            Manage system product categories and their details.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
          className="w-full sm:w-auto"
        >
          Add Product Category
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
        <Input
          placeholder="Search product categories..."
          icon={<Search className="h-4 w-4" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Results count */}
      <p className="text-xs sm:text-sm text-slate-500">
        Showing {filteredProductCategory.length} of {productCategory.length}{" "}
        product categories
      </p>

      <DataTable
        data={filteredProductCategory}
        columns={columns}
        keyField="id"
        onEdit={handleEditProductCategory}
        onDelete={handleDeleteProductCategory}
      />

      {/* Create Product Category Modal */}
      <ProductCategoryCreateModel
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProductCategory}
        currentUser={currentUser}
      />

      {/* Update Product Category Modal */}
      <ProductCategoryUpdateModel
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedProductCategory(null);
        }}
        onSubmit={handleUpdateProductCategory}
        productCategory={selectedProductCategory}
      />
    </div>
  );
}
