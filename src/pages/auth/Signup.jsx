import React, { useState, useEffect } from 'react';
import loginImg from '../../assets/login-illustration.png';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { userSchema } from '../../validations/userSchema';
import InputBox from '../../components/InputBox';
import SelectField from '../../components/SelectField';
import { useNavigate, Link } from 'react-router-dom';
import { signupApi } from '../../services/authService';
import Notification from '../../components/Notification';
import { useLocations } from '../../hooks/useLocations';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const Signup = () => {
  useDocumentTitle('Create Account', 'Sign up for a new Usage Monitor account');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullname: '',
      email: '',
      mobileNumber: '',
      providerType: 'Regular',
      country: 'ddb25e7d-e3fc-4d44-bf73-d2a23793c8b7',
      state: '',
      district: '',
      constituency: '',
      ward: '',
      facility: '',
    },
  });

  const {
    getList,
    fetchCountries,
    fetchStates,
    fetchDistricts,
    fetchConstituencies,
    fetchWards,
    fetchFacilities,
  } = useLocations();

  const selectedCountry = watch('country');
  const selectedState = watch('state');
  const selectedDistrict = watch('district');
  const selectedConstituency = watch('constituency');
  const selectedWard = watch('ward');
  const selectedFacility = watch('facility');

  /* ------------------ Initial Fetch for Dependents ------------------ */
  useEffect(() => {
    const initDependents = async () => {
      if (selectedCountry) await fetchStates(selectedCountry);
      if (selectedState) await fetchDistricts(selectedState);
      if (selectedDistrict) await fetchConstituencies(selectedDistrict);
      if (selectedConstituency) await fetchWards(selectedConstituency);
      if (selectedWard) await fetchFacilities(selectedWard);
    };
    initDependents();
  }, [
    selectedCountry,
    selectedState,
    selectedDistrict,
    selectedConstituency,
    selectedWard,
    fetchStates,
    fetchDistricts,
    fetchConstituencies,
    fetchWards,
    fetchFacilities,
  ]);

  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({
    success: true,
    title: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const onCountryChange = async (e) => {
    const value = e.target.value;
    setValue('state', '');
    setValue('district', '');
    setValue('constituency', '');
    setValue('facility', '');
    setValue('ward', '');
    if (value) await fetchStates(value);
  };

  const onStateChange = async (e) => {
    const value = e.target.value;
    setValue('district', '');
    setValue('constituency', '');
    setValue('facility', '');
    setValue('ward', '');
    if (value) await fetchDistricts(value);
  };

  const onDistrictChange = async (e) => {
    const value = e.target.value;
    setValue('constituency', '');
    setValue('facility', '');
    setValue('ward', '');
    if (value) await fetchConstituencies(value);
  };

  const onConstituencyChange = async (e) => {
    const value = e.target.value;
    setValue('facility', '');
    setValue('ward', '');
    if (value) await fetchWards(value);
  };

  const onWardChange = async (e) => {
    const value = e.target.value;
    setValue('facility', '');
    if (value) await fetchFacilities(value);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        email: data.email,
        password: data.password || 'temp123',
        fullname: data.fullname,
        mobile: data.mobileNumber,
        countryId: data.country,
        provinceId: data.state,
        districtId: data.district,
        constituencyId: data.constituency,
        wardId: data.ward,
        facilityId: data.facility,
        providerType: data.providerType,
      };

      await signupApi({ ...payload, password: data.password });

      setToastData({
        success: true,
        title: 'Registration Successful',
        message: 'Your account is pending approval. Please wait for admin verification.',
      });
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate('/login');
      }, 3000);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Registration failed';
      setToastData({
        success: false,
        title: 'Signup Failed',
        message: errorMessage,
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setLoading(false);
    }
  };


  const countries = getList('COUNTRY');
  const states = getList('PROVINCE', selectedCountry);
  const districts = getList('DISTRICT', selectedState);
  const constituencies = getList('CONSTITUENCY', selectedDistrict);
  const wards = getList('WARD', selectedConstituency);
  const facilities = getList('FACILITY', selectedWard);

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
        <div className="hidden md:flex w-1/2 bg-primary py-8 items-center justify-center">
          <img src={loginImg} alt="Virtual Assistant" className="h-auto w-auto object-contain" />
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 overflow-y-auto py-10">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Sign Up</h1>
            <p className="text-gray-500 mb-6">Create an account to access the dashboard.</p>

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
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                name="password"
                register={register}
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
                value={watch('providerType')}
                options={[
                  { label: 'Regular', value: 'Regular' },
                  { label: 'Consultant', value: 'Consultant' },
                ]}
              />

              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  name="country"
                  placeholder="Country"
                  register={register}
                  error={errors.country}
                  value={selectedCountry}
                  onChange={onCountryChange}
                  options={countries.map((c) => ({
                    label: c.name,
                    value: c.id,
                  }))}
                  classNames={{ container: 'hidden' }}
                />

                <SelectField
                  name="state"
                  placeholder="Province"
                  register={register}
                  error={errors.state}
                  value={selectedState}
                  onChange={onStateChange}
                  options={states.map((s) => ({
                    label: s.name,
                    value: s.id,
                  }))}
                />

                <SelectField
                  name="district"
                  placeholder="District"
                  register={register}
                  error={errors.district}
                  value={selectedDistrict}
                  onChange={onDistrictChange}
                  options={districts.map((d) => ({
                    label: d.name,
                    value: d.id,
                  }))}
                />

                <SelectField
                  name="constituency"
                  placeholder="Constituency"
                  register={register}
                  error={errors.constituency}
                  value={selectedConstituency}
                  options={constituencies.map((c) => ({
                    label: c.name,
                    value: c.id,
                  }))}
                  onChange={onConstituencyChange}
                />

                <SelectField
                  name="ward"
                  placeholder="Ward"
                  register={register}
                  error={errors.ward}
                  value={selectedWard}
                  options={wards.map((w) => ({
                    label: w.name,
                    value: w.id,
                  }))}
                  onChange={onWardChange}
                />

                <SelectField
                  name="facility"
                  placeholder="Facility"
                  register={register}
                  error={errors.facility}
                  value={selectedFacility}
                  options={facilities.map((f) => ({
                    label: f.name,
                    value: f.id,
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
                  'Sign Up'
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
