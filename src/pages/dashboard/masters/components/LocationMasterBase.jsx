import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Plus, Pencil, Trash2, Search, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import locationService from '../../../../services/locationService';
import InputBox from '../../../../components/InputBox';
import SelectField from '../../../../components/SelectField';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import ConfirmDeleteModal from '../../../../components/ConfirmDeleteModal';
import { useLocations } from '../../../../hooks/useLocations';
import SelectFieldHeader from '../../../../components/SelectFieldHeader';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDocumentTitle } from '../../../../hooks/useDocumentTitle';
import { DEFAULT_COUNTRY_ID } from '../../../../constants/location';
import Pagination from '../../../../components/Pagination';
import ImportProgressModal from './ImportProgressModal';

const LEVELS = ['COUNTRY', 'PROVINCE', 'DISTRICT', 'CONSTITUENCY', 'WARD', 'FACILITY'];

const LocationMasterBase = ({
  type,
  title,
  description,
  searchPlaceholder,
  schema,
  itemName, // the field name for the current level in the form
  itemLabel, // the label for the current level in the form/table
}) => {
  useDocumentTitle(title, description);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [locations, setLocations] = useState([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);

  // Import State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importJobId, setImportJobId] = useState(null);
  const fileInputRef = useRef(null);

  const isEditMode = Boolean(editingLocation);
  const typeIndex = LEVELS.indexOf(type);

  const {
    countries,
    getList,
    fetchStates,
    fetchDistricts,
    fetchConstituencies,
    fetchWards,
    fetchCountries,
  } = useLocations();

  const defaultValues = useMemo(() => {
    const vals = {
      countryId: DEFAULT_COUNTRY_ID,
      provinceId: '',
      districtId: '',
      constituencyId: '',
      wardId: '',
      [itemName]: '',
      countryFilter: DEFAULT_COUNTRY_ID,
      provinceFilter: '',
      districtFilter: '',
      constituencyFilter: '',
      wardFilter: '',
    };
    return vals;
  }, [itemName]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const watchCountryId = watch('countryId');
  const watchProvinceId = watch('provinceId');
  const watchDistrictId = watch('districtId');
  const watchConstituencyId = watch('constituencyId');

  const selectedCountryFilter = watch('countryFilter');
  const selectedProvinceFilter = watch('provinceFilter');
  const selectedDistrictFilter = watch('districtFilter');
  const selectedConstituencyFilter = watch('constituencyFilter');
  const selectedWardFilter = watch('wardFilter');

  // Lists for filters/modals
  const states = getList('PROVINCE', selectedCountryFilter);
  const districts = getList('DISTRICT', selectedProvinceFilter);
  const constituencies = getList('CONSTITUENCY', selectedDistrictFilter);
  const wards = getList('WARD', selectedConstituencyFilter);

  const modalStates = getList('PROVINCE', watchCountryId);
  const modalDistricts = getList('DISTRICT', watchProvinceId);
  const modalConstituencies = getList('CONSTITUENCY', watchDistrictId);
  const modalWards = getList('WARD', watchConstituencyId);

  // ================= FETCH DATA =================
  const fetchData = useCallback(
    async (overrides = {}) => {
      setLoading(true);
      try {
        const searchVal = overrides.search !== undefined ? overrides.search : appliedSearch;
        const pageVal = overrides.page !== undefined ? overrides.page : page;

        const res = await locationService.searchLocations({
          type,
          countryId: selectedCountryFilter,
          provinceId: selectedProvinceFilter,
          districtId: selectedDistrictFilter,
          constituencyId: selectedConstituencyFilter,
          wardId: selectedWardFilter,
          search: searchVal,
          page: pageVal,
          limit,
          populateHierarchy: true,
        });
        setLocations(res.items || []);
        setTotal(res.meta?.total || 0);
      } catch (error) {
        console.error(`Failed to fetch ${type}`, error);
      } finally {
        setLoading(false);
      }
    },
    [
      type,
      selectedCountryFilter,
      selectedProvinceFilter,
      selectedDistrictFilter,
      selectedConstituencyFilter,
      selectedWardFilter,
      appliedSearch,
      page,
      limit,
    ]
  );

  // Initial Load
  useEffect(() => {
    fetchCountries();
    if (DEFAULT_COUNTRY_ID) fetchStates(DEFAULT_COUNTRY_ID);
  }, [fetchCountries, fetchStates]);

  // Cascading fetches for modal
  useEffect(() => {
    if (watchCountryId) fetchStates(watchCountryId);
  }, [watchCountryId, fetchStates]);
  useEffect(() => {
    if (watchProvinceId) fetchDistricts(watchProvinceId);
  }, [watchProvinceId, fetchDistricts]);
  useEffect(() => {
    if (watchDistrictId) fetchConstituencies(watchDistrictId);
  }, [watchDistrictId, fetchConstituencies]);
  useEffect(() => {
    if (watchConstituencyId) fetchWards(watchConstituencyId);
  }, [watchConstituencyId, fetchWards]);
  useEffect(() => {
    if (searchTerm == '') setAppliedSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchClick = () => {
    setAppliedSearch(searchTerm);
    setPage(1);
  };

  // ================= IMPORT HANDLER =================
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const res = await locationService.importLocations(formData);
      setImportJobId(res.jobId);
      setImportModalOpen(true);
    } catch (error) {
      console.error('Import failed', error);
      alert(error.response?.data?.message || 'Failed to initiate import');
    } finally {
      setLoading(false);
    }
  };

  const handleImportComplete = useCallback(() => {
    // Refresh data after import
    fetchData();
  }, [fetchData]);

  // ================= MODAL HANDLERS =================
  const openCreateModal = () => {
    setEditingLocation(null);
    reset({
      ...defaultValues,
      countryId: selectedCountryFilter || DEFAULT_COUNTRY_ID,
      provinceId: selectedProvinceFilter || '',
      districtId: selectedDistrictFilter || '',
      constituencyId: selectedConstituencyFilter || '',
      wardId: selectedWardFilter || '',
      countryFilter: selectedCountryFilter,
      provinceFilter: selectedProvinceFilter,
      districtFilter: selectedDistrictFilter,
      constituencyFilter: selectedConstituencyFilter,
      wardFilter: selectedWardFilter,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (e, location) => {
    e.stopPropagation();
    setEditingLocation(location);

    // Parent hierarchy extraction
    // This part is tricky because paths vary. We can use a helper or just check what's available.
    // For Facility: location.ward.constituency.district.province.country
    // For Ward: location.constituency.district.province.country

    let wardId = '',
      constituencyId = '',
      districtId = '',
      provinceId = '',
      countryId = '';

    if (type === 'FACILITY') {
      wardId = location.ward?.id || '';
      constituencyId = location.ward?.constituency?.id || '';
      districtId = location.ward?.constituency?.district?.id || '';
      provinceId = location.ward?.constituency?.district?.province?.id || '';
      countryId =
        location.ward?.constituency?.district?.province?.countryId ||
        location.ward?.constituency?.district?.province?.country?.id ||
        '';
    } else if (type === 'WARD') {
      constituencyId = location.constituency?.id || '';
      districtId = location.constituency?.district?.id || '';
      provinceId = location.constituency?.district?.province?.id || '';
      countryId =
        location.constituency?.district?.province?.countryId ||
        location.constituency?.district?.province?.country?.id ||
        '';
    } else if (type === 'CONSTITUENCY') {
      districtId = location.district?.id || '';
      provinceId = location.district?.province?.id || '';
      countryId =
        location.district?.province?.countryId || location.district?.province?.country?.id || '';
    } else if (type === 'DISTRICT') {
      provinceId = location.province?.id || '';
      countryId = location.province?.countryId || location.province?.country?.id || '';
    } else if (type === 'PROVINCE') {
      countryId = location.countryId || location.country?.id || '';
    }

    reset({
      [itemName]: location.name,
      countryId,
      provinceId,
      districtId,
      constituencyId,
      wardId,
      countryFilter: selectedCountryFilter,
      provinceFilter: selectedProvinceFilter,
      districtFilter: selectedDistrictFilter,
      constituencyFilter: selectedConstituencyFilter,
      wardFilter: selectedWardFilter,
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingLocation(null);
      reset({
        ...defaultValues,
        countryFilter: selectedCountryFilter,
        provinceFilter: selectedProvinceFilter,
        districtFilter: selectedDistrictFilter,
        constituencyFilter: selectedConstituencyFilter,
        wardFilter: selectedWardFilter,
      });
    }, 0);
  };

  const openDeleteModal = (e, location) => {
    e.stopPropagation();
    setLocationToDelete(location);
    setDeleteModalOpen(true);
  };

  const onSubmit = async (data) => {
    const name = data[itemName].trim();
    // parentId is the immediate parent
    let parentId = '';
    if (type === 'FACILITY') parentId = data.wardId;
    else if (type === 'WARD') parentId = data.constituencyId;
    else if (type === 'CONSTITUENCY') parentId = data.districtId;
    else if (type === 'DISTRICT') parentId = data.provinceId;
    else if (type === 'PROVINCE') parentId = data.countryId;
    // COUNTRY has no parent (or null)

    setCreating(true);
    try {
      if (editingLocation) {
        await locationService.updateLocation(editingLocation.id, {
          parentId,
          name,
          type,
        });
        closeModal();
        fetchData(); // Use current filters for updates
      } else {
        await locationService.createLocation({
          parentId,
          name,
          type,
        });
        // On successful creation, clear search and reset to first page to show the new item
        setSearchTerm('');
        setAppliedSearch('');
        setPage(1);
        closeModal();
        // FORCE the refetch with cleared values immediately, as state updates are async
        fetchData({ page: 1, search: '' });
      }
    } catch (error) {
      console.error('Save failed', error);
      alert(error.response?.data?.message || 'Failed to save location');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!locationToDelete) return;
    try {
      await locationService.deleteLocation(locationToDelete.id, type);
      setDeleteModalOpen(false);
      setLocationToDelete(null);
      fetchData();
    } catch (error) {
      console.error('Delete failed', error);
      alert(error.response?.data?.message || 'Failed to delete location');
    }
  };

  // ================= UI HELPERS =================
  const showFilter = (lvl) => typeIndex > LEVELS.indexOf(lvl);

  return (
    <div className="space-y-6">
      <ImportProgressModal
        key={importJobId}
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        jobId={importJobId}
        onComplete={handleImportComplete}
      />
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".csv"
        onChange={handleFileChange}
      />

      {/* ================= Filters Card ================= */}
      {typeIndex > 1 && (
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-primary-100 shadow-sm">
          {/* <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">
            Filters & Search
          </label> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            {showFilter('PROVINCE') && (
              <div className="lg:col-span-3">
                {/* <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">
                  Province
                </label> */}
                <SelectFieldHeader
                  name="provinceFilter"
                  placeholder="Provinces"
                  register={register}
                  value={selectedProvinceFilter}
                  options={states.map((s) => ({ label: s.name, value: s.id }))}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setValue('provinceFilter', val);
                    setValue('districtFilter', '');
                    setValue('constituencyFilter', '');
                    setValue('wardFilter', '');
                    if (val) await fetchDistricts(val);
                  }}
                />
              </div>
            )}

            {showFilter('DISTRICT') && (
              <div className="lg:col-span-3">
                {/* <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">
                  District
                </label> */}
                <SelectFieldHeader
                  name="districtFilter"
                  placeholder="Districts"
                  register={register}
                  value={selectedDistrictFilter}
                  options={districts.map((d) => ({ label: d.name, value: d.id }))}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setValue('districtFilter', val);
                    setValue('constituencyFilter', '');
                    setValue('wardFilter', '');
                    if (val) await fetchConstituencies(val);
                  }}
                />
              </div>
            )}

            {showFilter('CONSTITUENCY') && (
              <div className="lg:col-span-3">
                {/* <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">
                  Constituency
                </label> */}
                <SelectFieldHeader
                  name="constituencyFilter"
                  placeholder="Constituencies"
                  register={register}
                  value={selectedConstituencyFilter}
                  options={constituencies.map((c) => ({ label: c.name, value: c.id }))}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setValue('constituencyFilter', val);
                    setValue('wardFilter', '');
                    if (val) await fetchWards(val);
                  }}
                />
              </div>
            )}

            {showFilter('WARD') && (
              <div className="lg:col-span-3">
                {/* <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">
                  Ward
                </label> */}
                <SelectFieldHeader
                  name="wardFilter"
                  placeholder="Wards"
                  register={register}
                  value={selectedWardFilter}
                  options={wards.map((w) => ({ label: w.name, value: w.id }))}
                  onChange={(e) => setValue('wardFilter', e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= Content Card ================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-primary-100 p-6 min-h-[500px]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
              <p className="text-sm text-gray-500">{description}</p>
            </div>

            <div className="relative max-w-sm flex-1">
              {/* <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">
                {searchPlaceholder}
              </label> */}
              <div className="relative">
                <InputBox
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                />
                <button
                  onClick={handleSearchClick}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  <Search size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {type === 'FACILITY' && (
              <button
                onClick={handleImportClick}
                className="flex items-center gap-2 rounded-lg bg-white border border-gray-300 px-4 py-2.5 text-gray-700 font-bold hover:bg-gray-50 transition-all shadow-sm"
              >
                <Upload size={18} />
                Import
              </button>
            )}
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-white font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
            >
              <Plus size={18} />
              Add New {type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="flex h-full border border-primary-100 flex-col overflow-hidden rounded-xl bg-white shadow-sm font-inter">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-[#f6f8f5] text-left">
                      <tr>
                        {/* {typeIndex === 1 && (
                          <th className="px-6 py-4 font-semibold text-gray-700 uppercase tracking-wider">
                            Country
                          </th>
                        )} */}
                        {typeIndex >= 2 && (
                          <th className="px-6 py-4 font-semibold text-gray-700 uppercase tracking-wider">
                            Province
                          </th>
                        )}
                        {typeIndex >= 3 && (
                          <th className="px-6 py-4 font-semibold text-gray-700 uppercase tracking-wider">
                            District
                          </th>
                        )}
                        {typeIndex >= 4 && (
                          <th className="px-6 py-4 font-semibold text-gray-700 uppercase tracking-wider">
                            Constituency
                          </th>
                        )}
                        {typeIndex >= 5 && (
                          <th className="px-6 py-4 font-semibold text-gray-700 uppercase tracking-wider">
                            Ward
                          </th>
                        )}
                        <th className="px-6 py-4 font-semibold text-gray-700 uppercase tracking-wider">
                          {itemLabel}
                        </th>
                        <th className="px-6 py-4 font-semibold text-gray-700 uppercase tracking-wider text-right">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#cfded6]">
                      {locations?.map((location) => {
                        // Hierarchy access helper
                        const getHierarchyName = (lvl) => {
                          if (lvl === 'COUNTRY') {
                            return (
                              location.country?.name ||
                              location.province?.country?.name ||
                              location.district?.province?.country?.name ||
                              location.constituency?.district?.province?.country?.name ||
                              location.ward?.constituency?.district?.province?.country?.name ||
                              '-'
                            );
                          }
                          if (lvl === 'PROVINCE') {
                            return (
                              location.province?.name ||
                              location.district?.province?.name ||
                              location.constituency?.district?.province?.name ||
                              location.ward?.constituency?.district?.province?.name ||
                              '-'
                            );
                          }
                          if (lvl === 'DISTRICT') {
                            return (
                              location.district?.name ||
                              location.constituency?.district?.name ||
                              location.ward?.constituency?.district?.name ||
                              '-'
                            );
                          }
                          if (lvl === 'CONSTITUENCY') {
                            return (
                              location.constituency?.name ||
                              location.ward?.constituency?.name ||
                              '-'
                            );
                          }
                          if (lvl === 'WARD') {
                            return location.ward?.name || '-';
                          }
                          return '-';
                        };

                        return (
                          <tr key={location.id} className="transition-colors hover:bg-gray-50/50">
                            {/* {typeIndex === 1 && (
                              <td className="px-6 py-4 border-r border-[#cfded6]/30 text-gray-900 font-medium">
                                {getHierarchyName('COUNTRY')}
                              </td>
                            )} */}
                            {typeIndex >= 2 && (
                              <td className="px-6 py-4 border-r border-[#cfded6]/30 text-gray-900 font-medium">
                                {getHierarchyName('PROVINCE')}
                              </td>
                            )}
                            {typeIndex >= 3 && (
                              <td className="px-6 py-4 border-r border-[#cfded6]/30 text-gray-900 font-medium">
                                {getHierarchyName('DISTRICT')}
                              </td>
                            )}
                            {typeIndex >= 4 && (
                              <td className="px-6 py-4 border-r border-[#cfded6]/30 text-gray-900 font-medium">
                                {getHierarchyName('CONSTITUENCY')}
                              </td>
                            )}
                            {typeIndex >= 5 && (
                              <td className="px-6 py-4 border-r border-[#cfded6]/30 text-gray-900 font-medium">
                                {getHierarchyName('WARD')}
                              </td>
                            )}
                            <td className="px-6 py-4 font-semibold text-primary">
                              {location.name}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-3">
                                <button
                                  onClick={(e) => openEditModal(e, location)}
                                  className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Pencil size={18} />
                                </button>
                                <button
                                  onClick={(e) => openDeleteModal(e, location)}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {locations.length === 0 && (
                        <tr>
                          <td
                            colSpan={typeIndex + 2}
                            className="px-6 py-16 text-center text-gray-500"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Search size={40} className="text-gray-300" />
                              <p>No results found matching your criteria</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Pagination
                  currentPage={page}
                  totalItems={total}
                  itemsPerPage={limit}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </div>

        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title={`Delete ${itemLabel}`}
          description={
            <>
              Are you sure you want to delete {itemLabel.toLowerCase()}{' '}
              <span className="font-bold text-red-600">{locationToDelete?.name}</span>? This action
              cannot be undone.
            </>
          }
        />

        {/* ================= Modal ================= */}
        <Transition appear show={isModalOpen} as="div">
          <Dialog as="div" className="relative z-50" onClose={closeModal}>
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            </TransitionChild>

            <div className="fixed inset-0 flex items-center justify-center p-4 font-inter">
              <TransitionChild
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
                  <DialogTitle className="text-xl font-bold text-gray-900 mb-6 font-primary">
                    {isEditMode ? `Edit ${itemLabel}` : `Add New ${itemLabel}`}
                  </DialogTitle>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                      {/* Cascading selects for modal */}
                      {typeIndex >= 1 && (
                        <div className="hidden">
                          <SelectField
                            name="countryId"
                            label="Country"
                            register={register}
                            error={errors.countryId}
                            value={watchCountryId}
                            onChange={(e) => {
                              const val = e.target.value;
                              setValue('countryId', val);
                              setValue('provinceId', '');
                              setValue('districtId', '');
                              setValue('constituencyId', '');
                              setValue('wardId', '');
                              if (val) fetchStates(val);
                            }}
                            options={countries.map((c) => ({ label: c.name, value: c.id }))}
                          />
                        </div>
                      )}

                      {typeIndex >= 2 && (
                        <SelectField
                          name="provinceId"
                          label="Province"
                          placeholder="Select Province"
                          register={register}
                          error={errors.provinceId}
                          value={watchProvinceId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setValue('provinceId', val);
                            setValue('districtId', '');
                            setValue('constituencyId', '');
                            setValue('wardId', '');
                            if (val) fetchDistricts(val);
                          }}
                          disabled={!watchCountryId}
                          options={modalStates.map((s) => ({ label: s.name, value: s.id }))}
                        />
                      )}

                      {typeIndex >= 3 && (
                        <SelectField
                          name="districtId"
                          label="District"
                          placeholder="Select District"
                          register={register}
                          error={errors.districtId}
                          value={watchDistrictId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setValue('districtId', val);
                            setValue('constituencyId', '');
                            setValue('wardId', '');
                            if (val) fetchConstituencies(val);
                          }}
                          disabled={!watchProvinceId}
                          options={modalDistricts.map((d) => ({ label: d.name, value: d.id }))}
                        />
                      )}

                      {typeIndex >= 4 && (
                        <SelectField
                          name="constituencyId"
                          label="Constituency"
                          placeholder="Select Constituency"
                          register={register}
                          error={errors.constituencyId}
                          value={watchConstituencyId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setValue('constituencyId', val);
                            setValue('wardId', '');
                            if (val) fetchWards(val);
                          }}
                          disabled={!watchDistrictId}
                          options={modalConstituencies.map((c) => ({ label: c.name, value: c.id }))}
                        />
                      )}

                      {typeIndex >= 5 && (
                        <SelectField
                          name="wardId"
                          label="Ward"
                          placeholder="Select Ward"
                          register={register}
                          error={errors.wardId}
                          value={watch('wardId')}
                          disabled={!watchConstituencyId}
                          options={modalWards.map((w) => ({ label: w.name, value: w.id }))}
                        />
                      )}

                      <InputBox
                        name={itemName}
                        label={`${itemLabel} Name`}
                        register={register}
                        placeholder={`e.g. ${itemLabel}...`}
                        error={errors[itemName]}
                      />
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={creating}
                        className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 disabled:opacity-50 transition-all"
                      >
                        {creating ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </form>
                </DialogPanel>
              </TransitionChild>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
};

export default LocationMasterBase;
