import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import locationService from '../../../services/locationService';
import InputBox from '../../../components/InputBox';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal';
import { useLocations } from '../../../hooks/useLocations';

const Country = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);
  const isEditMode = Boolean(editingLocation);

  const { countries: locations, refreshList } = useLocations();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm();

  // ================= FETCH COUNTRIES =================
  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      await refreshList('COUNTRY');
    } catch (error) {
      console.error('Failed to fetch countries', error);
    } finally {
      setLoading(false);
    }
  }, [refreshList]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const filteredLocations = (locations || []).filter((location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================= MODAL HANDLERS =================
  const openCreateModal = () => {
    setEditingLocation(null);
    reset({ name: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (e, location) => {
    e.stopPropagation();
    setEditingLocation(location);
    setValue('name', location.name);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingLocation(null);
      reset({ name: '' });
    }, 0);
  };

  const openDeleteModal = (e, location) => {
    e.stopPropagation();
    setLocationToDelete(location);
    setDeleteModalOpen(true);
  };

  // ================= ADD / EDIT COUNTRY =================
  const onSubmit = async (data) => {
    const name = data.name.trim();

    // Prevent duplicate Country names
    const exists = locations.some(
      (loc) => loc.name.toLowerCase() === name.toLowerCase() && loc.id !== editingLocation?.id
    );

    if (exists) {
      setError('name', {
        type: 'manual',
        message: 'Country already exists',
      });
      return;
    }

    setCreating(true);
    try {
      if (editingLocation) {
        await locationService.updateLocation(editingLocation.id, {
          name,
          type: 'COUNTRY',
        });
      } else {
        await locationService.createLocation({
          name,
          type: 'COUNTRY',
        });
      }

      closeModal();
      await fetchLocations();
    } catch (error) {
      console.error('Save failed', error);
      alert(error.response?.data?.message || 'Failed to save country');
    } finally {
      setCreating(false);
    }
  };

  // ================= DELETE COUNTRY =================
  const handleDeleteConfirm = async () => {
    if (!locationToDelete) return;

    try {
      await locationService.deleteLocation(locationToDelete.id, 'COUNTRY');

      setDeleteModalOpen(false);
      setLocationToDelete(null);
      fetchLocations();
    } catch (error) {
      console.error('Delete failed', error);
      alert(error.response?.data?.message || 'Failed to delete country');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 min-h-[calc(100vh-(--spacing(32)))]">
      <div className="relative mb-6 flex flex-wrap items-center gap-4">
        {/* Left: Title */}
        <h1 className="text-2xl font-bold text-gray-800">Country</h1>

        {/* Center: Search */}
        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm
                 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary
                 placeholder-gray-400 outline-none"
          />
        </div>

        {/* Right: Button */}
        <div className="ml-auto">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white
                 hover:bg-primary/90"
          >
            <Plus size={18} />
            Add New Country
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="flex h-full border border-primary-100 flex-col overflow-hidden rounded-xl bg-white">
            <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
              <table className="w-full  border-collapse text-sm">
                <thead className="sticky top-0 z-10 bg-[#f6f8f5] text-left shadow-sm">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#cfded6]">
                  {filteredLocations?.map((location) => (
                    <tr key={location.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-gray-900">{location.name}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-4">
                          <button
                            onClick={(e) => openEditModal(e, location)}
                            className="text-gray-500 transition-colors hover:text-green-700"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={(e) => openDeleteModal(e, location)}
                            className="text-gray-500 transition-colors hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {locations.length === 0 && (<tr>
                      <td colSpan={2} className="px-6 py-12 text-center text-gray-500">
                        No countries found
                      </td>
                    </tr>)}
                  {filteredLocations.length === 0 && locations.length > 0 && (<tr>
                      <td colSpan={2} className="px-6 py-12 text-center text-gray-500">
                        No matching countries found
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
            <span className="font-bold">{locationToDelete?.name}</span>? This action cannot be
            undone.
          </>
        }
      />
      {/* Add/Edit Location Modal */}
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
                  {isEditMode ? 'Edit Country' : 'Add New Country'}
                </DialogTitle>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <InputBox
                    label="Country Name"
                    name="name"
                    register={register}
                    placeholder="Enter country name"
                    error={errors.name}
                  />

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
  );
};

export default Country;
