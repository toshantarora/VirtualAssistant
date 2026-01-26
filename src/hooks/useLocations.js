import { useState } from "react";
import { getLocations } from "../services/dashboardService";


export const useLocations = () => {
  const [states, setStates] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [wards, setWards] = useState([]);

  const fetchStates = async () => {
    const res = await getLocations({ type: "PROVINCE" });
    setStates(res?.data || []);
  };

  const fetchConstituencies = async (stateId) => {
    setConstituencies([]);
    setFacilities([]);
    setWards([]);

    if (!stateId) return;
    const res = await getLocations({
      type: "CONSTITUENCY",
      parentId: stateId,
    });

    setConstituencies(res?.data || []);
  };

  const fetchFacilities = async (constituencyId) => {
    setFacilities([]);
    setWards([]);

    if (!constituencyId) return;
    const res = await getLocations({
      type: "FACILITY",
      parentId: constituencyId,
    });

    setFacilities(res?.data || []);
  };

  const fetchWards = async (facilityId) => {
    setWards([]);

    if (!facilityId) return;
    const res = await getLocations({
      type: "WARD",
      parentId: facilityId,
    });

    setWards(res?.data || []);
  };

  return {
    states,
    constituencies,
    facilities,
    wards,
    fetchStates,
    fetchConstituencies,
    fetchFacilities,
    fetchWards,
  };
};
