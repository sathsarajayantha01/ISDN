import { useState, useEffect, useMemo } from "react";
import { DataTable } from "../../components/data/DataTable";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Plus,
  Search,
  Edit2,
  Send,
  Check,
  X,
  Package,
  Download,
} from "lucide-react";
import { apiAdapter } from "../../services/apiAdapter";
import { exportToPDF } from "../../utils/pdfExport";
import { AlertModal } from "../../components/feedback/AlertModal";
import { QuantityUpdateModel } from "./model/quantityUpdateModel";
import { TransferProductModel } from "./model/transferProductModel";
import { PendingTransferModel } from "./model/pendingTransferModel";

export function Inventory() {
  const [product, setProduct] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    message: "",
    isSuccess: false,
  });

  // Modal states
  const [isUpdateQuantityModalOpen, setIsUpdateQuantityModalOpen] =
    useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isPendingTransferModalOpen, setIsPendingTransferModalOpen] =
    useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductTransfers, setSelectedProductTransfers] = useState([]);

  // Update Quantity form state
  const [updateQuantity, setUpdateQuantity] = useState("");

  // Transfer form state
  const [transferBranchId, setTransferBranchId] = useState("");
  const [transferQuantity, setTransferQuantity] = useState("");

  const filteredProduct = product.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const columns = useMemo(
    () => [
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
        key: "stockQuantity",
        header: "Stock Quantity",
        sortable: true,
        render: (quantityValue, item) => item.inventories[0]?.quantity || "0",
      },
      {
        key: "unitType",
        header: "Unit Type",
        sortable: true,
      },
      {
        key: "description",
        header: "Description",
        sortable: true,
      },
      {
        key: "actions",
        header: "Actions",
        render: (value, item) => {
          const productTransfers = getProductPendingTransfers(item.id);
          console.log(`Rendering actions for product ${item.id}:`, {
            productTransfers,
            pendingTransfersState: pendingTransfers,
            shouldShowBadge: productTransfers.length > 0,
          });
          return (
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateQuantityClick(item)}
                className="p-1 text-blue-800 hover:bg-blue-50 rounded hover:text-blue-600 transition-colors"
                title="Update Quantity"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleTransferClick(item)}
                className="p-1 text-blue-800 hover:bg-green-50 rounded hover:text-green-600 transition-colors"
                title="Transfer Product"
              >
                <Send className="h-4 w-4" />
              </button>
              {productTransfers.length > 0 && (
                <button
                  onClick={() =>
                    handleViewPendingTransfers(item, productTransfers)
                  }
                  className="p-1 text-blue-800 hover:text-orange-600 hover:bg-orange-50 rounded relative"
                  title="View Pending Transfers"
                >
                  <Package className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 bg-blue-800 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {productTransfers.length}
                  </span>
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [pendingTransfers],
  );

  useEffect(() => {
    fetchCurrentUser();
    fetchBranches();
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
      // get product selected branch id in header
      const response = await apiAdapter.get("/products", {
        branchid: currentUser.branchId,
      });
      if (response.success && response.data) {
        setProduct(response.data);
        // Extract pending transfers from product inventory data
        extractPendingTransfers(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractPendingTransfers = (products) => {
    const transfers = [];
    console.log("Current User Branch ID:", currentUser.branchId);
    products.forEach((product) => {
      product.inventories?.forEach((inventory) => {
        console.log(`Product ${product.id} - Inventory:`, {
          branchId: inventory.branch.id,
          reservedQuantity: inventory.reservedQuantity,
          reservedBranchId: inventory.reservedBranchId,
          matches: String(inventory.branch.id) === String(currentUser.branchId),
        });
        // Check if this inventory has a pending transfer to current branch
        if (
          inventory.reservedQuantity > 0 &&
          inventory.reservedBranchId &&
          String(inventory.branch.id) === String(currentUser.branchId)
        ) {
          transfers.push({
            id: `${product.id}-${inventory.id}`,
            productId: product.id,
            product: {
              id: product.id,
              name: product.name,
              productCode: product.productCode,
            },
            fromBranch: inventory.reservedBranch,
            toBranch: inventory.branch,
            quantity: inventory.reservedQuantity,
            inventoryId: inventory.id,
          });
        }
      });
    });

    console.log("Extracted Transfers:", transfers);

    setPendingTransfers(transfers);
  };

  const fetchBranches = async () => {
    try {
      const response = await apiAdapter.get("/branches");
      if (response.success && response.data) {
        setBranches(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    }
  };

  const handleUpdateQuantityClick = (product) => {
    setSelectedProduct(product);
    setUpdateQuantity("");
    setIsUpdateQuantityModalOpen(true);
  };

  const handleTransferClick = (product) => {
    setSelectedProduct(product);
    setTransferBranchId("");
    setTransferQuantity("");
    setIsTransferModalOpen(true);
  };

  const getProductPendingTransfers = (productId) => {
    const filtered = pendingTransfers.filter(
      (transfer) => String(transfer.productId) === String(productId),
    );
    console.log(
      `Product ${productId}: Found ${filtered.length} transfers`,
      filtered,
    );
    return filtered;
  };

  const handleViewPendingTransfers = (product, transfers) => {
    setSelectedProduct(product);
    setSelectedProductTransfers(transfers);
    setIsPendingTransferModalOpen(true);
  };

  const handleExport = () => {
    const exportColumns = [
      { key: "productCode", header: "Product Code" },
      { key: "name", header: "Name" },
      {
        key: "category",
        header: "Category",
        render: (val, item) => item.category?.name || "-",
      },
      { key: "unitPrice", header: "Unit Price", render: (val) => `$${val}` },
      {
        key: "stockQuantity",
        header: "Stock Quantity",
        render: (val, item) => item.inventories[0]?.quantity || "0",
      },
      { key: "unitType", header: "Unit Type" },
      {
        key: "promotion",
        header: "Promotion",
        render: (val, item) => item.promotion?.discountPercent || "-",
      },
      { key: "description", header: "Description" },
    ];
    exportToPDF(
      filteredProduct,
      exportColumns,
      "inventory-report",
      "Inventory Report",
    );
  };

  const handleUpdateQuantity = async () => {
    if (!updateQuantity || updateQuantity <= 0) {
      setAlertModal({
        isOpen: true,
        message: "Please enter a valid quantity",
        isSuccess: false,
      });
      return;
    }

    try {
      const response = await apiAdapter.patch(
        `/products/quantity/${selectedProduct.id}`,
        {
          quantity: parseInt(updateQuantity),
        },
        {
          branchid: currentUser.branchId,
        },
      );

      if (response.success) {
        setAlertModal({
          isOpen: true,
          message: response.message || "Product quantity updated successfully",
          isSuccess: true,
        });
        setIsUpdateQuantityModalOpen(false);
        fetchProduct();
      } else {
        setAlertModal({
          isOpen: true,
          message: response.message || "Failed to update quantity",
          isSuccess: false,
        });
      }
    } catch (error) {
      setAlertModal({
        isOpen: true,
        message: error.message || "Error updating quantity",
        isSuccess: false,
      });
      console.error("Update quantity error:", error);
    }
  };

  const handleTransferProduct = async () => {
    if (!transferBranchId) {
      setAlertModal({
        isOpen: true,
        message: "Please select a destination branch",
        isSuccess: false,
      });
      return;
    }

    if (!transferQuantity || transferQuantity <= 0) {
      setAlertModal({
        isOpen: true,
        message: "Please enter a valid quantity",
        isSuccess: false,
      });
      return;
    }

    try {
      const response = await apiAdapter.put(
        `/products/transfer/${selectedProduct.id}`,
        {
          fromBranchId: currentUser.branchId,
          toBranchId: parseInt(transferBranchId),
          quantity: parseInt(transferQuantity),
        },
      );

      if (response.success) {
        setAlertModal({
          isOpen: true,
          message:
            response.message || "Product transfer initiated successfully",
          isSuccess: true,
        });
        setIsTransferModalOpen(false);
        fetchProduct();
      } else {
        setAlertModal({
          isOpen: true,
          message: response.message || "Failed to transfer product",
          isSuccess: false,
        });
      }
    } catch (error) {
      setAlertModal({
        isOpen: true,
        message: error.message || "Error transferring product",
        isSuccess: false,
      });
      console.error("Transfer product error:", error);
    }
  };

  const handleAcceptTransfer = async (transfer) => {
    try {
      const response = await apiAdapter.post(
        `/products/transfer/review/${transfer.productId}`,
        {
          branchId: currentUser.branchId,
          status: "accept",
        },
      );

      if (response.success) {
        setAlertModal({
          isOpen: true,
          message: response.message || "Transfer accepted",
          isSuccess: true,
        });
        fetchProduct();
      } else {
        setAlertModal({
          isOpen: true,
          message: response.message || "Failed to accept transfer",
          isSuccess: false,
        });
      }
    } catch (error) {
      setAlertModal({
        isOpen: true,
        message: error.message || "Error accepting transfer",
        isSuccess: false,
      });
      console.error("Accept transfer error:", error);
    }
  };

  const handleRejectTransfer = async (transfer) => {
    try {
      const response = await apiAdapter.post(
        `/products/transfer/review/${transfer.productId}`,
        {
          branchId: currentUser.branchId,
          status: "reject",
        },
      );

      if (response.success) {
        setAlertModal({
          isOpen: true,
          message: response.message || "Transfer rejected",
          isSuccess: true,
        });
        fetchProduct();
      } else {
        setAlertModal({
          isOpen: true,
          message: response.message || "Failed to reject transfer",
          isSuccess: false,
        });
      }
    } catch (error) {
      setAlertModal({
        isOpen: true,
        message: error.message || "Error rejecting transfer",
        isSuccess: false,
      });
      console.error("Reject transfer error:", error);
    }
  };

  return (
    <div className="space-y-6 pb-6">
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
          variant="secondary"
          leftIcon={<Download className="h-4 w-4" />}
          className="w-full sm:w-auto"
          onClick={handleExport}
        >
          Export
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

      <DataTable data={filteredProduct} columns={columns} keyField="id" />

      {/* Update Quantity Modal */}
      <QuantityUpdateModel
        isOpen={isUpdateQuantityModalOpen}
        onClose={() => setIsUpdateQuantityModalOpen(false)}
        selectedProduct={selectedProduct}
        updateQuantity={updateQuantity}
        setUpdateQuantity={setUpdateQuantity}
        onUpdate={handleUpdateQuantity}
      />

      {/* Transfer Product Modal */}
      <TransferProductModel
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        selectedProduct={selectedProduct}
        branches={branches}
        currentUser={currentUser}
        transferBranchId={transferBranchId}
        setTransferBranchId={setTransferBranchId}
        transferQuantity={transferQuantity}
        setTransferQuantity={setTransferQuantity}
        onTransfer={handleTransferProduct}
      />

      {/* Pending Transfers Modal */}
      <PendingTransferModel
        isOpen={isPendingTransferModalOpen}
        onClose={() => setIsPendingTransferModalOpen(false)}
        selectedProduct={selectedProduct}
        selectedProductTransfers={selectedProductTransfers}
        onAcceptTransfer={handleAcceptTransfer}
        onRejectTransfer={handleRejectTransfer}
      />

      {/* Alert Modal */}
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
