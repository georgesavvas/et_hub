import React, {useContext, useEffect, useState} from "react";
import {packages, widgetDefaults} from "../../constants/widgetDefaults";

import {ConfigContext} from "../../contexts/ConfigContext";
import DataPlaceholder from "../../components/DataPlaceholder";
import DynamicList from "../../components/DynamicList";
import FilterField from "../../components/FilterField";
import Widget from "./Widget";
import debounce from "lodash/debounce";
import loadFromLS from "../../utils/loadFromLS";
import saveToLS from "../../utils/saveToLS";
import styles from "./Apps.module.css";
import {useResizeDetector} from "react-resize-detector";

const debounced = debounce(fn => fn(), 500);

const ICONS = {
  konsole: ["konsole"],
  chrome: ["chrome"],
  opencue: ["cuegui"],
  gaffer: ["volt"],
  ksysguard: ["ksysguard"],
  assetlib: ["asset_library"],
  dolphin: ["dolphin"],
  aftereffects: ["aftereffects", "afx", "afterfx"],
  blender: ["blender"],
  designer: ["designer"],
  djv: ["djv"],
  houdini: [
    "houdini", "houdinicore", "hmaster", "hcore", "hescape", "houdiniescape"
  ],
  illustrator: ["illustrator"],
  maya: ["maya"],
  natron: ["natron"],
  nuke: ["nuke"],
  painter: ["painter"],
  photoshop: ["photoshop"],
  premiere: ["premiere"],
  unreal: ["unreal"],
  vscode: ["code"]
};

const getIcon = app => {
  const defaultPath = "media/apps/unknown.png";
  const cmd = app.cmd.replaceAll(/{.+?}/g, "");
  if (!app || !app.cmd) return defaultPath;
  const icon = Object.entries(ICONS).find(([,keys]) =>
    keys.some(key => cmd.includes(key))
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
  apps: widgetDefaults.apps.apps,
  title: "Apps"
};

const Apps = props => {
  const {isElectron} = useContext(ConfigContext);
  const {width, height, ref} = useResizeDetector();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [apps, setApps] = useState(defaultConfig.apps);
  const [selected, setSelected] = useState(defaultConfig.selected);
  const [filterValue, setFilterValue] = useState(defaultConfig.filterValue);
  const [title, setTitle] = useState(defaultConfig.title);
  const [scene, setScene] = useState("");
  const [args, setArgs] = useState("");

  useEffect(() => {
    setMounted(true);
    const savedConfig = loadFromLS(props.rglKey);
    if (!savedConfig || savedConfig === null) return;
    if (savedConfig?.apps) setApps(savedConfig.apps);
    if (savedConfig?.title) setTitle(savedConfig.title);
    if (savedConfig?.filterValue) setFilterValue(savedConfig.filterValue);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    debounced(() => saveToLS(props.rglKey, {
      apps: apps,
      filterValue: filterValue,
      title: title
    }));
  }, [apps, title, filterValue]);

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

  const handleClose = () => {
    setSelected();
    setScene();
    setArgs();
  };

  const handleLaunch = () => {
    const finalArgs = [];
    if (args) finalArgs.push(args.split("-").map(s => s ? `-${s}` : ""));
    if (scene) finalArgs.push(scene);
    let cmd = selected.cmd;
    Object.entries(packages).forEach(([pkg, pkgCmd]) => {
      cmd = cmd.replaceAll(`{${pkg}}`, pkgCmd);
    });
    window.api.launch_dcc(
      cmd,
      finalArgs,
      {shell: selected.shell, persist: selected.persist}
    );
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
            <div className={styles.settingsAppColumn}>
              <div className={styles.settingsAppRow}>
                <OutlinedInput
                  placeholder="Name"
                  size="small"
                  value={app.name || ""}
                  onChange={e => setApp(index, "name", e.target.value)}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      sx={{ml: 1.5}}
                      checked={app.shell || false}
                      onChange={e => setApp(index, "shell", e.target.checked)}
                    />
                  }
                  label="Shell"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      sx={{ml: 1.5}}
                      disabled={!app.shell}
                      checked={app.persist || false}
                      onChange={e => setApp(index, "persist", e.target.checked)}
                    />
                  }
                  label="Persist"
                />
              </div>
              <div className={styles.settingsAppRow}>
                <OutlinedInput
                  placeholder="Executable"
                  size="small"
                  fullWidth
                  multiline
                  value={app.cmd || ""}
                  onChange={e => setApp(index, "cmd", e.target.value)}
                />
              </div>
            </div>
            <Divider orientation="vertical" flexItem />
            <CloseIcon
              sx={{alignSelf: "center"}}
              onClick={() => handleRemove(index)}
            />
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
            <FilterField filterValue={filterValue || ""}
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
              value={scene || ""}
              onChange={e => setScene(e.target.value || "")}
            />
            <OutlinedInput
              size="small"
              fullWidth
              placeholder="Arguments"
              value={args || ""}
              onChange={e => setArgs(e.target.value || "")}
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
