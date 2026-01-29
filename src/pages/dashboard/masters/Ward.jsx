import { z } from 'zod';
import LocationMasterBase from './components/LocationMasterBase';

const wardSchema = z.object({
  countryId: z.string().min(1, 'Country is required'),
  provinceId: z.string().min(1, 'Province is required'),
  districtId: z.string().min(1, 'District is required'),
  constituencyId: z.string().min(1, 'Constituency is required'),
  ward: z.string().trim().min(1, 'Ward name is required'),
});

const Ward = () => {
  return (
    <LocationMasterBase
      type="WARD"
      title="Wards"
      description="Manage and view ward locations"
      searchPlaceholder="Search ward name..."
      schema={wardSchema}
      itemName="ward"
      itemLabel="Ward"
    />
  );
};

export default Ward;
