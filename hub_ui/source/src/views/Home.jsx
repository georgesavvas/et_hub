import React, {useEffect, useState, useContext} from "react";

import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { useResizeDetector } from "react-resize-detector";

import styles from "./Home.module.css";
import {ConfigContext} from "../contexts/ConfigContext";
// import serverRequest from "../services/serverRequest";
import Menu from "./Menu";
import Dashboard from "./Dashboard";
import Farm from "./widgets/Farm/Farm";
import Support from "./widgets/Support";
import Projects from "./widgets/Projects";
import Workstation from "./widgets/Workstation";
import Wiki from "./widgets/Wiki";
import Apps from "./widgets/Apps";
import Todo from "./widgets/Todo";
import Notes from "./widgets/Notes";
import Licenses from "./widgets/Licenses";


const widgets = {
  dashboard: Dashboard,
  projects: Projects,
  workstation: Workstation,
  farm: Farm,
  support: Support,
  wiki: Wiki,
  apps: Apps,
  todo: Todo,
  notes: Notes,
  licenses: Licenses
};

export default function Home() {
  const { width, height, ref } = useResizeDetector();
  const {isElectron, activePage} = useContext(ConfigContext);
  const [updateAvailable, setUpdateAvailable] = useState(false);

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

  const SelectedWidget = widgets[activePage];

  const handleUpdateClicked = () => {
    window.services.restart();
  };

  return (
    <div className={styles.container}>
      {updateAvailable ?
        <div className={styles.updateContainer} onClick={handleUpdateClicked}>
          <Typography fontWeight="bold">
            There is an available update, click here to restart the app when you are ready
          </Typography>
        </div>
        : null
      }
      <div className={styles.row}>
        <Menu />
        <Divider orientation="vertical" />
        <div ref={ref} className={styles.contents}>
          {SelectedWidget ?
            <SelectedWidget rglKey={`${activePage}_global`} size={[width, height]} />
            : null
          }
        </div>
      </div>
    </div>
  );
}
