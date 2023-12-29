import React, {useState, createContext, useEffect} from "react";

// import {useSnackbar} from "notistack";

import serverRequest from "../services/serverRequest";


export const DataContext = createContext();

const URLS = {
  licenses: "data/licenses",
  projects: "data/projects",
  farm: "data/farm/jobs",
  hosts: "data/farm/hosts"
};

export const DataProvider = props => {
  const [reels, setReels] = useState({});
  const [licenses, setLicenses] = useState({});
  const [farm, setFarm] = useState({});

  const fetchData = () => {
    serverRequest(URLS.licenses).then(resp => setLicenses(resp));
    serverRequest(URLS.projects).then(resp => setReels(resp));
    serverRequest(URLS.farm).then(resp => setFarm(resp));
  };

  useEffect(() => {
    fetchData();
    const fetchDataInterval = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(fetchDataInterval);
  }, []);

  return (
    <DataContext.Provider value={{
      reels: reels,
      setReels: setReels,
      licenses: licenses,
      setLicenses: setLicenses,
      farm: farm,
      setFarm: setFarm
    }}>
      {props.children}
    </DataContext.Provider>
  );
};
