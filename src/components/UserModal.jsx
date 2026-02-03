import { Loader2, Plus, SquarePen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import InputBox from './InputBox';
import SelectField from './SelectField';
import { userSchema } from '../validations/userSchema';
import { createUserApi, updateUserApi } from '../services/dashboardService';
import { useLocations } from '../hooks/useLocations';
import { DEFAULT_COUNTRY_ID } from '../constants/location';
import { PROVIDER_TYPES, DEFAULT_PROVIDER_TYPE } from '../constants/user';
const UserModal = ({ isOpen, onClose, mode, userData = {}, onSuccess }) => {
  const isEdit = mode === 'edit';

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [type, setType] = useState('success');
  const [prefillLoading, setPrefillLoading] = useState(false);

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

  const selectedCountry = watch('country');
  const selectedState = watch('state');
  const selectedDistrict = watch('district');
  const selectedConstituency = watch('constituency');
  const selectedWard = watch('ward');
  const selectedFacility = watch('facility');

  const onStateChange = async (e) => {
    const value = e.target.value;
    reset((p) => ({ ...p, state: value, district: '', constituency: '', ward: '', facility: '' }));
    if (value) await fetchDistricts(value);
  };

  const onDistrictChange = async (e) => {
    const value = e.target.value;
    reset((p) => ({ ...p, district: value, constituency: '', ward: '', facility: '' }));
    if (value) await fetchConstituencies(value);
  };

  const onConstituencyChange = async (e) => {
    const value = e.target.value;
    reset((p) => ({ ...p, constituency: value, ward: '', facility: '' }));
    if (value) await fetchWards(value);
  };

  const onWardChange = async (e) => {
    const value = e.target.value;
    reset((p) => ({ ...p, ward: value, facility: '' }));
    if (value) await fetchFacilities(value);
  };

  // 🔹 Initial load + Edit Prefill
  useEffect(() => {
    if (!isOpen) return;

    const init = async () => {
      if (!isEdit) {
        reset({
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
        });
        await fetchStates(DEFAULT_COUNTRY_ID);
        return;
      }

      if (isEdit && userData) {
        setPrefillLoading(true);
        try {
          // Fetch all necessary location data in parallel to populate the cache
          await Promise.all([
            userData.countryId && fetchStates(userData.countryId),
            userData.provinceId && fetchDistricts(userData.provinceId),
            userData.districtId && fetchConstituencies(userData.districtId),
            userData.constituencyId && fetchWards(userData.constituencyId),
            userData.wardId && fetchFacilities(userData.wardId),
          ]);

          reset({
            fullname: userData.fullname || '',
            email: userData.email || '',
            country: userData.countryId || DEFAULT_COUNTRY_ID,
            state: userData.provinceId || '',
            district: userData.districtId || '',
            constituency: userData.constituencyId || '',
            ward: userData.wardId || '',
            facility: userData.facilityId || '',
            mobileNumber: userData.mobile || '',
            providerType: userData.providerType || DEFAULT_PROVIDER_TYPE,
          });
        } catch (error) {
          console.error('Prefill error:', error);
        } finally {
          setPrefillLoading(false);
        }
      }
    };

    init();
  }, [isOpen, isEdit, userData, reset, fetchStates, fetchDistricts, fetchConstituencies, fetchWards, fetchFacilities]);

  /* ------------------ SUBMIT ------------------ */

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      setMsg('');
      setType('success');

      const payload = {
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
      };

      if (isEdit) {
        await updateUserApi(userData.id, payload);
        setMsg('User updated successfully!');
      } else {
        const user = await createUserApi({
          ...payload,
          password: 'admin123',
        });
        setMsg(user?.message || 'User created successfully!');
      }

      await onSuccess?.();
      setTimeout(handleClose, 1000);
    } catch (err) {
      setType('error');
      setMsg(err?.response?.data?.message || (isEdit ? 'Update failed' : 'Create failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset({
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
    });

    setMsg('');
    setType('success');

    setPrefillLoading(false);
    setLoading(false);
    onClose();
  };

  const states = getList('PROVINCE', selectedCountry);
  const districts = getList('DISTRICT', selectedState);
  const constituencies = getList('CONSTITUENCY', selectedDistrict);
  const wards = getList('WARD', selectedConstituency);
  const facilities = getList('FACILITY', selectedWard);

  if (!isOpen) return null;
  return (
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-5xl rounded-3xl bg-white p-8">
          <div className="flex items-center gap-2 mb-6">
            {isEdit ? <SquarePen size={20} /> : <Plus size={20} />}
            <span className="text-xl font-semibold">{isEdit ? 'Edit User' : 'Add User'}</span>
          </div>

          {msg && (
            <div
              className={`mb-4 rounded px-4 py-2 ${
                type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {msg}
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
          </form>

          <div className="mt-8 flex justify-end gap-4">
            <button onClick={handleClose} className="rounded-full border px-6 py-2">
              Cancel
            </button>
            <button
              form="userForm"
              disabled={loading}
              className="rounded-full bg-secondary px-6 py-2 text-white"
            >
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Add User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
