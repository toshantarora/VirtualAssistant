import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import DeleteUserModal from "./DeleteUserModal";
// import { formatLastActive, formatUsageTime, getShortId } from "../utils/time";
import { deleteUserApi } from "../services/dashboardService";
import Notification from "./Notification";

const UsersTable = ({ openEdit, users = [], loading, onUserDeleted }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
                <th className="px-6 py-4 font-medium">Province</th>
                <th className="px-6 py-4 font-medium">consistuancy</th>{" "}
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
                    {user?.facilityType ? user?.facilityType : "-"}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex gap-4">
                      <button
                        onClick={() => openEditModal(user)}
                        className="hover:text-green-700 transition-colors"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => openDeleteModal(user)}
                        className="hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
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