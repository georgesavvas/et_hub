import React, {useState, createContext, useEffect, useRef} from "react";

// import {useSnackbar} from "notistack";

// import serverRequest from "../services/serverRequest";


export const ConfigContext = createContext();

export const ConfigProvider = props => {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <ConfigContext.Provider value={{
      activePage: activePage,
      setActivePage: setActivePage
    }}>
      {props.children}
    </ConfigContext.Provider>
  );
};
