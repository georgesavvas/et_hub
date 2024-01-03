import React, {useContext, useEffect, useState} from "react";

import Dashboard from "./Dashboard";
import { Divider } from "antd";
// import serverRequest from "../services/serverRequest";
import Sidebar from "./Sidebar";
import bgImg from "../assets/bg.png";
// import {ConfigContext} from "../contexts/ConfigContext";
import styles from "./Home.module.css";
// import Typography from "@mui/material/Typography";
import { useResizeDetector } from "react-resize-detector";

// import Farm from "./widgets/Farm/Farm";
// import Support from "./widgets/Support";
// import Projects from "./widgets/Projects";
// import Workstation from "./widgets/Workstation";
// import Wiki from "./widgets/Wiki";
// import Apps from "./widgets/Apps";
// import Todo from "./widgets/Todo";
// import Notes from "./widgets/Notes";
// import Licenses from "./widgets/Licenses";


// const widgets = {
//   dashboard: Dashboard,
//   projects: Projects,
//   workstation: Workstation,
//   farm: Farm,
//   support: Support,
//   wiki: Wiki,
//   apps: Apps,
//   todo: Todo,
//   notes: Notes,
//   licenses: Licenses
// };

const bgStyle = {
  position: "absolute",
  width: "100%",
  height: "100%",
  zIndex: -1,
  backgroundImage: `url(${bgImg})`,
  filter: "brightness(25%)",
}

export function Home() {
  const { width, height, ref } = useResizeDetector();
  const [backgroundImage, setBackgroundImage] = useState(() => {
    return localStorage.getItem("backgroundImage") || null;
  });
  // const {isElectron, activePage} = useContext(ConfigContext);
  // const [updateAvailable, setUpdateAvailable] = useState(false);

  // useEffect(() => {
  //   if (!isElectron) return;
  //   const cleanupUpdatesListener = window.services.update_available(() => {
  //     console.log("Home publish listener called");
  //     setUpdateAvailable(true);
  //   });
  //   return () => {
  //     cleanupUpdatesListener();
  //   };
  // }, []);

  // const SelectedWidget = widgets[activePage];

  // const handleUpdateClicked = () => {
  //   window.services.restart();
  // };

  return (
    <div className={styles.container}>
      {/* {updateAvailable ?
        <div className={styles.updateContainer} onClick={handleUpdateClicked}>
          <Typography fontWeight="bold">
            There is an available update, click here to restart the app when you are ready
          </Typography>
        </div>
        : null
      } */}
      <div className={styles.row}>
        <Sidebar />
        <Divider type="vertical" style={{ height: "100%", marginRight: 0 }} />
        <Dashboard />
        <div ref={ref} className={styles.contents}>
          {/* {SelectedWidget ?
            <SelectedWidget rglKey={`${activePage}_global`} size={[width, height]} />
            : null
          } */}
        </div>
      </div>
      <div style={bgStyle} />
    </div>
  );
}

export default Home;
