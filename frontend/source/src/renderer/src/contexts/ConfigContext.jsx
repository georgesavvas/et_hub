import React, {useState, createContext, useEffect} from "react";


export const ConfigContext = createContext();

export const ConfigProvider = props => {
  const [isElectron, setIsElectron] = useState(false);
  const [user, setUser] = useState("unknown");
  const [host, setHost] = useState("unknown");
  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => {
    setIsElectron(window.isElectron);
    if (window.services) {
      window.services.get_env("user").then(resp => {
        if (resp) setUser(resp);
      });
      window.services.get_env("hostname").then(resp => {
        if (resp) setHost(resp);
      });
    }
  }, []);

  return (
    <ConfigContext.Provider value={{
      user: user,
      host: host,
      isElectron: isElectron,
      activePage: activePage,
      setActivePage: setActivePage
    }}>
      {props.children}
    </ConfigContext.Provider>
  );
};
