import { Button, IconButton, OutlinedInput, TextField, Tooltip, Typography } from "@mui/material";
import React, {useState, useContext} from "react";
import DataPlaceholder from "../../components/DataPlaceholder";
import {DataContext} from "../../contexts/DataContext";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ClearIcon from "@mui/icons-material/Clear";
import FilterField from "../../components/FilterField";

import styles from "./Apps.module.css";


const ICONS = {
  aftereffects: ["aftereffects", "afx", "afterfx"],
  blender: ["blender"],
  designer: ["designer"],
  djv: ["djv"],
  houdini: ["houdini", "houdinicore", "hmaster", "hcore", "hescape", "houdiniescape"],
  illustrator: ["illustrator"],
  maya: ["maya"],
  natron: ["natron"],
  nuke: ["nuke"],
  painter: ["painter"],
  photoshop: ["photoshop"],
  premiere: ["premiere"],
  unreal: ["unreal"],
  vscode: ["vscode"]
};

const getIcon = app => {
  const defaultPath = "media/apps/unknown.png";
  if (!app) return defaultPath;
  const icon = Object.entries(ICONS).find(([,keys]) => keys.includes(app.executable)
  );
  if (!icon) return defaultPath;
  const path = `media/apps/${icon[0] || "unknown"}.png`;
  return path;
};

const App = ({app, setSelected, style}) => {
  const icon = getIcon(app);

  const handleSelect = () => {
    if (!setSelected) return;
    setSelected(app);
  };

  return (
    <Tooltip title={app.name}>
      <div className={styles.appContainer} onClick={handleSelect}
        style={{...style}}>
        <img className={styles.appIcon} src={icon} />
      </div>
    </Tooltip>
  );
};

const Apps = props => {
  const {apps} = useContext(DataContext);
  const [selected, setSelected] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const small = props.size[0] < 300 || props.size[1] < 250;

  const handleClose = () => setSelected();
  const handleLaunch = () => {
    console.log("Launching", selected.name);
    setSelected();
  };

  return (
    <div className={styles.container}>
      <div className={styles.containerInner}>
        {/* {small || selected ? null :
          <FilterField filterValue={filterValue}
            setFilterValue={setFilterValue} />
        } */}
        {!selected ? null :
          <div className={styles.overlay}>
            <ClearIcon onClick={handleClose} className={styles.closeButton} />
            <div className={styles.overlayApp}>
              <App app={selected} style={{width: "50px"}} />
              <Typography variant="h5">{selected.name}</Typography>
            </div>
          </div>
        }
        <div className={styles.gridContainer}>
          {apps.filter(app => (app.name + app.executable).includes(filterValue)).map(app =>
            <App key={app.package} app={app} setSelected={setSelected} />
          )}
        </div>
        <div className={styles.layoutHelper} />
      </div>
      {small && !selected ? null :
        <div className={styles.bottomBar}>
          <OutlinedInput
            size="small"
            fullWidth
            placeholder="Scene"
            // value={filterValue}
            // onChange={e => setFilterValue(e.target.value || "")}
            // color={filterValue ? "error" : ""}
          />
          <OutlinedInput
            size="small"
            fullWidth
            placeholder="Arguments"
            // value={filterValue}
            // onChange={e => setFilterValue(e.target.value || "")}
            // color={filterValue ? "error" : ""}
          />
          <Button variant="contained" color="success" disabled={!selected}
            onClick={handleLaunch}>
            <RocketLaunchIcon />
          </Button>
        </div>
      }
    </div>
  );
};

export default Apps;
