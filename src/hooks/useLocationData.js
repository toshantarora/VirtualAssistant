import { useCallback, useRef, useState } from 'react';
import locationService from '../services/locationService';

/**
 * Cache key format:
 * TYPE_parentId_page_limit_search
 */

export const useLocationData = () => {
  const cacheRef = useRef(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCacheKey = ({
    type,
    parentId,
    page,
    limit,
    search,
  }) =>
    `${type}_${parentId || 'root'}_${page}_${limit}_${search || ''}`;

  const getCachedData = useCallback(
    async (
      type,
      parentId,
      options = {}
    ) => {
      const {
        page = 1,
        limit = 10,
        search,
        populateHierarchy = false,
        countryId,
        provinceId,
        districtId,
        constituencyId,
        wardId,
      } = options;

      const cacheKey = getCacheKey({
        type,
        parentId,
        page,
        limit,
        search,
      });

      if (cacheRef.current.has(cacheKey)) {
        return cacheRef.current.get(cacheKey);
      }

      try {
        setLoading(true);
        setError(null);

        const res = await locationService.getFiltersLocations({
          type,
          page,
          limit,
          search,
          populateHierarchy,
          parentId,
          countryId,
          provinceId,
          districtId,
          constituencyId,
          wardId,
        });

        cacheRef.current.set(cacheKey, res);
        return res;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* ===================== LOCATION HELPERS ===================== */

  const fetchCountries = useCallback(
    (options = {}) =>
      getCachedData('COUNTRY', null, options),
    [getCachedData]
  );

  const fetchStates = useCallback(
    (countryId, options = {}) =>
      getCachedData('PROVINCE', countryId, {
        ...options,
        countryId,
      }),
    [getCachedData]
  );

  const fetchDistricts = useCallback(
    (provinceId, options = {}) =>
      getCachedData('DISTRICT', provinceId, {
        ...options,
        provinceId,
      }),
    [getCachedData]
  );

  const fetchConstituencies = useCallback(
    (districtId, options = {}) =>
      getCachedData('CONSTITUENCY', districtId, {
        ...options,
        districtId,
      }),
    [getCachedData]
  );

  const fetchWards = useCallback(
    (constituencyId, options = {}) =>
      getCachedData('WARD', constituencyId, {
        ...options,
        constituencyId,
      }),
    [getCachedData]
  );

  const fetchFacilities = useCallback(
    (wardId, options = {}) =>
      getCachedData('FACILITY', wardId, {
        ...options,
        wardId,
      }),
    [getCachedData]
  );

  /* ===================== UTILITIES ===================== */

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    loading,
    error,

    fetchCountries,
    fetchStates,
    fetchDistricts,
    fetchConstituencies,
    fetchWards,
    fetchFacilities,

    clearCache,
  };
};
