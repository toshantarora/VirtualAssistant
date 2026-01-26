import { Loader2, Plus, SquarePen } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import InputBox from "./InputBox";
import SelectField from "./SelectField";
import { userSchema } from "../validations/userSchema";
import { createUserApi, updateUserApi } from "../services/dashboardService";
import { useLocations } from "../hooks/useLocations";
const UserModal = ({ isOpen, onClose, mode, userData = {}, onSuccess }) => {
  const isEdit = mode === "edit";

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [prefillLoading, setPrefillLoading] = useState(false);

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
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullname: "",
      email: "",
      mobileNumber: "",
      state: "",
      constituency: "",
      facility: "",
      ward: "",
    },
  });

  // 🔹 Select change handlers (ONLY place where API is called)
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
    await fetchWards(value);
  };

  // 🔹 Initial load + Edit Prefill
  useEffect(() => {
    if (!isOpen) return;

    const init = async () => {
      reset();
      await fetchStates();

      if (isEdit && userData) {
        setPrefillLoading(true);
        reset({
          fullname: userData.fullname,
          email: userData.email,
          state: userData.provinceId,
          mobileNumber: userData.mobile,
        });

        await fetchConstituencies(userData.provinceId);
        reset((p) => ({ ...p, constituency: userData.constituencyId }));

        await fetchFacilities(userData.constituencyId);
        reset((p) => ({ ...p, facility: userData.facilityId }));

        await fetchWards(userData.facilityId);
        reset((p) => ({ ...p, ward: userData.wardId }));

        setPrefillLoading(false);
      }
    };

    init();
  }, [isOpen]);

  /* ------------------ SUBMIT ------------------ */

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      setSuccessMsg("");

      const payload = {
        email: formData.email,
        fullname: formData.fullname,
        mobile: formData.mobileNumber,
        role: "USER",
        provinceId: formData.state,
        constituencyId: formData.constituency,
        facilityId: formData.facility,
        wardId: formData.ward,
        providerType: formData.providerType,
      };

      if (isEdit) {
        await updateUserApi(userData.id, payload);
        setSuccessMsg("User updated successfully!");
      } else {
        await createUserApi({
          ...payload,
          password: "admin123",
        });
        setSuccessMsg("User created successfully!");
      }

      await onSuccess?.();
      setTimeout(handleClose, 1000);
    } catch (err) {
      setSuccessMsg(
        err?.response?.data?.message ||
          (isEdit ? "Update failed" : "Create failed")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset({
      fullname: "",
      email: "",
      mobileNumber: "",
      state: "",
      constituency: "",
      facility: "",
      ward: "",
    });

    setSuccessMsg("");

    setPrefillLoading(false);
    setLoading(false);
    onClose();
  };
  if (!isOpen) return null;
  return (
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-5xl rounded-3xl bg-white p-8">
          <div className="flex items-center gap-2 mb-6">
            {isEdit ? <SquarePen size={20} /> : <Plus size={20} />}
            <span className="text-xl font-semibold">
              {isEdit ? "Edit User" : "Add User"}
            </span>
          </div>

          {successMsg && (
            <div
              className={`mb-4 rounded px-4 py-2 ${"bg-green-100 text-green-700"}`}
            >
              {successMsg}
            </div>
          )}

          {prefillLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center rounded-3xl bg-white/70">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          )}

          <form id="userForm" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InputBox
                name="fullname"
                placeholder="Full Name"
                register={register}
                error={errors.fullname}
              />
              <InputBox
                name="email"
                placeholder="Email"
                register={register}
                error={errors.email}
                disabled={isEdit}
              />
              <InputBox
                name="mobileNumber"
                placeholder="Mobile Number"
                register={register}
                error={errors.mobileNumber}
                maxLength={10}
                type="tel"
              />
              <SelectField
                name="providerType"
                placeholder="Provider Type"
                register={register}
                error={errors.providerType}
                options={[
                  { label: "Regular", value: "Regular" },
                  { label: "Consultant", value: "Consultant" },
                ]}
              />

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

              <SelectField
                name="constituency"
                placeholder="Constituency"
                register={register}
                error={errors.constituency}
                options={constituencies.map((c) => ({
                  label: c.name,
                  value: c.id,
                }))}
                onChange={onConstituencyChange}
              />

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

              <SelectField
                name="ward"
                placeholder="Ward"
                register={register}
                error={errors.ward}
                options={wards.map((w) => ({
                  label: w.name,
                  value: w.id,
                }))}
              />
            </div>
          </form>

          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={handleClose}
              className="rounded-full border px-6 py-2"
            >
              Cancel
            </button>
            <button
              form="userForm"
              disabled={loading}
              className="rounded-full bg-secondary px-6 py-2 text-white"
            >
              {loading ? "Saving..." : isEdit ? "Update" : "Add User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
