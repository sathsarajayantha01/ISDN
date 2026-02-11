import { useState, useEffect } from "react";
import { DataTable } from "../../components/data/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Plus, Search } from "lucide-react";
import { apiAdapter } from "../../services/apiAdapter";
import { CustomersCreateModel } from "./models/CustomersCreateModel";
import { CustomersUpdateModel } from "./models/CustomersUpdateModel";
import { AlertModal } from "../../components/feedback/AlertModal";

export function Customers() {
  const [customers, setCustomers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [branches, setBranches] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    message: "",
    isSuccess: false,
  });

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.businessName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      customer.customerCode
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      customer.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.customerType?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const columns = [
    {
      key: "name",
      header: "Name",
      sortable: true,
    },
    {
      key: "username",
      header: "Username",
      sortable: true,
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      hideOnMobile: true,
    },
    {
      key: "contactNumber",
      header: "Contact Number",
      sortable: true,
      hideOnMobile: true,
    },
    {
      key: "businessName",
      header: "Business Name",
      sortable: true,
      hideOnMobile: true,
    },
    {
      key: "customerCode",
      header: "Customer Code",
      sortable: true,
      hideOnMobile: true,
    },
    {
      key: "district",
      header: "District",
      sortable: true,
      hideOnMobile: true,
    },
    {
      key: "customerType",
      header: "Customer Type",
      sortable: true,
      hideOnMobile: true,
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (_, customer) => customer.role?.roleName || "N/A",
    },
    {
      key: "branch",
      header: "Branch",
      sortable: true,
      hideOnMobile: true,
      render: (_, customer) => customer.branch?.name || "N/A",
    },
    {
      key: "active",
      header: "Status",
      render: (_, customer) =>
        customer.active ? (
          <Badge status="active" variant="success">
            Active
          </Badge>
        ) : (
          <Badge status="inactive" variant="destructive">
            Inactive
          </Badge>
        ),
    },
  ];

  useEffect(() => {
    fetchCurrentUser();
    fetchRoles();
    fetchBranches();
  }, []);

  useEffect(() => {
    if (currentUser !== null && roles.length > 0) {
      fetchCustomers();
    }
  }, [currentUser, roles]);

  const fetchCurrentUser = async () => {
    const userStr = localStorage.getItem("user");
    const storedUser = userStr ? JSON.parse(userStr) : null;

    if (storedUser) {
      setCurrentUser({
        branchId: storedUser.branch?.id || null,
      });
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    console.log("Get Customers");
    try {
      const businessCustomerRole = roles.find(
        (role) => role.roleName === "Business Customer",
      );
      const businessCusId = businessCustomerRole?.id;

      const retailCustomerRole = roles.find(
        (role) => role.roleName === "Retail Customer",
      );
      const retailCusId = retailCustomerRole?.id;

      // Build URL with query parameter
      const endpointBusiness = businessCusId
        ? `/users?roleId=${businessCusId}`
        : "/users";
      const endpointRetail = retailCusId
        ? `/users?roleId=${retailCusId}`
        : "/users";

      const responseBusiness = await apiAdapter.get(endpointBusiness, {
        branchId: currentUser?.branchId || null,
      });

      const responseRetail = await apiAdapter.get(endpointRetail, {
        branchId: currentUser?.branchId || null,
      });

      const response = {
        success: responseBusiness.success && responseRetail.success,
        data: [
          ...(responseBusiness.data || []),
          ...(responseRetail.data || []),
        ],
      };

      if (response.success && response.data) {
        setCustomers(response.data);
      } else if (!response.success && response.message) {
        setAlertModal({
          isOpen: true,
          message: response.message,
          isSuccess: false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setAlertModal({
        isOpen: true,
        message: error.message || "Failed to fetch customers",
        isSuccess: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await apiAdapter.get("/roles");
      if (response.success && response.data) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
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

  const handleCreateCustomer = async (customerData) => {
    try {
      const response = await apiAdapter.post("/users/", customerData);
      if (response.success) {
        setIsCreateModalOpen(false);
        setAlertModal({
          isOpen: true,
          message: response.message || "Customer created successfully",
          isSuccess: true,
        });
        fetchCustomers();
      } else {
        setAlertModal({
          isOpen: true,
          message: response.message || "Failed to create customer",
          isSuccess: false,
        });
      }
    } catch (error) {
      console.error("Failed to create customer:", error);
      setAlertModal({
        isOpen: true,
        message: error.message || "Failed to create customer",
        isSuccess: false,
      });
    }
  };

  const handleUpdateCustomer = async (customerId, customerData) => {
    try {
      const response = await apiAdapter.put(
        `/users/${customerId}`,
        customerData,
      );
      if (response.success) {
        setIsUpdateModalOpen(false);
        setSelectedCustomer(null);
        setAlertModal({
          isOpen: true,
          message: response.message || "Customer updated successfully",
          isSuccess: true,
        });
        fetchCustomers();
      } else {
        setAlertModal({
          isOpen: true,
          message: response.message || "Failed to update customer",
          isSuccess: false,
        });
      }
    } catch (error) {
      console.error("Failed to update customer:", error);
      setAlertModal({
        isOpen: true,
        message: error.message || "Failed to update customer",
        isSuccess: false,
      });
    }
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteCustomer = async (customer) => {
    if (confirm(`Are you sure you want to delete customer ${customer.name}?`)) {
      try {
        const response = await apiAdapter.delete(`/users/${customer.id}`);
        if (response.success) {
          setAlertModal({
            isOpen: true,
            message: response.message || "Customer deleted successfully",
            isSuccess: true,
          });
          fetchCustomers();
        } else {
          setAlertModal({
            isOpen: true,
            message: response.message || "Failed to delete customer",
            isSuccess: false,
          });
        }
      } catch (error) {
        console.error("Failed to delete customer:", error);
        setAlertModal({
          isOpen: true,
          message: error.message || "Failed to delete customer",
          isSuccess: false,
        });
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Customers
          </h1>
          <p className="text-slate-500 mt-1 text-sm hidden sm:block">
            Manage system customers and their permissions.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
          className="w-full sm:w-auto"
        >
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
        <Input
          placeholder="Search customers..."
          icon={<Search className="h-4 w-4" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Results count */}
      <p className="text-xs sm:text-sm text-slate-500">
        Showing {filteredCustomers.length} of {customers.length} customers
      </p>

      <DataTable
        data={filteredCustomers}
        columns={columns}
        keyField="id"
        onEdit={handleEditCustomer}
        onDelete={handleDeleteCustomer}
      />

      {/* Create Customer Modal */}
      <CustomersCreateModel
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCustomer}
        roles={roles}
        branches={branches}
        currentUser={currentUser}
      />

      {/* Update Customer Modal */}
      <CustomersUpdateModel
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedCustomer(null);
        }}
        onSubmit={handleUpdateCustomer}
        customer={selectedCustomer}
        roles={roles}
        branches={branches}
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
