import React, {useEffect, useState, useContext} from "react";

import Divider from "@mui/material/Divider";
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
import Rundeck from "./widgets/Rundeck";


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
  licenses: Licenses,
  rundeck: Rundeck
};

export default function Home() {
  const { width, height, ref } = useResizeDetector();
  const {activePage} = useContext(ConfigContext);

  const SelectedWidget = widgets[activePage];

  return (
    <div className={styles.container}>
      <Menu />
      <Divider orientation="vertical" />
      <div ref={ref} className={styles.contents}>
        {SelectedWidget ? <SelectedWidget size={[width, height]} /> : null}
      </div>
    </div>
  );
}
