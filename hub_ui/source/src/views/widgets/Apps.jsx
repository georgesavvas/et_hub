import {Button, OutlinedInput, TextField, Tooltip, Typography} from "@mui/material";
import React, {useState, useEffect, useContext} from "react";
import {ConfigContext} from "../../contexts/ConfigContext";
import DataPlaceholder from "../../components/DataPlaceholder";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ClearIcon from "@mui/icons-material/Clear";
import FilterField from "../../components/FilterField";
import DynamicList from "../../components/DynamicList";
import loadFromLS from "../../utils/loadFromLS";
import saveToLS from "../../utils/saveToLS";
import {useResizeDetector} from "react-resize-detector";
import CloseIcon from "@mui/icons-material/Close";

import styles from "./Apps.module.css";
import Widget from "./Widget";


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

const defaultApps = [
  {
    name: "Houdini",
    cmd: "houdinicore"
  },
  {
    name: "Maya",
    cmd: "maya"
  },
  {
    name: "Mari",
    cmd: "mari"
  },
  {
    name: "Designer",
    cmd: "designer"
  },
  {
    name: "Nuke",
    cmd: "nuke"
  },
  {
    name: "After Effects",
    cmd: "aftereffects"
  },
  {
    name: "Blender",
    cmd: "blender"
  },
  {
    name: "DJV",
    cmd: "djv"
  },
  {
    name: "Illustrator",
    cmd: "illustrator"
  },
  {
    name: "Natron",
    cmd: "natron"
  },
  {
    name: "Painter",
    cmd: "painter"
  },
  {
    name: "Unreal Engine",
    cmd: "unreal"
  },
  {
    name: "VSCode",
    cmd: "vscode"
  }
];

const getIcon = app => {
  const defaultPath = "media/apps/unknown.png";
  if (!app || !app.cmd) return defaultPath;
  const icon = Object.entries(ICONS).find(([,keys]) =>
    keys.some(key => app.cmd.includes(key))
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

const defaultConfig = {
  apps: defaultApps,
  title: "Apps",
  filterValue: ""
};

const Apps = props => {
  const {isElectron} = useContext(ConfigContext);
  const {width, height, ref} = useResizeDetector();
  const [widgetConfig, setWidgetConfig] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [apps, setApps] = useState(defaultConfig.apps);
  const [selected, setSelected] = useState(defaultConfig.selected);
  const [filterValue, setFilterValue] = useState(defaultConfig.filterValue);
  const [title, setTitle] = useState(defaultConfig.title);

  useEffect(() => {
    setMounted(true);
    const savedConfig = loadFromLS(props.rglKey);
    setWidgetConfig(prev => ({...prev, ...savedConfig}));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setWidgetConfig(prev => {
      const config = {
        apps: apps,
        selected: selected,
        filterValue: filterValue,
        title: title
      };
      const newConfig = {...prev, ...config};
      saveToLS(props.rglKey, newConfig);
      return newConfig;
    });
  }, [apps, selected, title, filterValue]);

  const small = width < 250 || height < 250;

  if (!isElectron) return (
    <Widget
      title={title}
      onRemove={props.onRemove}
      rglKey={props.rglKey}
    >
      <DataPlaceholder text="Widget disabled on web UI" />
    </Widget>
  );

  const handleClose = () => setSelected();
  const handleLaunch = () => {
    console.log("Launching", selected.name);
    handleClose();
  };

  const filterApps = app => {
    if (!app.cmd) return;
    if (!filterValue) return true;
    return (app.name + app.cmd).includes(filterValue);
  };

  const setApp = (index, field, value) => {
    setApps(prev => {
      const existing = [...prev];
      existing[index][field] = value;
      return existing;
    });
  };

  const handleRemove = index => {
    setApps(prev => {
      const existing = [...prev];
      existing.splice(index, 1);
      return existing;
    });
  };

  const handleRevert = () => {
    setApps(defaultConfig.apps);
    setSelected(defaultConfig.selected);
    setFilterValue(defaultConfig.filterValue);
    setTitle(defaultConfig.title);
  };

  const Settings = <>
    <TextField
      label="Widget name"
      value={title}
      onChange={e => setTitle(e.target.value)}
      size="small"
    />
    <Button variant="outlined" onClick={handleRevert} color="warning">
      Revert settings
    </Button>
    <DynamicList
      title="App List"
      onAdd={() => setApps(prev => [...prev, {name: "", cmd: ""}])}
      onRemove={() => handleRemove(-1)}
    >
      {apps.map((app, index) => {
        return (
          <div key={index} className={styles.settingsAppContainer}>
            <OutlinedInput
              placeholder="Name"
              size="small"
              value={app.name}
              onChange={e => setApp(index, "name", e.target.value)}
            />
            <OutlinedInput
              placeholder="Executable"
              size="small"
              fullWidth
              multiline
              value={app.cmd}
              onChange={e => setApp(index, "cmd", e.target.value)}
            />
            <CloseIcon onClick={() => handleRemove(index)} />
          </div>
        );
      })}
    </DynamicList>
  </>;

  return (
    <Widget
      settings={Settings}
      settingsOpen={settingsOpen}
      setSettingsOpen={setSettingsOpen}
      title={title}
      onRemove={props.onRemove}
      rglKey={props.rglKey}
    >
      <div className={styles.container} ref={ref}>
        <div className={styles.containerInner}>
          {small ? null :
            <FilterField filterValue={filterValue}
              setFilterValue={setFilterValue} />
          }
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
            {apps.filter(filterApps).map((app, index) =>
              <App key={app.name || index}
                app={app}
                setSelected={setSelected}
              />
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
    </Widget>
  );
};

export default Apps;
