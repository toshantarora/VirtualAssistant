import { z } from 'zod';
import LocationMasterBase from './components/LocationMasterBase';

const provinceSchema = z.object({
  countryId: z.string().min(1, 'Country is required'),
  province: z.string().trim().min(1, 'Province name is required'),
});

const Province = () => {
  return (
    <LocationMasterBase
      type="PROVINCE"
      title="Provinces"
      description="Manage province locations"
      searchPlaceholder="Search province name..."
      schema={provinceSchema}
      itemName="province"
      itemLabel="Province"
    />
  );
};

export default Province;
