import React, {useState, createContext, useEffect} from "react";

// import {useSnackbar} from "notistack";


export const ConfigContext = createContext();

export const ConfigProvider = props => {
  const [isElectron, setIsElectron] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => {
    setIsElectron(window.isElectron);
  }, []);

  return (
    <ConfigContext.Provider value={{
      isElectron: isElectron,
      activePage: activePage,
      setActivePage: setActivePage
    }}>
      {props.children}
    </ConfigContext.Provider>
  );
};
