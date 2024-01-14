import React, {createContext, useContext, useEffect, useRef, useState} from "react";

import { ConfigContext } from "./ConfigContext";
import {longSocket} from "../services/serverWebSocket";
import serverRequest from "../services/serverRequest";

export const DataContext = createContext({});

const URLS = {
  licenses: "data/licenses",
  projects: "data/projects",
  farm: "data/farm/jobs",
  hosts: "data/farm/hosts",
};

const newURLS = {
  projects: "projects",
  users: "users",
};

const createDataSocket = (user, host, sessionId, config) => {
  return longSocket("data", user, host, sessionId, config);
};

const destroySocket = socket => {
  if (!socket.current) return;
  socket.current.close();
  socket.current = undefined;
};

export const DataProvider = props => {
  const { user, host, sessionId } = useContext(ConfigContext);
  const dataSocket = useRef();
  const [reels, setReels] = useState({});
  const [licenses, setLicenses] = useState({});
  const [farm, setFarm] = useState({});
  // New
  const [projects, setProjects] = useState({});
  const [users, setUsers] = useState({});

  const processSocketData = data => {
    console.log("Received data", data);
    if (data.projects) setProjects(data.projects);
  };

  const handleDataSocketMessage = e => {
    if (!e.data) return;
    const resp = JSON.parse(e.data);
    if (!resp.data) return;
    const data = resp.data;
    console.log("Received", data);
    if (Array.isArray(data)) {
      data.forEach(d => processSocketData(d));
      return;
    }
    processSocketData(data);
  };

  useEffect(() => {
    if (!user || !host) return;
    if (dataSocket.current) return;
    const websocketConfig = {
      timeout: 5000,
      onmessage: handleDataSocketMessage,
      onerror: e => console.log("Error", e),
      onopen: e => console.log("Connected!", e),
      onclose: e => {
        console.log("Closed!", e);
        dataSocket.current = undefined;
      },
      onreconnect: e => console.log("Reconnecting...", e),
    };
    const ws = createDataSocket(user, host, sessionId, websocketConfig);
    if (!ws) return;
    dataSocket.current = ws;
    return (() => {
      console.log("Destroying socket");
      destroySocket(dataSocket);
    });
  }, [user, host]);

  const fetchData = () => {
    serverRequest(URLS.licenses).then(resp => setLicenses(resp));
    serverRequest(URLS.projects).then(resp => setReels(resp));
    serverRequest(URLS.farm).then(resp => setFarm(resp));
    serverRequest(newURLS.projects, undefined, "data/v1").then(resp => {
      if (!resp.data) return;
      setProjects(resp.data);
    });
    serverRequest(newURLS.users, undefined, "data/v1").then(resp => {
      if (!resp.data) return;
      const data = {};
      resp.data.forEach(user => data[user.name] = user);
      setUsers(data)
    });
  };

  useEffect(() => {
    fetchData();
    // const fetchDataInterval = setInterval(() => {
    //   fetchData();
    // }, 5000);
    // return () => clearInterval(fetchDataInterval);
  }, []);

  return (
    <DataContext.Provider value={{
      reels,
      licenses,
      farm,
      projects,
      users,
    }}>
      {props.children}
    </DataContext.Provider>
  );
};
