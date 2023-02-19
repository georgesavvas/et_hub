import { Divider, MenuItem, Typography } from "@mui/material";
import React, {useContext} from "react";
import Logo from "../components/Logo";

import styles from "./Menu.module.css";
import {ConfigContext} from "../contexts/ConfigContext";

const options = [
  {
    label: "Apps"
  },
  {
    label: "Projects"
  },
  {
    label: "Workstation"
  },
  // {
  //   label: "Rundeck"
  // },
  {
    label: "Farm"
  },
  {
    label: "Support"
  },
  {
    label: "Wiki"
  }
];

const MenuOption = props => {
  const handleClick = () => props.setActivePage(props.label.toLowerCase());
  return (
    <MenuItem className={styles.optionContainer} onClick={handleClick}>
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
          <MenuOption key={o.label} label={o.label}
            setActivePage={setActivePage} />
        )}
      </div>
    </div>
  );
};

export default Menu;
