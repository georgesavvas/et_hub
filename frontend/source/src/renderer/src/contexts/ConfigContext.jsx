import React, {createContext, useEffect, useState} from "react";

import _ from "lodash";
import loadFromLS from "../utils/loadFromLS";

export const ConfigContext = createContext();

const defaultAppLook = {
  bgImage: "",
  bgBrightness: 100,
  bgColour: "rgb(15, 15, 15)",
  widgetColour: "rgb(40, 40, 40)",
  widgetTranslucency: 0.5,
  widgetBlur: 5,
}
const defaultLayout = {
  user: "george",
  public: false,
  rows: 8,
  columns: 12,
  widgets: [
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
  ],
  look: {},
};

export const ConfigProvider = props => {
  const [isElectron, setIsElectron] = useState(false);
  const [user, setUser] = useState("unknown");
  const [host, setHost] = useState("unknown");
  const [activePage, setActivePage] = useState("dashboard");
  const [layout, setLayout] = useState(defaultLayout);
  const [layoutEditable, setLayoutEditable] = useState(false);
  const [appLook, setAppLook] = useState(defaultAppLook);

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
    const savedLayout = loadFromLS("layout");
    setLayout(savedLayout || _.cloneDeep(defaultLayout));
  }, []);

  const resetLayout = () => {
    setLayout(defaultLayout);
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
      appLook,
      setAppLook,
    }}>
      {props.children}
    </ConfigContext.Provider>
  );
};
