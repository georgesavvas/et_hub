import { Input, Modal, Space, Typography } from "antd";
import React, {createContext, useEffect, useRef, useState} from "react";

import WIDGETS from "../views/widgets";
import _ from "lodash";
import loadFromLS from "../utils/loadFromLS";
import {longSocket} from "../services/serverWebSocket";
import saveToLS from "../utils/saveToLS";
import serverRequest from "../services/serverRequest";
import {v4 as uuid} from "uuid";

const { Title, Text } = Typography;

export const ConfigContext = createContext();

const defaultAppLook = {
  bgImage: "",
  bgBrightness: 100,
  bgColour: {r: 15, g: 15, b: 15},
  widgetColour: {r: 100, g: 100, b: 100},
  widgetTranslucency: 0.8,
  widgetBlur: 5,
}
const defaultLayout = {
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
};

const verifyLayout = layout => {
  layout.widgets = layout.widgets.filter(w => {
    const widgetOk = w.i.split("_")[0] in WIDGETS;
    if (!widgetOk) console.log("Removing unknown widget", w.i, "from layout", layout.id);
    return widgetOk;
  });
  const ids = layout.widgets.map(w => w.i);
  if (!Object.hasOwn(layout, "config")) layout.config = {};
  ids.forEach(id => {
    if (!(id in layout.config)) layout.config[id] = {...WIDGETS[id.split("_")[0]].config};
  });
  return layout;
};

const SESSION_ID = uuid();

const createUpdatesSocket = (user, host, config) => {
  return longSocket("updates", user, host, SESSION_ID, config);
};

const destroySocket = socket => {
  if (!socket.current) return;
  socket.current.close();
  socket.current = undefined;
};

const areLayoutsEqual = (layoutA, layoutB) => {
  console.log({layoutA}, {layoutB});
  if (!layoutA || !layoutB) return false;
  const { widgets: widgetsA, ...genericA } = layoutA;
  const { widgets: widgetsB, ...genericB } = layoutB;
  const widgetsAFiltered = _.omitBy(widgetsA, _.isUndefined);
  const widgetsBFiltered = _.omitBy(widgetsA, _.isUndefined);
  console.log({widgetsAFiltered}, {widgetsBFiltered});
  const isEqual = _.isEqual(genericA, genericB) && _.isEqual(widgetsAFiltered, widgetsBFiltered);
  console.log({isEqual});
  return isEqual;
};

