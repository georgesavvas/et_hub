import { Divider, MenuItem, Typography } from "@mui/material";
import React, {useContext} from "react";
import Logo from "../components/Logo";

import styles from "./Menu.module.css";
import {ConfigContext} from "../contexts/ConfigContext";

const options = [
  {
    label: "Apps",
    name: "apps"
  },
  {
    label: "Projects",
    name: "projects"
  },
  {
    label: "Workstation",
    name: "workstation"
  },
  {
    label: "Rundeck",
    name: "rundeck"
  },
  {
    label: "Farm",
    name: "farm"
  },
  {
    label: "Support",
    name: "support"
  },
  {
    label: "Wiki",
    name: "wiki"
  },
  {
    label: "Todo",
    name: "todo"
  },
  {
    label: "Notes",
    name: "notes"
  },
  {
    label: "Licenses",
    name: "licenses"
  }
];

const MenuOption = props => {
  const handleClick = () => props.setActivePage(props.label.toLowerCase());
  const handleDragStart = e => {
    e.dataTransfer.setData("text/hub_view/" + props.name, "");
    e.dataTransfer.setData("text/hub_view", props.name);
  };

  return (
    <MenuItem className={styles.optionContainer} onClick={handleClick} draggable
      onDragStart={handleDragStart}>
      <Typography variant="h5">
        {props.label}
      </Typography>
    </MenuItem>
  );
};

const Menu = () => {
  const {setActivePage} = useContext(ConfigContext);

  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <Logo />
      </div>
      <div className={styles.menuContainer}>
        <MenuOption key="DashBoard" label="Dashboard"
          setActivePage={setActivePage} />
        <Divider />
        {options.map(o =>
          <MenuOption key={o.label} label={o.label} name={o.name}
            setActivePage={setActivePage} />
        )}
      </div>
    </div>
  );
};

export default Menu;
