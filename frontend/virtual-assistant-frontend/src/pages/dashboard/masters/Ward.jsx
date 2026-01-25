/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import locationService from "../../../services/locationService";
import InputBox from "../../../components/InputBox";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import DeleteUserModal from "../../../components/DeleteUserModal";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import { useLocations } from "../../../hooks/useLocations";
import SelectField from "../../../components/SelectField";

const LOCATION_HIERARCHY = ["PROVINCE", "CONSTITUENCY", "FACILITY", "WARD"];

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const constituencySchema = z.object({
  state: z.string().min(1, "Province is required"),
  constituency: z.string().trim().min(1, "Constituency is required"),
  facility: z.string().trim().min(1, "Facility is required"),
  ward: z.string().trim().min(1, "Ward is required"),
});
const Ward = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [prefillLoading, setPrefillLoading] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);
  const isEditMode = Boolean(editingLocation);

  const {
    states,
    constituencies,
    facilities,
    // wards,
    fetchStates,
    fetchConstituencies,
    fetchFacilities,
    // fetchWards,
  } = useLocations();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(constituencySchema),
    defaultValues: {
      state: "",
      constituency: "",
      facility: "",
      ward: "",
    },
  });

  // ================= FETCH PROVINCES =================
  const fetchLocations = async () => {
    setLoading(true);
    try {
      const data = await locationService.getLocations({ type: "WARD" });
      setLocations(data);
    } catch (error) {
      console.error("Failed to fetch ward", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // ================= MODAL HANDLERS =================
  const openCreateModal = () => {
    setEditingLocation(null); // ✅ reset first
    reset({ name: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (e, location) => {
    e.stopPropagation();
    setEditingLocation(location);
    setValue("name", location.name);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);

    // 🔑 ensure edit state is cleared AFTER modal closes
    setTimeout(() => {
      setEditingLocation(null);
      reset({ constituency: "", state: "", facility: "" });
    }, 0);
  };

  const openDeleteModal = (e, location) => {
    e.stopPropagation();
    setLocationToDelete(location);
    setDeleteModalOpen(true);
  };
  console.log("editingLocation", editingLocation);

  useEffect(() => {
    if (!isModalOpen) return;

    const init = async () => {
      setPrefillLoading(true);

      reset({ constituency: "", state: "", facility: "" });

      await fetchStates();

      if (isEditMode && editingLocation) {
        reset({
          state: editingLocation?.province?.id,
          constituency: editingLocation?.constituency?.id,
          facility: editingLocation?.facilityId,
          ward: editingLocation?.name,
        });
        await fetchConstituencies(editingLocation?.province?.id);
        reset((p) => ({
          ...p,
          constituency: editingLocation?.constituency?.id,
        }));
        await fetchFacilities(editingLocation?.constituency?.id);
        reset((p) => ({ ...p, facility: editingLocation.facilityId }));
      }

      setPrefillLoading(false);
    };

    init();
  }, [isModalOpen, editingLocation]);

  console.log("editingLocation", editingLocation);
  // ================= ADD / EDIT PROVINCE =================
  const onSubmit = async (data) => {
    const name = data.ward.trim();
    console.log("data", data, locations);

    // Prevent duplicate Province names
    const exists = locations.some(
      (loc) =>
        loc.name.toLowerCase() === name.toLowerCase() &&
        loc.id !== editingLocation?.id
    );

    if (exists) {
      setError("ward", {
        type: "manual",
        message: "Ward already exists",
      });
      return;
    }

    setCreating(true);
    console.log("data", data);

    try {
      if (editingLocation) {
        // ✅ EDIT (SEND TYPE)

        await locationService.updateLocation(editingLocation.id, {
          parentId: data.facility,
          name,
          type: "WARD",
        });
      } else {
        // ✅ ADD
        await locationService.createLocation({
          parentId: data?.facility,
          name,
          type: "WARD",
        });
      }

      closeModal();
      await fetchLocations();
    } catch (error) {
      console.error("Save failed", error);
      alert(error.response?.data?.message || "Failed to save province");
    } finally {
      setCreating(false);
    }
  };

  // ================= DELETE PROVINCE =================
  const handleDeleteConfirm = async () => {
    if (!locationToDelete) return;

    try {
      await locationService.deleteLocation(locationToDelete.id, "WARD");

      setDeleteModalOpen(false);
      setLocationToDelete(null);
      fetchLocations();
    } catch (error) {
      reset({ constituency: "", state: "" });
      console.error("Delete failed", error);
      alert(error.response?.data?.message || "Failed to delete ward");
    }
  };

  const onStateChange = async (e) => {
    const value = e.target.value;
    reset({ constituency: "", facility: "", ward: "" });
    await fetchConstituencies(value);
  };
  const onConstituencyChange = async (e) => {
    const value = e.target.value;
    reset({ facility: "", ward: "" });
    await fetchFacilities(value);
  };

  const onFacilityChange = async (e) => {
    const value = e.target.value;
    reset({ ward: "" });
    //await fetchWards(value);
  };
  console.log("onStateChange", states);
  console.log("constituencies", constituencies);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 min-h-[calc(100vh-(--spacing(32)))]">
      <div className="relative mb-6 flex items-center">
        {/* Left: Title */}
        <h1 className="text-2xl font-bold text-gray-800">Wards</h1>

        {/* Center: Search */}
        <div className="absolute left-1/2 w-full max-w-sm -translate-x-1/2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search facility..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm
                   shadow-sm focus:border-primary focus:ring-1 focus:ring-primary
                   placeholder-gray-400 outline-none"
            />
          </div>
        </div>

        {/* Right: Button */}
        <div className="ml-auto">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white
                 hover:bg-primary/90"
          >
            <Plus size={18} />
            Add New Ward
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
            <div className="overflow-y-auto" style={{ maxHeight: "500px" }}>
              <table className="w-full  border-collapse text-sm">
                <thead className="sticky top-0 z-10 bg-[#f6f8f5] text-left shadow-sm">
                  <tr>
                    <th className="px-6 py-4 font-medium">Province</th>
                    <th className="px-6 py-4 font-medium">Constituency</th>
                    <th className="px-6 py-4 font-medium">Facility</th>
                    <th className="px-6 py-4 font-medium">Ward</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#cfded6]">
                  {filteredLocations?.map((location) => (
                    <tr
                      key={location.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      {console.log("location", location)}
                      {/* ===== Name Column ===== */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-gray-900">
                              {location.province.name}
                            </p>
                            {/* <p className="text-xs text-green-800">
                             {location.name}
                            </p> */}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-gray-900">
                              {location.constituency.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-gray-900">
                              {location.facility.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-gray-900">
                              {location.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ===== Action Column ===== */}
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

                  {/* ===== Empty State ===== */}
                  {locations.length === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No provinces found
                      </td>
                    </tr>
                  )}
                  {filteredLocations.length === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        {searchTerm
                          ? "No matching data found"
                          : "No data found"}
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
            Are you sure you want to delete{" "}
            <span className="font-bold">{locationToDelete?.name}</span>? This
            action cannot be undone.
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
                  {isEditMode ? "Edit Province" : "Add New Province"}
                </DialogTitle>
                {prefillLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <SelectField
                      name="state"
                      placeholder="Province"
                      register={register}
                      error={errors.state}
                      onChange={onStateChange}
                      options={states.map((s) => ({
                        label: s.name,
                        value: s.id,
                      }))}
                    />
                    <div className="mt-4">
                      <SelectField
                        name="constituency"
                        placeholder="Constituency"
                        register={register}
                        error={errors.constituency}
                        onChange={onConstituencyChange}
                        options={constituencies.map((s) => ({
                          label: s.name,
                          value: s.id,
                        }))}
                      />
                    </div>
                    <div className="mt-4">
                      <SelectField
                        name="facility"
                        placeholder="Facility"
                        register={register}
                        error={errors.facility}
                        options={facilities.map((f) => ({
                          label: f.name,
                          value: f.id,
                        }))}
                        onChange={onFacilityChange}
                      />
                    </div>
                    <div className="mt-4">
                      <InputBox
                        // label="Constituency"
                        name="ward"
                        register={register}
                        placeholder="Enter Ward Name"
                        error={errors.ward}
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
                        {creating
                          ? "Saving..."
                          : isEditMode
                          ? "Update"
                          : "Save"}
                      </button>
                    </div>
                  </form>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Ward;
