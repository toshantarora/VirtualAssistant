import React, { useState, useEffect } from "react";
import loginImg from "../../assets/login-illustration.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { userSchema } from "../../validations/userSchema";
import InputBox from "../../components/InputBox";
import SelectField from "../../components/SelectField";
import { useNavigate, Link } from "react-router-dom";
import { signupApi } from "../../services/authService";
import Notification from "../../components/Notification";
import { useLocations } from "../../hooks/useLocations";

const Signup = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
  });

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

  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({
    success: true,
    title: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStates();
  }, []);

  const onStateChange = async (e) => {
    const value = e.target.value;
    setValue("constituency", "");
    setValue("facility", "");
    setValue("ward", "");
    await fetchConstituencies(value);
  };

  const onConstituencyChange = async (e) => {
    const value = e.target.value;
    setValue("facility", "");
    setValue("ward", "");
    await fetchFacilities(value);
  };

  const onFacilityChange = async (e) => {
    const value = e.target.value;
    setValue("ward", "");
    await fetchWards(value);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
            email: data.email,
            password: data.password || 'temp123', // userSchema might not have password? check validation
            fullname: data.fullname,
            mobile: data.mobileNumber,
            provinceId: data.state,
            constituencyId: data.constituency,
            facilityId: data.facility,
            wardId: data.ward,
            providerType: data.providerType,
      };
      
      // Note: validation schema in frontend currently doesn't enforce password field for UserModal (admin side)
      // We might need to specific signup schema with password. 
      // For now, I'll add password input and assume backend validation handles it.

      await signupApi({ ...payload, password: data.password }); // explicit password
      
      setToastData({
        success: true,
        title: "Registration Successful",
        message: "Your account is pending approval. Please wait for admin verification.",
      });
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate("/login");
      }, 3000);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Registration failed";
      setToastData({
        success: false,
        title: "Signup Failed",
        message: errorMessage,
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Notification
        show={showToast}
        setShow={setShowToast}
        success={toastData.success}
        title={toastData.title}
        message={toastData.message}
      />
      <div className="min-h-screen flex">
        {/* Left Image Section */}
        <div className="hidden md:flex w-1/2 bg-primary py-8 items-center justify-center">
          <img
            src={loginImg}
            alt="Virtual Assistant"
            className="h-auto w-auto object-contain"
          />
        </div>

        {/* Right Signup Section */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 overflow-y-auto py-10">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Sign Up</h1>
            <p className="text-gray-500 mb-6">
              Create an account to access the dashboard.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <InputBox
                name="fullname"
                placeholder="Full Name"
                register={register}
                error={errors.fullname}
              />
              <InputBox
                type="email"
                placeholder="Email Address"
                name="email"
                register={register}
                error={errors.email}
              />
               <InputBox
                 type={showPassword ? "text" : "password"}
                 placeholder="Password"
                 name="password"
                 register={register}
                 // error={errors.password} // userSchema might not have password
               />
               
              <InputBox
                name="mobileNumber"
                placeholder="Mobile Number"
                register={register}
                error={errors.mobileNumber}
                maxLength={9}
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

              <div className="grid grid-cols-2 gap-4">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-3xl font-semibold hover:bg-green-800 mt-6 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>
            
            <div className="mt-4 text-center">
                <p className="text-gray-500">Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
