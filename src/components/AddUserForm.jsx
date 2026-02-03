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
import { DEFAULT_COUNTRY_ID } from '../constants/location';
import { PROVIDER_TYPES, DEFAULT_PROVIDER_TYPE } from '../constants/user';

const AddUserForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('success'); // success | error
  const [dialogMessage, setDialogMessage] = useState('');
  const {
    getList,
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
      country: DEFAULT_COUNTRY_ID,
      state: '',
      district: '',
      constituency: '',
      ward: '',
      facility: '',
      providerType: DEFAULT_PROVIDER_TYPE,
    },
  });

  /* ------------------ Watchers ------------------ */
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
    // selectedState,
    // selectedDistrict,
    // selectedConstituency,
    // selectedWard,
    // fetchStates,
    // fetchDistricts,
    // fetchConstituencies,
    // fetchWards,
    // fetchFacilities,
  ]);


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
        providerType: formData.providerType,
        password: 'admin123',
      });

      if (res?.success) {
        setDialogType('success');
        setDialogMessage(res?.message || 'User created successfully!');
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
              maxLength={13}
              minLength={7}
              type="tel"
            />

            <SelectField
              name="providerType"
              placeholder="Provider Type"
              register={register}
              error={errors.providerType}
              value={watch('providerType')}
              options={PROVIDER_TYPES}
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
              value={selectedWard}
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
              value={selectedFacility}
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
