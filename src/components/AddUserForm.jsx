import { Loader2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import InputBox from './InputBox';
import SelectField from './SelectField';
import { userSchema } from '../validations/userSchema';
import { createUserApi } from '../services/dashboardService';
import { useLocations } from '../hooks/useLocations';
import StatusDialog from './StatusDialog';
import { useNavigate } from 'react-router-dom';

const AddUserForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('success'); // success | error
  const [dialogMessage, setDialogMessage] = useState('');
  const {
    getList,
    fetchCountries,
    fetchStates,
    fetchDistricts,
    fetchConstituencies,
    fetchWards,
    fetchFacilities,
  } = useLocations();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullname: '',
      email: '',
      mobileNumber: '',
      country: '',
      state: '',
      district: '',
      constituency: '',
      ward: '',
      facility: '',
    },
  });

  /* ------------------ SELECT HANDLERS ------------------ */
  const onCountryChange = async (e) => {
    const val = e.target.value;
    reset((p) => ({
      ...p,
      country: val,
      state: '',
      district: '',
      constituency: '',
      ward: '',
      facility: '',
    }));
    if (val) await fetchStates(val);
  };

  const onStateChange = async (e) => {
    const val = e.target.value;
    reset((p) => ({ ...p, state: val, district: '', constituency: '', ward: '', facility: '' }));
    if (val) await fetchDistricts(val);
  };

  const onDistrictChange = async (e) => {
    const val = e.target.value;
    reset((p) => ({ ...p, district: val, constituency: '', ward: '', facility: '' }));
    if (val) await fetchConstituencies(val);
  };

  const onConstituencyChange = async (e) => {
    const val = e.target.value;
    reset((p) => ({ ...p, constituency: val, ward: '', facility: '' }));
    if (val) await fetchWards(val);
  };

  const onWardChange = async (e) => {
    const val = e.target.value;
    reset((p) => ({ ...p, ward: val, facility: '' }));
    if (val) await fetchFacilities(val);
  };

  /* ------------------ INIT ------------------ */
  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  /* ------------------ SUBMIT ------------------ */
  const onSubmit = async (formData) => {
    try {
      setLoading(true);

      const res = await createUserApi({
        email: formData.email,
        fullname: formData.fullname,
        mobile: formData.mobileNumber,
        role: 'USER',
        countryId: formData.country,
        provinceId: formData.state,
        districtId: formData.district,
        constituencyId: formData.constituency,
        wardId: formData.ward,
        facilityId: formData.facility,
        password: 'admin123',
      });

      if (res?.success) {
        setDialogType('success');
        setDialogMessage('User created successfully!');
        setDialogOpen(true);
        reset();
        onSuccess?.();
      }
    } catch (err) {
      setDialogType('error');
      setDialogMessage(err?.response?.data?.message || 'Failed to create user');
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const selectedCountry = watch('country');
  const selectedState = watch('state');
  const selectedDistrict = watch('district');
  const selectedConstituency = watch('constituency');
  const selectedWard = watch('ward');

  const countries = getList('COUNTRY');
  const states = getList('PROVINCE', selectedCountry);
  const districts = getList('DISTRICT', selectedState);
  const constituencies = getList('CONSTITUENCY', selectedDistrict);
  const wards = getList('WARD', selectedConstituency);
  const facilities = getList('FACILITY', selectedWard);

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

            <InputBox name="email" placeholder="Email" register={register} error={errors.email} />

            <InputBox
              name="mobileNumber"
              placeholder="Mobile Number"
              register={register}
              error={errors.mobileNumber}
              maxLength={10}
              type="tel"
            />

            <SelectField
              name="country"
              placeholder="Country"
              register={register}
              error={errors.country}
              onChange={onCountryChange}
              options={countries.map((c) => ({
                label: c.name,
                value: c.id,
              }))}
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
              name="district"
              placeholder="District"
              register={register}
              error={errors.district}
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
              onChange={onConstituencyChange}
              options={constituencies.map((c) => ({
                label: c.name,
                value: c.id,
              }))}
            />

            <SelectField
              name="ward"
              placeholder="Ward"
              register={register}
              error={errors.ward}
              onChange={onWardChange}
              options={wards.map((w) => ({
                label: w.name,
                value: w.id,
              }))}
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
            />
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-secondary px-6 py-2 text-white"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Add User'}
            </button>
          </div>
        </form>
      </div>
      <StatusDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        type={dialogType}
        title={dialogType === 'success' ? 'User Created' : 'Error'}
        message={dialogMessage}
        onConfirm={() => {
          setDialogOpen(false);
          navigate('/dashboard'); // ✅ navigate
        }}
      />
    </>
  );
};

export default AddUserForm;
