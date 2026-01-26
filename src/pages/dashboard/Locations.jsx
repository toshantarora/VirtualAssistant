import { useState, useEffect } from "react";

import {
  ChevronRight,
  Folder,
  FolderOpen,
  Plus,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import locationService from "../../services/locationService";
import InputBox from "../../components/InputBox";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";

const LOCATION_HIERARCHY = ["PROVINCE", "CONSTITUENCY", "FACILITY", "WARD"];

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [breadcrumbs, setBreadcrumbs] = useState(() => {
    const stored = localStorage.getItem("locationBreadcrumbs");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("locationBreadcrumbs", JSON.stringify(breadcrumbs));
  }, [breadcrumbs]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm();

  const currentParentId =
    breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : undefined;
  const currentLevelIndex = breadcrumbs.length;
  const nextType = editingLocation
    ? editingLocation.type
    : currentLevelIndex < LOCATION_HIERARCHY.length
    ? LOCATION_HIERARCHY[currentLevelIndex]
    : null;

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const params = currentParentId
        ? { parentId: currentParentId }
        : { type: "PROVINCE" };
      const data = await locationService.getLocations(params);
      setLocations(data);
    } catch (error) {
      console.error("Failed to fetch locations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [currentParentId]);

  const handleLocationClick = (location) => {
    if (breadcrumbs.length < LOCATION_HIERARCHY.length - 1) {
      const minimalLocation = {
        id: location.id,
        name: location.name,
        type: location.type,
      };
      setBreadcrumbs([...breadcrumbs, minimalLocation]);
    }
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      setBreadcrumbs([]);
    } else {
      setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    }
  };

  const openCreateModal = () => {
    setEditingLocation(null);
    reset({ name: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (e, location) => {
    e.stopPropagation();
    setEditingLocation(location);
    setValue("name", location.name);
    setIsModalOpen(true);
  };

  const openDeleteModal = (e, location) => {
    e.stopPropagation();
    setLocationToDelete(location);
    setDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLocation(null);
    reset();
  };

  const onSubmit = async (data) => {
    const name = data.name.trim();

    // ✅ Prevent duplicate only on CREATE
    if (!editingLocation) {
      const exists = locations.some(
        (loc) => loc.name.trim().toLowerCase() === name.toLowerCase()
      );

      if (exists) {
        setError("name", {
          type: "manual",
          message: `${nextType} already exists`,
        });
        return;
      }
    }

    setCreating(true);
    try {
      if (editingLocation) {
        await locationService.updateLocation(editingLocation.id, { name });
      } else {
        await locationService.createLocation({
          name,
          type: nextType,
          parentId: currentParentId,
        });
      }

      closeModal();
      fetchLocations();
    } catch (error) {
      console.error("Save failed", error);
      alert(error.response?.data?.message || "Failed to save location");
    } finally {
      setCreating(false);
    }
  };
  const handleDeleteConfirm = async () => {
    if (!locationToDelete) return;
    try {
      await locationService.deleteLocation(locationToDelete.id);
      setDeleteModalOpen(false);
      fetchLocations();
    } catch (error) {
      console.error("Failed to delete location", error);
      alert(error.response?.data?.message || "Failed to delete location");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 min-h-[calc(100vh-(--spacing(32)))]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {breadcrumbs.length > 0
              ? breadcrumbs[breadcrumbs.length - 1].name
              : "Locations"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {breadcrumbs.length > 0
              ? `Manage ${breadcrumbs[
                  breadcrumbs.length - 1
                ].type.toLowerCase()} details`
              : "Manage geographical hierarchy"}
          </p>
        </div>
        {(nextType || editingLocation) && !editingLocation && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            Add {nextType?.charAt(0) + nextType?.slice(1).toLowerCase()}
          </button>
        )}
      </div>

      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg">
        <button
          onClick={() => handleBreadcrumbClick(-1)}
          className={`hover:text-primary font-medium ${
            breadcrumbs.length === 0 ? "text-primary" : ""
          }`}
        >
          All Provinces
        </button>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.id} className="flex items-center">
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            <button
              onClick={() => handleBreadcrumbClick(index)}
              className={`hover:text-primary font-medium ${
                index === breadcrumbs.length - 1 ? "text-primary" : ""
              }`}
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </nav>

      {/* Content */}
      <div className="mt-6">
        {breadcrumbs.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              {LOCATION_HIERARCHY[breadcrumbs.length]
                ? `${LOCATION_HIERARCHY[breadcrumbs.length]}`
                : "Details"}
            </h2>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {locations.length > 0 ? (
                  locations.map((location) => (
                    <tr
                      key={location.id}
                      onClick={() => handleLocationClick(location)}
                      className={`hover:bg-gray-50 transition-colors cursor-pointer group ${
                        breadcrumbs.length >= LOCATION_HIERARCHY.length - 1
                          ? "cursor-default"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            {breadcrumbs.length >=
                            LOCATION_HIERARCHY.length - 1 ? (
                              <MapPin size={20} />
                            ) : (
                              <FolderOpen size={20} />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {location.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => openEditModal(e, location)}
                            className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={(e) => openDeleteModal(e, location)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                          {breadcrumbs.length <
                            LOCATION_HIERARCHY.length - 1 && (
                            <span className="ml-2 text-primary hover:text-primary-dark cursor-pointer">
                              <ChevronRight size={20} />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Folder size={48} className="mb-3 opacity-20" />
                        <p>No locations found in this level.</p>
                        {nextType && (
                          <p className="text-sm mt-1">
                            Click "Add {nextType}" to create one.
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    {editingLocation
                      ? `Edit ${editingLocation.type.toLowerCase()}`
                      : `Add New ${nextType?.toLowerCase()}`}
                  </DialogTitle>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mt-2">
                      <InputBox
                        label="Name"
                        name="name"
                        register={register}
                        placeholder={`Enter name`}
                        error={errors.name}
                      />
                      {!editingLocation && currentParentId && (
                        <div className="mt-2 text-sm text-gray-500">
                          Parent:{" "}
                          <span className="font-medium">
                            {breadcrumbs[breadcrumbs.length - 1]?.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={creating}
                        className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {creating ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </form>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={deleteModalOpen} as="div">
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setDeleteModalOpen(false)}
        >
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

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-2"
                  >
                    Delete Location
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete{" "}
                      <span className="font-bold">
                        {locationToDelete?.name}
                      </span>
                      ? This action cannot be undone.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      onClick={() => setDeleteModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      onClick={handleDeleteConfirm}
                    >
                      Delete
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Locations;
