import { useState, useEffect } from "react";
import { DataTable } from "../../components/data/DataTable";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Plus, Search } from "lucide-react";
import { apiAdapter } from "../../services/apiAdapter";
import { UserCreateModel } from "./models/UserCreateModel";
import { UserUpdateModel } from "./models/UserUpdateModel";

export function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [branches, setBranches] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const allowedRoles = [
    "RDC Staff",
    "Logistics Officer",
    "Head Office Manager",
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = allowedRoles.includes(user.role?.roleName);
    return matchesSearch && matchesRole;
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
      render: (_, user) => user.role?.roleName || "N/A",
    },
    {
      key: "branch",
      header: "Branch",
      sortable: true,
      hideOnMobile: true,
      render: (_, user) => user.branch?.name || "N/A",
    },
    {
      key: "active",
      header: "Status",
      render: (_, user) =>
        user.active ? (
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
    if (currentUser !== null) {
      fetchUsers();
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

  const fetchUsers = async () => {
    setLoading(true);
    console.log("Get Users");
    try {
      const config = currentUser?.branchId
        ? { params: { branchId: currentUser.branchId } } // or headers if it's a header
        : {};

      const response = await apiAdapter.get("/users", config);

      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
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

  const handleCreateUser = async (userData) => {
    try {
      const response = await apiAdapter.post("/users/", userData);
      if (response.success) {
        setIsCreateModalOpen(false);
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to create user:", error);
      throw error;
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      const response = await apiAdapter.put(`/users/${userId}`, userData);
      if (response.success) {
        setIsUpdateModalOpen(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteUser = async (user) => {
    if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
      try {
        const response = await apiAdapter.delete(`/users/${user.id}`);
        if (response.success) {
          fetchUsers();
        }
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Users
          </h1>
          <p className="text-slate-500 mt-1 text-sm hidden sm:block">
            Manage system users and their permissions.
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
        Showing {filteredUsers.length} of {users.length} users
      </p>

      <DataTable
        data={filteredUsers}
        columns={columns}
        keyField="id"
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />

      {/* Create User Modal */}
      <UserCreateModel
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
        roles={roles}
        branches={branches}
      />

      {/* Update User Modal */}
      <UserUpdateModel
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUpdateUser}
        user={selectedUser}
        roles={roles}
        branches={branches}
      />
    </div>
  );
}
