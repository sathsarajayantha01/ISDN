import { useState, useEffect } from "react";
import { Card } from "../../components/ui/Card";
import { apiAdapter } from "../../services/apiAdapter";

export function Account() {
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiAdapter.get("/auth/log");

      if (response.success) {
        setAccountData(response.data);
      } else {
        setError(response.message || "Failed to fetch account data");
      }
    } catch (err) {
      setError("An error occurred while fetching account data");
      console.error("Error fetching account data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600">Loading account information...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!accountData) {
    return (
      <div className="p-6">
        <div className="text-slate-600">No account data available.</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">My Account</h1>
        <p className="text-slate-600 mt-1">
          View and manage your account information
        </p>
      </div>

      {/* Personal Information */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-500">
              Username
            </label>
            <p className="text-slate-900 mt-1">{accountData.username}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-500">Name</label>
            <p className="text-slate-900 mt-1">{accountData.name || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-500">Email</label>
            <p className="text-slate-900 mt-1">{accountData.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-500">
              Contact Number
            </label>
            <p className="text-slate-900 mt-1">
              {accountData.contactNumber || "N/A"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-500">
              Address
            </label>
            <p className="text-slate-900 mt-1">
              {accountData.address || "N/A"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-500">
              Customer Type
            </label>
            <p className="text-slate-900 mt-1">
              {accountData.customerType || "N/A"}
            </p>
          </div>
          {accountData.businessName && (
            <div>
              <label className="text-sm font-medium text-slate-500">
                Business Name
              </label>
              <p className="text-slate-900 mt-1">{accountData.businessName}</p>
            </div>
          )}
          {accountData.customerCode && (
            <div>
              <label className="text-sm font-medium text-slate-500">
                Customer Code
              </label>
              <p className="text-slate-900 mt-1">{accountData.customerCode}</p>
            </div>
          )}
          {accountData.district && (
            <div>
              <label className="text-sm font-medium text-slate-500">
                District
              </label>
              <p className="text-slate-900 mt-1">{accountData.district}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-slate-500">Status</label>
            <p className="mt-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  accountData.active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {accountData.active ? "Active" : "Inactive"}
              </span>
            </p>
          </div>
        </div>
      </Card>

      {/* Branch Information */}
      {accountData.branch && (
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Branch Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-500">
                Branch Name
              </label>
              <p className="text-slate-900 mt-1">{accountData.branch.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">
                Branch Code
              </label>
              <p className="text-slate-900 mt-1">{accountData.branch.code}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">
                Region
              </label>
              <p className="text-slate-900 mt-1">{accountData.branch.region}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">
                Contact Number
              </label>
              <p className="text-slate-900 mt-1">
                {accountData.branch.contactNumber}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-500">
                Address
              </label>
              <p className="text-slate-900 mt-1">
                {accountData.branch.address}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Driver Information (if applicable) */}
      {accountData.vehicle && (
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Vehicle Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accountData.licenseNumber && (
              <div>
                <label className="text-sm font-medium text-slate-500">
                  License Number
                </label>
                <p className="text-slate-900 mt-1">
                  {accountData.licenseNumber}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-slate-500">
                Vehicle ID
              </label>
              <p className="text-slate-900 mt-1">{accountData.vehicleId}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
