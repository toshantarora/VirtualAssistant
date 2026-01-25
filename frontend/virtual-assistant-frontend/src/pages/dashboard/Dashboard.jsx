import { useEffect, useState, useCallback } from "react";
import { User, UserCheck, UserX, Loader2 } from "lucide-react";

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
  const [province, setProvince] = useState("");
  const [consistuancy, setConsistuancy] = useState("");
  const [facility, setFacility] = useState("");
  const [ward, setWard] = useState("");const {
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
        reset,
      } = useForm({
        defaultValues: {
          province: "",
          consistuancy: "",
          facility: "",
          ward: "",
        },
      });

  /* ------------------ Stats State ------------------ */
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeLast7Days: 0,
    inactiveLast7Days: 0,
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
    setProvince(e.target.value)
    reset({ constituency: "", facility: "", ward: "" });
    await fetchConstituencies(e.target.value);
  };

  const onConstituencyChange = async (e) => {
    setConsistuancy(e.target.value)
    reset({ facility: "", ward: "" });
    await fetchFacilities(e.target.value);
  };

  const onFacilityChange = async (e) => {
    setFacility(e.target.value)
    reset({ ward: "" });
    await fetchWards(e.target.value);
  };

  const onWardChange = async (e) => {
    setWard(e.target.value)
  };

  /* ------------------ Fetch Stats ------------------ */
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await getDashboardStats({
        provinceId:watch("province"),
        constituencyId:watch("consistuancy"),
        facilityId:watch("facility"),
        wardId:watch("ward"),
      });
      setStats(res.data.data);
    } catch (err) {
      console.error("Dashboard stats error:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  /* ------------------ Fetch Users ------------------ */
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const res = await getUsers({
        page,
        limit,
        search,
        role: "USER",
        activeLast7Days: activeFilter === "active" ? true : undefined,
        inactiveLast7Days: activeFilter === "inactive" ? true : undefined,
        sortBy: "recent",
        provinceId:watch("province"),
        constituencyId:watch("consistuancy"),
        facilityId:watch("facility"),
        wardId:watch("ward"),
      });

      setUsers(res.data.data.users);
      setTotalUsers(res.data.data.total);
    } catch (err) {
      console.error("User fetch error:", err);
    } finally {
      setUsersLoading(false);
    }
  }, [page, limit, search, activeFilter]);

  /* ------------------ Effects ------------------ */
  useEffect(() => {
    fetchStats(); // once
  }, [fetchStats, province, consistuancy, facility, ward]);

  useEffect(() => {
    fetchUsers(); // on page/search change
  }, [fetchUsers, province, consistuancy, facility, ward]);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <SelectFieldHeader
              name="province"
              placeholder="Province"
              register={register}
              // error={errors.state}
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
              // error={errors.constituency}
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
              // error={errors.facility}
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
              // error={errors.ward}
              onChange={onWardChange}
              options={wards.map((w) => ({
                label: w.name,
                value: w.id,
              }))}
            />
          </div>

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
        />

        <UsersTableDashBoard
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
