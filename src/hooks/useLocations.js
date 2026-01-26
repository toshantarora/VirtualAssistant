import { useContext } from 'react';
import { LocationContext } from '../context/LocationContextInstance';

export const useLocations = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocations must be used within a LocationProvider');
  }
  return context;
};
