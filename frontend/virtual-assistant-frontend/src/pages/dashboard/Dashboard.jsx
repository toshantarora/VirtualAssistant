import { useEffect, useState, useCallback } from "react";
import { User, UserCheck, UserX, Loader2 } from "lucide-react";

import ManageUsersHeader from "../../components/ManageUsersHeader";
import Pagination from "../../components/Pagination";
import StatCard from "../../components/StatCard";
import UserModal from "../../components/UserModal";
import UsersTable from "../../components/UsersTable";
import { getDashboardStats, getUsers } from "../../services/dashboardService";
import { getLast7DaysRange } from "../../utils/time";

const Dashboard = () => {
  /* ------------------ Modal State ------------------ */
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState(null);

  /* ------------------ Users State ------------------ */
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);

  /* ------------------ Pagination & Search ------------------ */
  const [page, setPage] = useState(1);
  const limit = 6;
  const [search, setSearch] = useState("");

  /* ------------------ Stats State ------------------ */
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeLast7Days: 0,
    inactiveLast7Days: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [status, setStatus] = useState(null);
  const [lastActiveFrom, setLastActiveFrom] = useState(null);
  const [lastActiveTo, setLastActiveTo] = useState(null);

  /* ------------------ Modal Handlers ------------------ */
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

  /* ------------------ Fetch Stats ------------------ */
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await getDashboardStats();
      setStats(res.data.data);
    } catch (err) {
      console.error("Dashboard stats error:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  /* ------------------ Fetch Users ------------------ */
  //   const fetchUsers = useCallback(async () => {
  //     try {
  //       setUsersLoading(true);
  //       const res = await getUsers({
  //         page,
  //         limit,
  //         search,
  //         role: "USER",
  //       });

  //       setUsers(res.data.data.users);
  //       setTotalUsers(res.data.data.total);
  //     } catch (err) {
  //       console.error("User fetch error:", err);
  //     } finally {
  //       setUsersLoading(false);
  //     }
  //   }, [page, limit, search]);

  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);

      const res = await getUsers({
        page,
        limit,
        search,
        role: "USER",
        status,
        lastActiveFrom,
        lastActiveTo,
      });

      setUsers(res.data.data.users);
      setTotalUsers(res.data.data.total);
    } catch (err) {
      console.error("User fetch error:", err);
    } finally {
      setUsersLoading(false);
    }
  }, [page, limit, search, status, lastActiveFrom, lastActiveTo]);

  /* ------------------ Effects ------------------ */
  useEffect(() => {
    fetchStats(); // once
  }, [fetchStats]);

  useEffect(() => {
    fetchUsers(); // on page/search change
  }, [fetchUsers]);

  const handleTotalUsersClick = () => {
    setStatus("");
    setLastActiveFrom(null);
    setLastActiveTo(null);
    setPage(1);
  };
  //   const handleActiveUsersClick = () => {
  //   const { from, to } = getLast7DaysRange();

  //   setStatus(null);              // ❌ DO NOT send status
  //   setLastActiveFrom(from);      // ✅ send date
  //   setLastActiveTo(to);          // ✅ send date
  //   setPage(1);
  // };

  const handleActiveUsersClick = () => {
    const { from, to } = getLast7DaysRange();
    setStatus("ACTIVE");
    setLastActiveFrom(from);
    setLastActiveTo(to);
    setPage(1);
  };

  const handleInactiveUsersClick = () => {
    const { from, to } = getLast7DaysRange();
    setStatus("INACTIVE");
    setLastActiveFrom(from);
    setLastActiveTo(to);
    setPage(1);
  };

  /* ------------------ Refresh After Add/Edit ------------------ */
  const refreshDashboardData = async () => {
    await Promise.all([fetchStats(), fetchUsers()]);
  };

  const handleUserDeleted = async () => {
    await Promise.all([fetchUsers(), fetchStats()]);
  };
console.log("status", status);

  return (
    <>
      {/* ================= Stats ================= */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={User}
          loading={statsLoading}
          onClick={handleTotalUsersClick}
          active={!status}
        />

        <StatCard
          title="Active Users (7d)"
          value={stats.activeLast7Days}
          icon={UserCheck}
          loading={statsLoading}
          onClick={handleActiveUsersClick}
          active={status === "ACTIVE"}
        />

        {/* <StatCard
          title="Inactive Users (7d)"
          value={stats.inactiveLast7Days}
          icon={UserX}
          loading={statsLoading}
        /> */}
        <StatCard
          title="Inactive Users (7d)"
          value={stats.inactiveLast7Days}
          icon={UserX}
          loading={statsLoading}
          onClick={handleInactiveUsersClick}
          active={status === "INACTIVE"}
        />
      </div>

      {/* ================= Users Table ================= */}
      <div className="bg-white py-3 mt-6 rounded-2xl border border-primary-100 space-y-6">
        <ManageUsersHeader
        status={status}
          total={stats.totalUsers}
          openAdd={openAdd}
          search={search}
          onSearch={(value) => {
            setPage(1); // reset page on search
            setSearch(value);
          }}
        />

        <UsersTable
          users={users}
          loading={usersLoading}
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
        onSuccess={refreshDashboardData}
      />
    </>
  );
};

export default Dashboard;