export const ConfigProvider = props => {
  const updatesSocket = useRef();
  const [isElectron, setIsElectron] = useState(false);
  const [user, setUser] = useState("george");
  const [host, setHost] = useState("unknown");
  const [activePage, setActivePage] = useState("dashboard");
  const [layout, setLayout] = useState({});
  const [selectedLayout, setSelectedLayout] = useState("");
  const [layouts, setLayouts] = useState({});
  const [layoutEditable, setLayoutEditable] = useState(false);
  const [appLook, setAppLook] = useState(defaultAppLook);
  const [pinnedLayouts, setPinnedLayouts] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState();
  const [layoutModified, setLayoutModified] = useState(true);
  const [tempLayout, setTempLayout] = useState(null);

  const processSocketData = data => {
    if (data.layouts) setLayouts(data.layouts);
  };

  const blobToBase64 = data => {
    if (!data) return new Promise((resolve) => resolve(""));
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(data);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleUpdatesSocketMessage = e => {
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
    setIsElectron(window.isElectron);
    if (window.services) {
      window.services.get_env("user").then(resp => {
        if (resp) setUser(resp);
      });
      window.services.get_env("hostname").then(resp => {
        if (resp) setHost(resp);
      });
    } else {
      serverRequest("get_ip", undefined, "api/v2").then(resp => setHost(resp.data));
    }
    serverRequest("layouts", undefined, "api/v2").then(resp => {
      if (!resp?.data) return;
      setLayouts(resp.data || {});
    });
    const savedLayout = loadFromLS("layout");
    setLayout(verifyLayout(savedLayout || _.cloneDeep(defaultLayout)));
    setLayoutModified(loadFromLS("layoutModified") || false);
    setBackgroundImage(loadFromLS("backgroundImage"));
    setAppLook(loadFromLS("appLook") || _.cloneDeep(defaultAppLook));
    setSelectedLayout(loadFromLS("selectedLayout"));
    setPinnedLayouts(loadFromLS("pinnedLayouts") || []);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user || !host) return;
    if (updatesSocket.current) return;
    const websocketConfig = {
      timeout: 5000,
      onmessage: handleUpdatesSocketMessage,
      onerror: e => console.log("Error", e),
      onopen: e => console.log("Connected!", e),
      onclose: e => {
        console.log("Closed!", e);
        updatesSocket.current = undefined;
      },
      onreconnect: e => console.log("Reconnecting...", e),
    };
    const ws = createUpdatesSocket(user, host, websocketConfig);
    if (!ws) return;
    updatesSocket.current = ws;
    return (() => {
      console.log("Destroying socket");
      destroySocket(updatesSocket);
    });
  }, [user, host]);

  useEffect(() => {
    if (!mounted || !layouts[selectedLayout]) return;
    saveToLS("selectedLayout", selectedLayout);
    setLayout(verifyLayout(layouts[selectedLayout].data));
    setTempLayout(null);
  }, [selectedLayout]);

  useEffect(() => {
    if (!mounted) return;
    if (layouts && Object.keys(layouts).length === 0) return;
    const ids = Object.keys(layouts);
    setPinnedLayouts(prev => prev.filter(id => ids.includes(id)));
    if (selectedLayout && !layoutModified) setLayout(verifyLayout(layouts[selectedLayout]?.data) || {});
  }, [layouts]);

  useEffect(() => {
    if (!mounted) return;
    if (selectedLayout) {
      const layoutEqual = areLayoutsEqual(layout, layouts[selectedLayout]?.data);
      if (!layoutEqual) setLayoutModified(true);
    }
    saveToLS("layout", layout);
  }, [layout]);

  useEffect(() => {
    saveToLS("layoutModified", layoutModified);
  }, [layoutModified]);

  useEffect(() => {
    if (!mounted) return;
    saveToLS("appLook", appLook);
  }, [appLook]);

  useEffect(() => {
    if (!mounted) return;
    saveToLS("pinnedLayouts", pinnedLayouts);
  }, [pinnedLayouts]);

  const resetLayout = (saved=false) => {
    if (saved) {
      setLayout(verifyLayout(layouts[selectedLayout]?.data) || {});
      setLayoutModified(false);
      setTempLayout(null);
      return;
    }
    setLayout(verifyLayout(_.cloneDeep(defaultLayout)));
    setSelectedLayout("");
    setLayoutModified(false);
    setTempLayout(null);
  };

  const resetBgLook = () => {
    const { bgImage, bgColour, bgBrightness } = defaultAppLook;
    setAppLook(prev => ({ ...prev, bgImage, bgColour, bgBrightness }));
  };

  const resetWidgetLook = () => {
    const { widgetColour, widgetTranslucency, widgetBlur } = defaultAppLook;
    setAppLook(prev => ({ ...prev, widgetColour, widgetTranslucency, widgetBlur }));
  };

  const setAppBgImage = blob => {
    blobToBase64(blob).then(resp => {
      setBackgroundImage(resp);
      saveToLS("backgroundImage", resp);
    });
  };

  const setAppLookKey = (key, value) => {
    setAppLook((prev) => {
      const modified = { ...prev, [key]: value };
      saveToLS("appLook", modified);
      return modified;
    });
  };

  return (
    <ConfigContext.Provider value={{
      user,
      host,
      sessionId: SESSION_ID,
      isElectron,
      activePage,
      setActivePage,
      layouts,
      layout,
      setLayout,
      pinnedLayouts,
      setPinnedLayouts,
      selectedLayout,
      setSelectedLayout,
      resetLayout,
      layoutEditable,
      setLayoutEditable,
      appLook,
      setAppLook: setAppLookKey,
      resetBgLook,
      resetWidgetLook,
      setAppBgImage,
      backgroundImage,
      tempLayout,
      setTempLayout,
    }}>
      {/* <Modal open={true} buttons={null} centered title="Login">
        <Space direction="vertical">
          <Text>It looks like you're visiting from a new browser! Please log in to use all of Hub's features.</Text>
          <Input placeholder="email" suffix="@electrictheatre.tv" autoFocus style={{width: "300px"}} />
        </Space>
      </Modal> */}
      {props.children}
    </ConfigContext.Provider>
  );
};
