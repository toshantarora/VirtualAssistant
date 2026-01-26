import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import InputBox from "./InputBox";
import SelectField from "./SelectField";
import { userSchema } from "../validations/userSchema";
import { createUserApi } from "../services/dashboardService";
import { useLocations } from "../hooks/useLocations";
import StatusDialog from "./StatusDialog";
import { useNavigate } from "react-router-dom";

const AddUserForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState("success"); // success | error
  const [dialogMessage, setDialogMessage] = useState("");
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

  /* ------------------ SELECT HANDLERS ------------------ */
  const onStateChange = async (e) => {
    reset({ constituency: "", facility: "", ward: "" });
    await fetchConstituencies(e.target.value);
  };

  const onConstituencyChange = async (e) => {
    reset({ facility: "", ward: "" });
    await fetchFacilities(e.target.value);
  };

  const onFacilityChange = async (e) => {
    reset({ ward: "" });
    await fetchWards(e.target.value);
  };

  /* ------------------ INIT ------------------ */
  useEffect(() => {
    fetchStates();
  }, []);

  //   useEffect(() => {
  //     if (dialogType === "success" && dialogOpen) {
  //       const t = setTimeout(() => setDialogOpen(false), 2000);
  //       return () => clearTimeout(t);
  //     }
  //   }, [dialogType, dialogOpen]);
  /* ------------------ SUBMIT ------------------ */
  const onSubmit = async (formData) => {
    try {
      setLoading(true);

      const res = await createUserApi({
        email: formData.email,
        fullname: formData.fullname,
        mobile: formData.mobileNumber,
        role: "USER",
        provinceId: formData.state,
        constituencyId: formData.constituency,
        facilityId: formData.facility,
        wardId: formData.ward,
        password: "admin123",
      });

      if (res?.success) {
        setDialogType("success");
        setDialogMessage("User created successfully!");
        setDialogOpen(true);
        reset();
        onSuccess?.();
      }
    } catch (err) {
      setDialogType("error");
      setDialogMessage(err?.response?.data?.message || "Failed to create user");
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <Plus size={20} />
          <h2 className="text-xl font-semibold">Add User</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
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
              onChange={onConstituencyChange}
              options={constituencies.map((c) => ({
                label: c.name,
                value: c.id,
              }))}
            />

            <SelectField
              name="facility"
              placeholder="Facility"
              register={register}
              error={errors.facility}
              onChange={onFacilityChange}
              options={facilities.map((f) => ({
                label: f.name,
                value: f.id,
              }))}
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

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-secondary px-6 py-2 text-white"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Add User"
              )}
            </button>
          </div>
        </form>
      </div>
      <StatusDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        type={dialogType}
        title={dialogType === "success" ? "User Created" : "Error"}
        message={dialogMessage}
        onConfirm={() => {
          setDialogOpen(false);
          navigate("/dashboard"); // ✅ navigate
        }}
      />
    </>
  );
};

export default AddUserForm;
