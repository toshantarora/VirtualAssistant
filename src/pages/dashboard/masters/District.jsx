import { z } from 'zod';
import LocationMasterBase from './components/LocationMasterBase';

const districtSchema = z.object({
  countryId: z.string().min(1, 'Country is required'),
  provinceId: z.string().min(1, 'Province is required'),
  district: z.string().trim().min(1, 'District name is required'),
});

const District = () => {
  return (
    <LocationMasterBase
      type="DISTRICT"
      title="Districts"
      description="Manage district locations"
      searchPlaceholder="Search district name..."
      schema={districtSchema}
      itemName="district"
      itemLabel="District"
    />
  );
};

export default District;
