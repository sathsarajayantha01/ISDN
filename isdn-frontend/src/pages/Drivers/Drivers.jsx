import { useState, useEffect } from "react";
import { DataTable } from "../../components/data/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Plus, Search } from "lucide-react";
import { apiAdapter } from "../../services/apiAdapter";
import { DriverCreateModel } from "./models/DriversCreateModel";
import { DriverUpdateModel } from "./models/DriversUpdateModel";
import { AlertModal } from "../../components/feedback/AlertModal";

export function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [branches, setBranches] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    message: "",
    isSuccess: false,
  });

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email?.toLowerCase().includes(searchQuery.toLowerCase());
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
      key: "role",
      header: "Role",
      sortable: true,
      render: (_, driver) => driver.role?.roleName || "N/A",
    },
    {
      key: "branch",
      header: "Branch",
      sortable: true,
      hideOnMobile: true,
      render: (_, driver) => driver.branch?.name || "N/A",
    },
    {
      key: "active",
      header: "Status",
      render: (_, driver) =>
        driver.active ? (
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
      fetchDrivers();
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

  const fetchDrivers = async () => {
    setLoading(true);
    console.log("Get Drivers");
    try {
      const driverRole = roles.find((role) => role.roleName === "Driver");
      const roleId = driverRole?.id;

      // Build URL with query parameter
      const endpoint = roleId ? `/users?roleId=${roleId}` : "/users";

      const response = await apiAdapter.get(endpoint, {
        branchId: currentUser?.branchId || null,
      });
      if (response.success && response.data) {
        setDrivers(response.data);
      } else if (!response.success && response.message) {
        setAlertModal({
          isOpen: true,
          message: response.message,
          isSuccess: false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch drivers:", error);
      setAlertModal({
        isOpen: true,
        message: error.message || "Failed to fetch drivers",
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

  const handleCreateDriver = async (driverData) => {
    try {
      const response = await apiAdapter.post("/users/", driverData);
      if (response.success) {
        setIsCreateModalOpen(false);
        setAlertModal({
          isOpen: true,
          message: response.message || "Driver created successfully",
          isSuccess: true,
        });
        fetchDrivers();
      } else {
        setAlertModal({
          isOpen: true,
          message: response.message || "Failed to create driver",
          isSuccess: false,
        });
      }
    } catch (error) {
      console.error("Failed to create driver:", error);
      setAlertModal({
        isOpen: true,
        message: error.message || "Failed to create driver",
        isSuccess: false,
      });
    }
  };

  const handleUpdateDriver = async (driverId, driverData) => {
    try {
      const response = await apiAdapter.put(`/users/${driverId}`, driverData);
      if (response.success) {
        setIsUpdateModalOpen(false);
        setSelectedDriver(null);
        setAlertModal({
          isOpen: true,
          message: response.message || "Driver updated successfully",
          isSuccess: true,
        });
        fetchDrivers();
      } else {
        setAlertModal({
          isOpen: true,
          message: response.message || "Failed to update driver",
          isSuccess: false,
        });
      }
    } catch (error) {
      console.error("Failed to update driver:", error);
      setAlertModal({
        isOpen: true,
        message: error.message || "Failed to update driver",
        isSuccess: false,
      });
    }
  };

  const handleEditDriver = (driver) => {
    setSelectedDriver(driver);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteDriver = async (driver) => {
    if (confirm(`Are you sure you want to delete driver ${driver.name}?`)) {
      try {
        const response = await apiAdapter.delete(`/users/${driver.id}`);
        if (response.success) {
          setAlertModal({
            isOpen: true,
            message: response.message || "Driver deleted successfully",
            isSuccess: true,
          });
          fetchDrivers();
        } else {
          setAlertModal({
            isOpen: true,
            message: response.message || "Failed to delete driver",
            isSuccess: false,
          });
        }
      } catch (error) {
        console.error("Failed to delete driver:", error);
        setAlertModal({
          isOpen: true,
          message: error.message || "Failed to delete driver",
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
            Drivers
          </h1>
          <p className="text-slate-500 mt-1 text-sm hidden sm:block">
            Manage system drivers and their permissions.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
          className="w-full sm:w-auto"
        >
          Add User
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm">
        <Input
          placeholder="Search users..."
          icon={<Search className="h-4 w-4" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Results count */}
      <p className="text-xs sm:text-sm text-slate-500">
        Showing {filteredDrivers.length} of {drivers.length} drivers
      </p>

      <DataTable
        data={filteredDrivers}
        columns={columns}
        keyField="id"
        onEdit={handleEditDriver}
        onDelete={handleDeleteDriver}
      />

      {/* Create Driver Modal */}
      <DriverCreateModel
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateDriver}
        roles={roles}
        branches={branches}
        currentUser={currentUser}
      />

      {/* Update Driver Modal */}
      <DriverUpdateModel
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedDriver(null);
        }}
        onSubmit={handleUpdateDriver}
        driver={selectedDriver}
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
