import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import locationService from '../services/locationService';
import { LocationContext } from './LocationContextInstance';

export const LocationProvider = ({ children }) => {
  const cacheRef = useRef({});
  const [cache, setCache] = useState({});
  const [countries, setCountries] = useState([]);

  // Helper to fetch and cache
  const getCachedData = useCallback(async (type, parentId = null) => {
    const key = `${type}_${parentId || 'root'}`;
    if (cacheRef.current[key]) return cacheRef.current[key];

    try {
      const params = { type };
      if (parentId) params.parentId = parentId;
      const data = await locationService.getLocations(params);

      cacheRef.current[key] = data;
      setCache((prev) => ({ ...prev, [key]: data }));
      if (type === 'COUNTRY') setCountries(data);

      return data;
    } catch (e) {
      console.error(`Failed to fetch ${type}`, e);
      return [];
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await getCachedData('COUNTRY');
    };
    init();
  }, [getCachedData]); // Stable because getCachedData has no deps

  const fetchCountries = useCallback(() => getCachedData('COUNTRY'), [getCachedData]);
  const fetchStates = useCallback(
    (countryId) => getCachedData('PROVINCE', countryId),
    [getCachedData]
  );
  const fetchDistricts = useCallback(
    (provinceId) => getCachedData('DISTRICT', provinceId),
    [getCachedData]
  );
  const fetchConstituencies = useCallback(
    (districtId) => getCachedData('CONSTITUENCY', districtId),
    [getCachedData]
  );
  const fetchWards = useCallback(
    (constituencyId) => getCachedData('WARD', constituencyId),
    [getCachedData]
  );
  const fetchFacilities = useCallback(
    (wardId) => getCachedData('FACILITY', wardId),
    [getCachedData]
  );

  // Helper to get data from cache synchronously in UI
  const getList = useCallback(
    (type, parentId = null) => {
      const key = `${type}_${parentId || 'root'}`;
      return cache[key] || [];
    },
    [cache]
  );

  // Force re-fetch and update cache
  const refreshList = useCallback(async (type, parentId = null) => {
    try {
      const params = { type };
      if (parentId) params.parentId = parentId;
      const data = await locationService.getLocations(params);

      const key = `${type}_${parentId || 'root'}`;
      setCache((prev) => ({ ...prev, [key]: data }));
      if (type === 'COUNTRY') setCountries(data);

      return data;
    } catch (e) {
      console.error(`Failed to refresh ${type}`, e);
      return [];
    }
  }, []);

  const value = useMemo(
    () => ({
      countries,
      getList,
      refreshList,
      fetchCountries,
      fetchStates,
      fetchDistricts,
      fetchConstituencies,
      fetchWards,
      fetchFacilities,
    }),
    [
      countries,
      getList,
      refreshList,
      fetchCountries,
      fetchStates,
      fetchDistricts,
      fetchConstituencies,
      fetchWards,
      fetchFacilities,
    ]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

