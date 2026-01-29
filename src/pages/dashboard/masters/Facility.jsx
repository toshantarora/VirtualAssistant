import { z } from 'zod';
import LocationMasterBase from './components/LocationMasterBase';

const facilitySchema = z.object({
  countryId: z.string().min(1, 'Country is required'),
  provinceId: z.string().min(1, 'Province is required'),
  districtId: z.string().min(1, 'District is required'),
  constituencyId: z.string().min(1, 'Constituency is required'),
  wardId: z.string().min(1, 'Ward is required'),
  facility: z.string().trim().min(1, 'Facility name is required'),
});

const Facility = () => {
  return (
    <LocationMasterBase
      type="FACILITY"
      title="Facilities"
      description="Manage healthcare facilities"
      searchPlaceholder="Search facility name..."
      schema={facilitySchema}
      itemName="facility"
      itemLabel="Facility"
    />
  );
};

export default Facility;
