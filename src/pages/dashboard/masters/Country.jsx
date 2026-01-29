import { z } from 'zod';
import LocationMasterBase from './components/LocationMasterBase';

const countrySchema = z.object({
  name: z.string().trim().min(1, 'Country name is required'),
});

const Country = () => {
  return (
    <LocationMasterBase
      type="COUNTRY"
      title="Countries"
      description="Manage country locations"
      searchPlaceholder="Search country name..."
      schema={countrySchema}
      itemName="name"
      itemLabel="Country"
    />
  );
};

export default Country;
