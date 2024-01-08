import { Divider, Typography } from "antd";
import React, { useContext, useEffect, useState } from "react";

import { ConfigContext } from "../contexts/ConfigContext";
import Dashboard from "./Dashboard";
import Sidebar from "./Sidebar";
import bgImg from "../assets/bg.png";
import styles from "./Home.module.css";

const { Text } = Typography;

export function Home() {
  const { appLook, isElectron, backgroundImage } = useContext(ConfigContext);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const bgColour = appLook.bgColour.r ? appLook.bgColour : appLook.bgColour.metaColor;
  const bgStyle = {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: -1,
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
    backgroundColor: `rgb(${bgColour.r}, ${bgColour.g}, ${bgColour.b})`,
    filter: `brightness(${appLook.bgBrightness}%)`,
  };

  useEffect(() => {
    if (!isElectron) return;
    const cleanupUpdatesListener = window.services.update_available(() => {
      console.log("Home publish listener called");
      setUpdateAvailable(true);
    });
    return () => {
      cleanupUpdatesListener();
    };
  }, []);

  return (
    <div className={styles.container}>
      {updateAvailable && (
        <div className={styles.updateContainer} onClick={() => window.services.restart()}>
          <Text fontWeight="bold">
            There is an available update, click here to restart the app when you are ready
          </Text>
        </div>
      )}
      <div className={styles.row}>
        <Sidebar />
        <Divider type="vertical" style={{ height: "100%", marginRight: 0 }} />
        <Dashboard />
      </div>
      <div style={bgStyle} />
    </div>
  );
}

export default Home;
