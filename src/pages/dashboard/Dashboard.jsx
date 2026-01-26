import { useEffect, useState, useCallback } from "react";
import { User, UserCheck, UserX, Loader2, Clock } from "lucide-react";

import ManageUsersHeader from "../../components/ManageUsersHeader";
import Pagination from "../../components/Pagination";
import StatCard from "../../components/StatCard";
import UserModal from "../../components/UserModal";
import UsersTableDashBoard from "../../components/UsersTableDashBoard";
import { useLocations } from "../../hooks/useLocations";
import SelectFieldHeader from "../../components/SelectFieldHeader";
import { getDashboardStats, getUsers } from "../../services/dashboardService";
import { useForm } from "react-hook-form";

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
  const [debouncedSearch, setDebouncedSearch] = useState("");

  /* ------------------ Debounce Search ------------------ */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);
  
  const {
      states,
      constituencies,
      facilities,
      wards,
      fetchStates,
      fetchConstituencies,
      fetchFacilities,
      fetchWards,
    } = useLocations();

    const {
        watch,
        register,
        setValue,
      } = useForm({
        defaultValues: {
          province: "",
          constituency: "",
          facility: "",
          ward: "",
        },
      });

  /* ------------------ Stats State ------------------ */
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeLast7Days: 0,
    inactiveLast7Days: 0,
    pendingUsers: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  /* ------------------ Filtering State ------------------ */
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'active', 'inactive'

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

  /* ------------------ FETCH STATES ------------------ */
  useEffect(() => {
    fetchStates();
  }, []);

  /* ------------------ SELECT HANDLERS ------------------ */
  const onStateChange = async (e) => {
    setValue("constituency", "");
    setValue("facility", "");
    setValue("ward", "");
    await fetchConstituencies(e.target.value);
  };

  const onConstituencyChange = async (e) => {
    setValue("facility", "");
    setValue("ward", "");
    await fetchFacilities(e.target.value);
  };

  const onFacilityChange = async (e) => {
    setValue("ward", "");
    await fetchWards(e.target.value);
  };

  /* ------------------ Watchers ------------------ */
  const selectedProvince = watch("province");
  const selectedConstituency = watch("constituency");
  const selectedFacility = watch("facility");
  const selectedWard = watch("ward");

  /* ------------------ Fetch Stats ------------------ */
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await getDashboardStats({
        provinceId: selectedProvince,
        constituencyId: selectedConstituency,
        facilityId: selectedFacility,
        wardId: selectedWard,
      });
      setStats(res.data.data);
    } catch (err) {
      console.error("Dashboard stats error:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [selectedProvince, selectedConstituency, selectedFacility, selectedWard]);

  /* ------------------ Fetch Users ------------------ */
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const res = await getUsers({
        page,
        limit,
        search: debouncedSearch,
        role: "USER",
        activeLast7Days: activeFilter === "active" ? true : undefined,
        inactiveLast7Days: activeFilter === "inactive" ? true : undefined,
        status: activeFilter === "pending" ? "PENDING" : (activeFilter === "active" || activeFilter === "inactive") ? "APPROVED" : undefined,
        sortBy: "recent",
        provinceId: selectedProvince,
        constituencyId: selectedConstituency,
        facilityId: selectedFacility,
        wardId: selectedWard,
      });

      setUsers(res.data.data.users);
      setTotalUsers(res.data.data.total);
    } catch (err) {
      console.error("User fetch error:", err);
    } finally {
      setUsersLoading(false);
    }
  }, [page, limit, debouncedSearch, activeFilter, selectedProvince, selectedConstituency, selectedFacility, selectedWard]);

  /* ------------------ Effects ------------------ */
  useEffect(() => {
    fetchStats(); // once
  }, [fetchStats]);

  useEffect(() => {
    fetchUsers(); // on page/search change
  }, [fetchUsers]);

  const handleFilterClick = (filter) => {
    setPage(1);
    setActiveFilter(filter);
  };

  /* ------------------ Refresh After Add/Edit ------------------ */
  const refreshDashboardData = async () => {
    await Promise.all([fetchStats(), fetchUsers()]);
  };

  const handleUserDeleted = async () => {
    await Promise.all([fetchUsers(), fetchStats()]);
  };

  return (
    <>
      {/* ================= Stats ================= */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={User}
          loading={statsLoading}
          onClick={() => handleFilterClick("all")}
          active={activeFilter === "all"}
        />

        <StatCard
          title="Active Users (7d)"
          value={stats.activeLast7Days}
          icon={UserCheck}
          loading={statsLoading}
          onClick={() => handleFilterClick("active")}
          active={activeFilter === "active"}
        />

        <StatCard
          title="Inactive Users (7d)"
          value={stats.inactiveLast7Days}
          icon={UserX}
          loading={statsLoading}
          onClick={() => handleFilterClick("inactive")}
          active={activeFilter === "inactive"}
        />

        <StatCard
          title="Pending Users"
          value={stats.pendingUsers}
          icon={Clock}
          loading={statsLoading}
          onClick={() => handleFilterClick("pending")}
          active={activeFilter === "pending"}
        />
      </div>

      <div className="bg-white p-3 md:p-5 mt-4 md:mt-8 rounded-2xl border border-primary-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          <SelectFieldHeader
            name="province"
            placeholder="Province"
            register={register}
            onChange={onStateChange}
            options={states.map((s) => ({
              label: s.name,
              value: s.id,
            }))}
          />

          <SelectFieldHeader
            name="constituency"
            placeholder="Constituency"
            register={register}
            onChange={onConstituencyChange}
            options={constituencies.map((c) => ({
              label: c.name,
              value: c.id,
            }))}
          />

          <SelectFieldHeader
            name="facility"
            placeholder="Facility"
            register={register}
            onChange={onFacilityChange}
            options={facilities.map((f) => ({
              label: f.name,
              value: f.id,
            }))}
          />

          <SelectFieldHeader
            name="ward"
            placeholder="Ward"
            register={register}  
            options={wards.map((w) => ({
              label: w.name,
              value: w.id,
            }))}
          />
        </div>
      </div>

      {/* ================= Users Table ================= */}
      <div className="bg-white py-3 mt-6 rounded-2xl border border-primary-100 space-y-6">
        <ManageUsersHeader
          total={totalUsers}
          openAdd={openAdd}
          search={search}
          onSearch={(value) => {
            setPage(1); // reset page on search
            setSearch(value);
          }}
          showAddUser={false}
        />

        <UsersTableDashBoard
          users={users}
          loading={usersLoading}
          onUserDeleted={handleUserDeleted}
          showDelete={false}
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
