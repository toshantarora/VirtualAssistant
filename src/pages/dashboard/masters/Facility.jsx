import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import locationService from '../../../services/locationService';
import InputBox from '../../../components/InputBox';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal';
import { useLocations } from '../../../hooks/useLocations';
import SelectFieldHeader from '../../../components/SelectFieldHeader';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { DEFAULT_COUNTRY_ID } from '../../../constants/location';

const facilitySchema = z.object({
  countryId: z.string().min(1, 'Country is required'),
  provinceId: z.string().min(1, 'Province is required'),
  districtId: z.string().min(1, 'District is required'),
  constituencyId: z.string().min(1, 'Constituency is required'),
  wardId: z.string().min(1, 'Ward is required'),
  facility: z.string().trim().min(1, 'Facility is required'),
});

const Facility = () => {
  useDocumentTitle('Facilities', 'Manage healthcare facilities');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);

  const isEditMode = Boolean(editingLocation);

  // Filters (Main Page)
  const {
    countries,
    getList,
    fetchStates,
    fetchDistricts,
    fetchConstituencies,
    fetchWards,
    refreshList,
    fetchCountries,
    fetchFacilities: fetchFacilitiesAction,
  } = useLocations();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(facilitySchema),
    defaultValues: {
      countryId: DEFAULT_COUNTRY_ID,
      provinceId: '',
      districtId: '',
      constituencyId: '',
      wardId: '',
      facility: '',
      countryFilter: DEFAULT_COUNTRY_ID,
      provinceFilter: '',
      districtFilter: '',
      constituencyFilter: '',
      wardFilter: '',
    },
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

  // Global lists for filters
  const locations = getList('FACILITY', selectedWardFilter);
  const states = getList('PROVINCE', selectedCountryFilter);
  const districts = getList('DISTRICT', selectedProvinceFilter);
  const constituencies = getList('CONSTITUENCY', selectedDistrictFilter);
  const wards = getList('WARD', selectedConstituencyFilter);

  // Global lists for modal
  const modalStates = getList('PROVINCE', watchCountryId);
  const modalDistricts = getList('DISTRICT', watchProvinceId);
  const modalConstituencies = getList('CONSTITUENCY', watchDistrictId);
  const modalWards = getList('WARD', watchConstituencyId);

  // Fetch logic for modal cascading
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

  // ================= FETCH FACILITIES =================
  const fetchFacilitiesList = useCallback(async () => {
    setLoading(true);
    try {
      await refreshList('FACILITY', selectedWardFilter);
    } catch (error) {
      console.error('Failed to fetch facility', error);
    } finally {
      setLoading(false);
    }
  }, [selectedWardFilter, refreshList]);

  // Initial Load - fetch countries
  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  useEffect(() => {
    fetchStates(DEFAULT_COUNTRY_ID);
  }, [fetchStates]);

  // Cascading Logic for filters
  const onCountryFilterChange = async (e) => {
    const val = e.target.value;
    setValue('provinceFilter', '');
    setValue('districtFilter', '');
    setValue('constituencyFilter', '');
    setValue('wardFilter', '');
    if (val) await fetchStates(val);
  };

  const onProvinceFilterChange = async (e) => {
    const val = e.target.value;
    setValue('districtFilter', '');
    setValue('constituencyFilter', '');
    setValue('wardFilter', '');
    if (val) await fetchDistricts(val);
  };

  const onDistrictFilterChange = async (e) => {
    const val = e.target.value;
    setValue('constituencyFilter', '');
    setValue('wardFilter', '');
    if (val) await fetchConstituencies(val);
  };

  const onConstituencyFilterChange = async (e) => {
    const val = e.target.value;
    setValue('wardFilter', '');
    if (val) await fetchWards(val);
  };

  const onWardFilterChange = async (e) => {
    const val = e.target.value;
    if (val) await fetchFacilitiesAction(val);
  };

  useEffect(() => {
    fetchFacilitiesList();
  }, [fetchFacilitiesList]);

  const filteredLocations = (locations || []).filter((location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================= MODAL HANDLERS =================
  const openCreateModal = () => {
    setEditingLocation(null);
    reset({
      facility: '',
      countryId: selectedCountryFilter || '',
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

    // Parent hierarchy
    const countryId = location.ward?.constituency?.district?.province?.countryId || '';
    const provinceId = location.ward?.constituency?.district?.province?.id || '';
    const districtId = location.ward?.constituency?.district?.id || '';
    const constituencyId = location.ward?.constituency?.id || '';

    reset({
      facility: location.name,
      countryId: countryId,
      provinceId: provinceId,
      districtId: districtId,
      constituencyId: constituencyId,
      wardId: location.ward?.id || '',
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
        facility: '',
        wardId: '',
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

  // ================= ADD / EDIT FACILITY =================
  const onSubmit = async (data) => {
    const name = data.facility.trim();

    const exists = locations.some(
      (loc) => loc.name.toLowerCase() === name.toLowerCase() && loc.id !== editingLocation?.id
    );

    if (exists) {
      setError('facility', {
        type: 'manual',
        message: 'Facility already exists',
      });
      return;
    }

    setCreating(true);
    try {
      if (editingLocation) {
        await locationService.updateLocation(editingLocation.id, {
          parentId: data.wardId,
          name,
          type: 'FACILITY',
        });
      } else {
        await locationService.createLocation({
          parentId: data.wardId,
          name,
          type: 'FACILITY',
        });
      }

      closeModal();
      fetchFacilitiesList(); // Refresh list
    } catch (error) {
      console.error('Save failed', error);
      alert(error.response?.data?.message || 'Failed to save facility');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!locationToDelete) return;

    try {
      await locationService.deleteLocation(locationToDelete.id, 'FACILITY');
      setDeleteModalOpen(false);
      setLocationToDelete(null);
      fetchFacilitiesList();
    } catch (error) {
      console.error('Delete failed', error);
      alert(error.response?.data?.message || 'Failed to delete facility');
    }
  };

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-lg shadow-sm p-6 min-h-[calc(100vh-(--spacing(32)))]">
        <div className="relative mb-6 flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Facility</h1>

          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search facility..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary placeholder-gray-400 outline-none"
            />
          </div>

          <div className="ml-auto">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
            >
              <Plus size={18} />
              Add New Facility
            </button>
            <div className="mt-4 flex flex-wrap gap-4">
                <SelectFieldHeader
                    name="provinceFilter"
                    placeholder="Province"
                    register={register}
                    value={watch('provinceFilter')}
                    options={states.map((s) => ({
                    label: s.name,
                    value: s.id,
                    }))}
                    onChange={onProvinceFilterChange}
                />
                <SelectFieldHeader
                    name="districtFilter"
                    placeholder="District"
                    register={register}
                    value={watch('districtFilter')}
                    options={districts.map((d) => ({
                    label: d.name,
                    value: d.id,
                    }))}
                    onChange={onDistrictFilterChange}
                />
                <SelectFieldHeader
                    name="constituencyFilter"
                    placeholder="Constituency"
                    register={register}
                    value={watch('constituencyFilter')}
                    options={constituencies.map((c) => ({
                    label: c.name,
                    value: c.id,
                    }))}
                    onChange={onConstituencyFilterChange}
                />
                <SelectFieldHeader
                    name="wardFilter"
                    placeholder="Ward"
                    register={register}
                    value={watch('wardFilter')}
                    options={wards.map((w) => ({
                    label: w.name,
                    value: w.id,
                    }))}
                    onChange={onWardFilterChange}
                />
            </div>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="flex h-full border border-primary-100 flex-col overflow-hidden rounded-xl bg-white">
              <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 z-10 bg-[#f6f8f5] text-left shadow-sm">
                    <tr>
                      <th className="px-6 py-4 font-medium">Ward</th>
                      <th className="px-6 py-4 font-medium">Facility</th>
                      <th className="px-6 py-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#cfded6]">
                    {filteredLocations?.map((location) => (
                      <tr key={location.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-6 py-5">
                          <p className="font-medium text-gray-900">{location.ward?.name}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-medium text-gray-900">{location.name}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-4">
                            <button
                              onClick={(e) => openEditModal(e, location)}
                              className="text-gray-500 hover:text-green-700"
                              title="Edit"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={(e) => openDeleteModal(e, location)}
                              className="text-gray-500 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {locations.length === 0 && (<tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                          {selectedWardFilter
                            ? 'No facilities found'
                            : 'Select a Ward to view Facilities'}
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Location"
          description={
            <>
              Are you sure you want to delete{' '}
              <span className="font-bold">{locationToDelete?.name}</span>?
            </>
          }
        />

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
              <div className="fixed inset-0 bg-black/25" />
            </TransitionChild>

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <TransitionChild
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                  <DialogTitle className="text-lg font-medium mb-4">
                    {isEditMode ? 'Edit Facility' : 'Add New Facility'}
                  </DialogTitle>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">

                      <div className="">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Province
                        </label>
                        <select
                          {...register('provinceId')}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-100"
                          disabled={!watchCountryId}
                        >
                          <option value="">Select Province</option>
                          {modalStates.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        {errors.provinceId && (
                          <p className="mt-1 text-xs text-red-500">{errors.provinceId.message}</p>
                        )}
                      </div>

                      <div className="">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          District
                        </label>
                        <select
                          {...register('districtId')}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-100"
                          disabled={!watchProvinceId}
                        >
                          <option value="">Select District</option>
                          {modalDistricts.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                        {errors.districtId && (
                          <p className="mt-1 text-xs text-red-500">{errors.districtId.message}</p>
                        )}
                      </div>

                      <div className="">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Constituency
                        </label>
                        <select
                          {...register('constituencyId')}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-100"
                          disabled={!watchDistrictId}
                        >
                          <option value="">Select Constituency</option>
                          {modalConstituencies.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        {errors.constituencyId && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.constituencyId.message}
                          </p>
                        )}
                      </div>

                      <div className="">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
                        <select
                          {...register('wardId')}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:bg-gray-100"
                          disabled={!watchConstituencyId}
                        >
                          <option value="">Select Ward</option>
                          {modalWards.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.name}
                            </option>
                          ))}
                        </select>
                        {errors.wardId && (
                          <p className="mt-1 text-xs text-red-500">{errors.wardId.message}</p>
                        )}
                      </div>
                      <InputBox
                        name="facility"
                        label="Facility Name"
                        register={register}
                        placeholder="Enter Facility Name"
                        error={errors.facility}
                      />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="border px-4 py-2 rounded-md text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={creating}
                        className="bg-primary text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
                      >
                        {creating ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
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

export default Facility;
