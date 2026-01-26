import { useEffect, useState, useCallback } from 'react';
import ManageUsersHeader from '../../components/ManageUsersHeader';
import UsersTable from '../../components/UsersTable';
import Pagination from '../../components/Pagination';
import UserModal from '../../components/UserModal';
import { getUsers } from '../../services/dashboardService';
import { useLocations } from '../../hooks/useLocations';
import { useForm } from 'react-hook-form';
import SelectFieldHeader from '../../components/SelectFieldHeader';

const Users = () => {
  /* ------------------ Modal State ------------------ */
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);

  /* ------------------ Users State ------------------ */
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ------------------ Pagination & Search ------------------ */
  const [page, setPage] = useState(1);
  const limit = 6;
  const [search, setSearch] = useState('');

  /* ------------------ Locations ------------------ */
  const {
    getList,
    fetchCountries,
    fetchStates,
    fetchDistricts,
    fetchConstituencies,
    fetchWards,
    fetchFacilities,
  } = useLocations();

  const { watch, register, setValue } = useForm({
    defaultValues: {
      country: '',
      province: '',
      district: '',
      constituency: '',
      ward: '',
      facility: '',
    },
  });

  const selectedCountry = watch('country');
  const selectedProvince = watch('province');
  const selectedDistrict = watch('district');
  const selectedConstituency = watch('constituency');
  const selectedWard = watch('ward');
  const selectedFacility = watch('facility');

  const countries = getList('COUNTRY');
  const states = getList('PROVINCE', selectedCountry);
  const districts = getList('DISTRICT', selectedProvince);
  const constituencies = getList('CONSTITUENCY', selectedDistrict);
  const wards = getList('WARD', selectedConstituency);
  const facilities = getList('FACILITY', selectedWard);

  /* ------------------ Filtering State ------------------ */
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'pending', 'archived'

  /* ------------------ Fetch Init ------------------ */
  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  /* ------------------ Select Handlers ------------------ */
  const onCountryChange = async (e) => {
    const val = e.target.value;
    setValue('province', '');
    setValue('district', '');
    setValue('constituency', '');
    setValue('ward', '');
    setValue('facility', '');
    if (val) await fetchStates(val);
  };

  const onStateChange = async (e) => {
    const val = e.target.value;
    setValue('district', '');
    setValue('constituency', '');
    setValue('ward', '');
    setValue('facility', '');
    if (val) await fetchDistricts(val);
  };

  const onDistrictChange = async (e) => {
    const val = e.target.value;
    setValue('constituency', '');
    setValue('ward', '');
    setValue('facility', '');
    if (val) await fetchConstituencies(val);
  };

  const onConstituencyChange = async (e) => {
    const val = e.target.value;
    setValue('ward', '');
    setValue('facility', '');
    if (val) await fetchWards(val);
  };

  const onWardChange = async (e) => {
    const val = e.target.value;
    setValue('facility', '');
    if (val) await fetchFacilities(val);
  };

  const openAdd = () => {
    setMode('add');
    setSelectedUser(null);
    setOpen(true);
  };

  const openEdit = (user) => {
    setMode('edit');
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
        role: 'USER',
        status:
          activeFilter === 'all'
            ? undefined
            : activeFilter === 'pending'
              ? 'PENDING'
              : activeFilter === 'archived'
                ? 'ARCHIVED'
                : undefined,
        countryId: selectedCountry,
        provinceId: selectedProvince,
        districtId: selectedDistrict,
        constituencyId: selectedConstituency,
        wardId: selectedWard,
        facilityId: selectedFacility,
      });

      setUsers(res.data.data.users);
      setTotalUsers(res.data.data.total);
    } catch (err) {
      console.error('User fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    search,
    activeFilter,
    selectedCountry,
    selectedProvince,
    selectedDistrict,
    selectedConstituency,
    selectedWard,
    selectedFacility,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserDeleted = async () => {
    fetchUsers();
  };

  return (
    <>
      {/* ================= Location Filters ================= */}
      <div className="bg-white p-3 md:p-5 mt-4 md:mt-8 rounded-2xl border border-primary-100">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          <SelectFieldHeader
            name="country"
            placeholder="Country"
            register={register}
            onChange={onCountryChange}
            options={countries.map((c) => ({
              label: c.name,
              value: c.id,
            }))}
          />

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
            name="district"
            placeholder="District"
            register={register}
            onChange={onDistrictChange}
            options={districts.map((d) => ({
              label: d.name,
              value: d.id,
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
            name="ward"
            placeholder="Ward"
            register={register}
            onChange={onWardChange}
            options={wards.map((w) => ({
              label: w.name,
              value: w.id,
            }))}
          />

          <SelectFieldHeader
            name="facility"
            placeholder="Facility"
            register={register}
            options={facilities.map((f) => ({
              label: f.name,
              value: f.id,
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
              onClick={() => {
                setActiveFilter(filter);
                setPage(1);
              }}
              className={`pb-3 px-1 text-sm font-medium capitalize transition-colors border-b-2 ${
                activeFilter === filter
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
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
