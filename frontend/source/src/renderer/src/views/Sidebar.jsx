import { Divider, Typography } from "antd";
import React, {useContext} from "react";

import {ConfigContext} from "../contexts/ConfigContext";
import Logo from "../components/Logo";
import styles from "./Sidebar.module.css";

const { Title, Paragraph, Text, Link } = Typography;

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
    <div className={styles.optionContainer} onClick={handleClick}
      onDragStart={handleDragStart}>
      <Text>
        {props.label}
      </Text>
    </div>
  );
};

const Sidebar = () => {
  const {setActivePage} = useContext(ConfigContext);

  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <Logo />
      </div>
      <div className={styles.menuContainer}>
        <MenuOption key="Settings" label="Settings" />
        <MenuOption key="Avatar" label="Avatar" />
        <Divider />
        <MenuOption key="Layouts" label="Layouts" />
        <Divider />
        <MenuOption key="Widgets" label="Widgets" />
        {/* {options.map(o =>
          <MenuOption key={o.label} label={o.label} name={o.name}
            setActivePage={setActivePage} />
        )} */}
      </div>
    </div>
  );
};

export default Sidebar;
