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

const constituencySchema = z.object({
  countryId: z.string().min(1, 'Country is required'),
  provinceId: z.string().min(1, 'Province is required'),
  districtId: z.string().min(1, 'District is required'),
  constituency: z.string().trim().min(1, 'Constituency is required'),
});

const Constituency = () => {
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
    refreshList,
    fetchCountries,
    fetchConstituencies: fetchConstituenciesAction,
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
    resolver: zodResolver(constituencySchema),
    defaultValues: {
      countryId: '',
      provinceId: '',
      districtId: '',
      constituency: '',
      countryFilter: '',
      provinceFilter: '',
      districtFilter: '',
    },
  });

  const watchCountryId = watch('countryId');
  const watchProvinceId = watch('provinceId');

  const selectedCountryFilter = watch('countryFilter');
  const selectedProvinceFilter = watch('provinceFilter');
  const selectedDistrictFilter = watch('districtFilter');

  // Filter lists derived from global context
  const locations = getList('CONSTITUENCY', selectedDistrictFilter);
  const states = getList('PROVINCE', selectedCountryFilter);
  const districts = getList('DISTRICT', selectedProvinceFilter);

  const modalStates = getList('PROVINCE', watchCountryId);
  const modalDistricts = getList('DISTRICT', watchProvinceId);

  // Fetch logic for modal cascading
  useEffect(() => {
    if (watchCountryId) fetchStates(watchCountryId);
  }, [watchCountryId, fetchStates]);

  useEffect(() => {
    if (watchProvinceId) fetchDistricts(watchProvinceId);
  }, [watchProvinceId, fetchDistricts]);

  // ================= FETCH DATA =================
  const fetchConstituencies = useCallback(async () => {
    setLoading(true);
    try {
      await refreshList('CONSTITUENCY', selectedDistrictFilter);
    } catch (error) {
      console.error('Failed to fetch CONSTITUENCY', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDistrictFilter, refreshList]);

  // Initial Load - fetch countries
  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  // Initial Load - default country logic
  useEffect(() => {
    if (!selectedCountryFilter && countries.length > 0) {
      const zambia = countries.find((c) => c.name.toLowerCase() === 'zambia');
      if (zambia) {
        setValue('countryFilter', zambia.id);
        fetchStates(zambia.id);
      }
    }
  }, [countries, selectedCountryFilter, setValue, fetchStates]);

  // Cascading Logic for filters
  const onCountryFilterChange = async (e) => {
    const val = e.target.value;
    setValue('provinceFilter', '');
    setValue('districtFilter', '');
    if (val) await fetchStates(val);
  };

  const onProvinceFilterChange = async (e) => {
    const val = e.target.value;
    setValue('districtFilter', '');
    if (val) await fetchDistricts(val);
  };

  const onDistrictFilterChange = async (e) => {
    const val = e.target.value;
    if (val) await fetchConstituenciesAction(val);
  };

  useEffect(() => {
    fetchConstituencies();
  }, [fetchConstituencies]);

  const filteredLocations = (locations || []).filter((location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================= MODAL HANDLERS =================
  const openCreateModal = () => {
    setEditingLocation(null);
    reset({
      constituency: '',
      countryId: selectedCountryFilter || '',
      provinceId: selectedProvinceFilter || '',
      districtId: selectedDistrictFilter || '',
      countryFilter: selectedCountryFilter,
      provinceFilter: selectedProvinceFilter,
      districtFilter: selectedDistrictFilter,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (e, location) => {
    e.stopPropagation();
    setEditingLocation(location);

    const countryId =
      location.district?.province?.countryId || location.district?.province?.parentId || '';
    const provinceId = location.district?.province?.id || location.district?.parentId || '';

    reset({
      constituency: location.name,
      countryId: countryId,
      provinceId: provinceId,
      districtId: location.district?.id || '',
      countryFilter: selectedCountryFilter,
      provinceFilter: selectedProvinceFilter,
      districtFilter: selectedDistrictFilter,
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingLocation(null);
      reset({
        constituency: '',
        districtId: '',
        countryFilter: selectedCountryFilter,
        provinceFilter: selectedProvinceFilter,
        districtFilter: selectedDistrictFilter,
      });
    }, 0);
  };

  const openDeleteModal = (e, location) => {
    e.stopPropagation();
    setLocationToDelete(location);
    setDeleteModalOpen(true);
  };

  // ================= ADD / EDIT =================
  const onSubmit = async (data) => {
    const name = data.constituency.trim();

    const exists = locations.some(
      (loc) => loc.name.toLowerCase() === name.toLowerCase() && loc.id !== editingLocation?.id
    );

    if (exists) {
      setError('constituency', {
        type: 'manual',
        message: 'Constituency already exists',
      });
      return;
    }

    setCreating(true);
    try {
      if (editingLocation) {
        await locationService.updateLocation(editingLocation.id, {
          parentId: data.districtId,
          name,
          type: 'CONSTITUENCY',
        });
      } else {
        await locationService.createLocation({
          parentId: data.districtId,
          name,
          type: 'CONSTITUENCY',
        });
      }

      closeModal();
      fetchConstituencies(); // Refresh
    } catch (error) {
      console.error('Save failed', error);
      alert(error.response?.data?.message || 'Failed to save constituency');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!locationToDelete) return;

    try {
      await locationService.deleteLocation(locationToDelete.id, 'CONSTITUENCY');
      setDeleteModalOpen(false);
      setLocationToDelete(null);
      fetchConstituencies();
    } catch (error) {
      console.error('Delete failed', error);
      alert(error.response?.data?.message || 'Failed to delete constituency');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Card */}
      <div className="bg-white p-3 md:p-5 mt-4 rounded-2xl border border-primary-100">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          <SelectFieldHeader
            name="countryFilter"
            placeholder="Select Country"
            register={register}
            options={countries.map((c) => ({
              label: c.name,
              value: c.id,
            }))}
            onChange={onCountryFilterChange}
          />
          <SelectFieldHeader
            name="provinceFilter"
            placeholder="Select Province"
            register={register}
            options={states.map((s) => ({
              label: s.name,
              value: s.id,
            }))}
            onChange={onProvinceFilterChange}
          />
          <SelectFieldHeader
            name="districtFilter"
            placeholder="Select District"
            register={register}
            options={districts.map((d) => ({
              label: d.name,
              value: d.id,
            }))}
            onChange={onDistrictFilterChange}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 min-h-[calc(100vh-(--spacing(32)))]">
        <div className="relative mb-6 flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Constituency</h1>

          <div className="flex-1 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search constituency..."
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
              Add New Constituency
            </button>
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
                      <th className="px-6 py-4 font-medium">District</th>
                      <th className="px-6 py-4 font-medium">Constituency</th>
                      <th className="px-6 py-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#cfded6]">
                    {filteredLocations?.map((location) => (
                      <tr key={location.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-6 py-5">
                          <p className="font-medium text-gray-900">{location.district?.name}</p>
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
                    {locations.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                          {selectedDistrictFilter
                            ? 'No constituencies found'
                            : 'Select a District to view Constituencies'}
                        </td>
                      </tr>
                    )}
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
                    {isEditMode ? 'Edit Constituency' : 'Add New Constituency'}
                  </DialogTitle>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                      <div className="">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <select
                          {...register('countryId')}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        >
                          <option value="">Select Country</option>
                          {countries.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        {errors.countryId && (
                          <p className="mt-1 text-xs text-red-500">{errors.countryId.message}</p>
                        )}
                      </div>

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

                      <InputBox
                        name="constituency"
                        label="Constituency Name"
                        register={register}
                        placeholder="Enter Constituency Name"
                        error={errors.constituency}
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

export default Constituency;
