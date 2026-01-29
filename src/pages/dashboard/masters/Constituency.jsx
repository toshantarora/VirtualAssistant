import { z } from 'zod';
import LocationMasterBase from './components/LocationMasterBase';

const constituencySchema = z.object({
  countryId: z.string().min(1, 'Country is required'),
  provinceId: z.string().min(1, 'Province is required'),
  districtId: z.string().min(1, 'District is required'),
  constituency: z.string().trim().min(1, 'Constituency name is required'),
});

const Constituency = () => {
  return (
    <LocationMasterBase
      type="CONSTITUENCY"
      title="Constituencies"
      description="Manage constituency locations"
      searchPlaceholder="Search constituency name..."
      schema={constituencySchema}
      itemName="constituency"
      itemLabel="Constituency"
    />
  );
};

export default Constituency;
