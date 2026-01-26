import { useEffect, useState, useCallback } from "react";
import ManageUsersHeader from "../../components/ManageUsersHeader";
import UsersTable from "../../components/UsersTable";
import Pagination from "../../components/Pagination";
import UserModal from "../../components/UserModal";
import { getUsers } from "../../services/dashboardService";

const Users = () => {
  /* ------------------ Modal State ------------------ */
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState(null);

  /* ------------------ Users State ------------------ */
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ------------------ Pagination & Search ------------------ */
  const [page, setPage] = useState(1);
  const limit = 6;
  const [search, setSearch] = useState("");

  /* ------------------ Filtering State ------------------ */
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'pending', 'archived'

  /* ------------------ Handlers ------------------ */
  const openAdd = () => {
    setMode("add");
    setSelectedUser(null);
    setOpen(true);
  };

  const openEdit = (user) => {
    setMode("edit");
    setSelectedUser(user);
    setOpen(true);
  };

  /* ------------------ Fetch Users ------------------ */
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getUsers({
        page,
        limit,
        search,
        role: "USER",
        status: activeFilter === "all" ? undefined : (activeFilter === "pending" ? "PENDING" : (activeFilter === "archived" ? "ARCHIVED" : undefined)),
      });

      setUsers(res.data.data.users);
      setTotalUsers(res.data.data.total);
    } catch (err) {
      console.error("User fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, activeFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserDeleted = async () => {
    fetchUsers();
  };

  return (
    <>
      {/* ================= Users Table ================= */}
      <div className="bg-white py-3 mt-6 rounded-2xl border border-primary-100 space-y-6">
        <ManageUsersHeader
          total={totalUsers}
          openAdd={openAdd}
          search={search}
          onSearch={(value) => {
            setPage(1);
            setSearch(value);
          }}
          showAddUser={true}
        />

        {/* Filter Tabs */}
        <div className="flex gap-4 px-6 border-b border-gray-100">
            {['all', 'pending', 'archived'].map((filter) => (
                <button
                    key={filter}
                    onClick={() => { setActiveFilter(filter); setPage(1); }}
                    className={`pb-3 px-1 text-sm font-medium capitalize transition-colors border-b-2 ${
                        activeFilter === filter
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    {filter}
                </button>
            ))}
        </div>

        <UsersTable
          users={users}
          loading={loading}
          openEdit={openEdit}
          onUserDeleted={handleUserDeleted}
        />
      </div>

      {/* ================= Pagination ================= */}
      <div className="px-5">
        <Pagination
          currentPage={page}
          totalItems={totalUsers}
          itemsPerPage={limit}
          onPageChange={setPage}
        />
      </div>

      {/* ================= Modal ================= */}
      <UserModal
        isOpen={open}
        onClose={() => setOpen(false)}
        mode={mode}
        userData={selectedUser}
        onSuccess={fetchUsers}
      />
    </>
  );
};

export default Users;
