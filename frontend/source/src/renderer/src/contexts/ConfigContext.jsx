import React, {createContext, useEffect, useState} from "react";

export const ConfigContext = createContext();

const defaultRows = 8;
const defaultColumns = 12;
const defaultLayout = [
  {
    w: 3,
    h: 2,
    x: 0,
    y: 0,
    i: "projects_1",
  },
  {
    w: 3,
    h: 2,
    x: 1,
    y: 3,
    i: "projects_2",
  },
  {
    w: 3,
    h: 2,
    x: 2,
    y: 5,
    i: "projects_3",
  },
];
const defaultAppLook = {
  bgImage: "",
  bgBrightness: 100,
  bgColour: "rgb(15, 15, 15)",
  widgetColour: "rgb(40, 40, 40)",
  widgetTranslucency: 0.5,
  widgetBlur: 5,
}

export const ConfigProvider = props => {
  const [isElectron, setIsElectron] = useState(false);
  const [user, setUser] = useState("unknown");
  const [host, setHost] = useState("unknown");
  const [activePage, setActivePage] = useState("dashboard");
  const [layout, setLayout] = useState([]);
  const [layoutEditable, setLayoutEditable] = useState(false);
  const [rows, setRows] = useState(8);
  const [columns, setColumns] = useState(6);
  const [appLook, setAppLook] = useState(defaultAppLook)

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

  const resetLayout = () => {
    setLayout(defaultLayout);
    setRows(defaultRows);
    setColumns(defaultColumns);
  }

  return (
    <ConfigContext.Provider value={{
      user,
      host,
      isElectron,
      activePage,
      setActivePage,
      layout,
      setLayout,
      resetLayout,
      layoutEditable,
      setLayoutEditable,
      rows,
      setRows,
      columns,
      setColumns,
      appLook,
      setAppLook,
    }}>
      {props.children}
    </ConfigContext.Provider>
  );
};
