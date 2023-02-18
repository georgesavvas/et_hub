import React, {useEffect, useState, useContext} from "react";

import Divider from "@mui/material/Divider";

import styles from "./Home.module.css";
import {ConfigContext} from "../contexts/ConfigContext";
import serverRequest from "../services/serverRequest";
import Menu from "./Menu";
import DataPlaceholder from "../components/DataPlaceholder";
import Dashboard from "./pages/Dashboard";
import Farm from "./pages/Farm";
import Help from "./pages/Help";
import Settings from "./pages/Settings";


const pages = {
  dashboard: <Dashboard />,
  farm: <Farm />,
  help: <Help />,
  settings: <Settings />
};

export default function Home() {
  const {activePage} = useContext(ConfigContext);

  return (
    <div className={styles.container}>
      <Menu />
      <Divider orientation="vertical" />
      <div className={styles.contents}>
        {pages[activePage]}
      </div>
    </div>
  );
}
