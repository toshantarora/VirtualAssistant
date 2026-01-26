import { Loader2, Pencil, Trash2, Check, Archive, XCircle, RotateCcw } from "lucide-react";
import { useState } from "react";
import DeleteUserModal from "./DeleteUserModal";
// import { formatLastActive, formatUsageTime, getShortId } from "../utils/time";
import { deleteUserApi, updateUserApi } from "../services/dashboardService";
import Notification from "./Notification";

const ActionButton = ({ onClick, disabled, loading, icon: Icon, title, className }) => (
  <div className="relative group">
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-1 rounded transition-colors ${className}`}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <Icon size={18} />}
    </button>
    {/* Custom Tooltip */}
    <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-50 whitespace-nowrap shadow-lg">
      {title}
      {/* Arrow */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
    </div>
  </div>
);

const UsersTable = ({ openEdit, users = [], loading, onUserDeleted }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({
    success: true,
    title: "",
    message: "",
  });
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    openEdit(user);
  };

  const handleStatusUpdate = async (userId, newStatus, actionName) => {
    try {
      setActionLoading(userId);
      await updateUserApi(userId, { userStatus: newStatus });
      
      await onUserDeleted?.(); // Refresh list
      
      setNotificationData({
        success: true,
        title: "Success",
        message: `User ${actionName} successfully.`,
      });
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      console.error("Update failed", error);
      setNotificationData({
        success: false,
        title: "Update Failed",
        message: `Unable to ${actionName} user.`,
      });
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } finally {
        setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser || deleting) return;

    try {
      setDeleting(true);

      const res = await deleteUserApi(selectedUser.id);

      await onUserDeleted?.();
      setNotificationData({
        success: true,
        title: res.message || "User deleted successfully",
        message: "The user has been deleted successfully.",
      });
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Delete failed", error);

      setNotificationData({
        success: false,
        title: "Delete Failed",
        message: "Unable to delete user. Please try again.",
      });
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } finally {
      setDeleting(false);
      //   setTimeout(() => setShowNotification(false), 8000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!users.length) {
    return <p className="p-6 text-center">No users found</p>;
  }

  return (
    <>
      <Notification
        show={showNotification}
        setShow={setShowNotification}
        success={notificationData.success}
        title={notificationData.title}
        message={notificationData.message}
      />
      <div className="flex flex-col h-full rounded-xl overflow-hidden bg-white">
        <div className="overflow-y-auto" style={{ maxHeight: "500px" }}>
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10 bg-[#f6f8f5] text-left shadow-sm">
              <tr>
                {/* <th className="px-6 py-4 font-medium">User ID</th>
                <th className="px-6 py-4 font-medium">Usage Time</th>
                <th className="px-6 py-4 font-medium">Last Active</th>
                 */}
                <th className="px-6 py-4 font-medium">Name & Email</th>
                <th className="px-6 py-4 font-medium">Mobile Number</th>{" "}
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Province</th>
                <th className="px-6 py-4 font-medium">Constituency</th>{" "}
                <th className="px-6 py-4 font-medium">Facility</th>
                <th className="px-6 py-4 font-medium">ward</th>{" "}
                <th className="px-6 py-4 font-medium">Facility Type</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#cfded6]">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* <td className="px-6 py-5">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(user.id);
                      }}
                      className="
      font-medium
      text-primary-700
      hover:underline
      active:scale-95
      transition
      cursor-pointer
    "
                      title="Click to copy full ID"
                    >
                      {getShortId(user.id)}
                    </button>
                  </td> */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      {/* <img
                        src={user.avatar}
                        className="h-10 w-10 rounded-full"
                        alt="avatar"
                      /> */}
                      <div>
                        <p className="font-medium">{user.fullname}</p>
                        <p className="text-xs text-green-800">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-medium">{user.mobile}</td>
                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.userStatus === "APPROVED" // Using userStatus now
                          ? "bg-green-100 text-green-700"
                          : user.userStatus === "PENDING"
                          ? "bg-yellow-100 text-yellow-700" 
                          : user.userStatus === "BANNED"
                          ? "bg-red-100 text-red-700"
                          : user.userStatus === "ARCHIVED" || user.deletedAt
                          ? "bg-gray-100 text-gray-700"
                          : "bg-red-100 text-red-700" // Unknown
                      }`}
                    >
                      {user.userStatus || (user.deletedAt ? "ARCHIVED" : "UNKNOWN")}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-medium">
                    {/* {formatUsageTime(user.totalUsageSeconds)} */}
                    {user?.province ? user?.province?.name : "-"}
                  </td>
                  <td className="px-6 py-5 text-gray-600">
                    {/* {formatLastActive(user.lastActiveAt)} */}
                    {user?.constituency ? user?.constituency?.name : "-"}
                  </td>

                  <td className="px-6 py-5 text-gray-600">
                    {user?.facility ? user?.facility?.name : "-"}
                  </td>
                  <td className="px-6 py-5 text-gray-600">
                    {user?.ward ? user?.ward?.name : "-"}
                  </td>
                  <td className="px-6 py-5 text-gray-600">
                    {user?.facilityType ? user?.facilityType?.name : "-"}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex gap-2">
                        {/* Approve Button (Only for Pending) */}
                        {user.userStatus === 'PENDING' && (
                            <ActionButton
                                onClick={() => handleStatusUpdate(user.id, 'APPROVED', 'approved')}
                                disabled={actionLoading === user.id}
                                loading={actionLoading === user.id}
                                icon={Check}
                                className="hover:bg-green-100 text-green-600"
                                title="Approve User"
                            />
                        )}
                        
                        {/* Archive Button (For Non-Archived) */}
                        {user.userStatus !== 'ARCHIVED' && !user.deletedAt && (
                            <ActionButton
                                onClick={() => handleStatusUpdate(user.id, 'ARCHIVED', 'archived')}
                                disabled={actionLoading === user.id}
                                loading={actionLoading === user.id}
                                icon={Archive}
                                className="hover:bg-gray-100 text-gray-500"
                                title="Archive User"
                            />
                        )}

                        {/* Unarchive Button (For Archived) */}
                        {(user.userStatus === 'ARCHIVED' || user.deletedAt) && (
                            <ActionButton
                                onClick={() => handleStatusUpdate(user.id, 'APPROVED', 'restored')}
                                disabled={actionLoading === user.id}
                                loading={actionLoading === user.id}
                                icon={RotateCcw}
                                className="hover:bg-blue-100 text-blue-600"
                                title="Restore User"
                            />
                        )}

                        <ActionButton
                            onClick={() => openEditModal(user)}
                            icon={Pencil}
                            className="hover:bg-blue-100 text-blue-600"
                            title="Edit User"
                        />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DeleteUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onDelete={handleDelete}
          loading={deleting}
        />
      </div>
    </>
  );
};

export default UsersTable;