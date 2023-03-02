import React, {useState, useEffect} from "react";
import DataPlaceholder from "../../components/DataPlaceholder";
import Widget from "./Widget";
import loadFromLS from "../../utils/loadFromLS";
import saveToLS from "../../utils/saveToLS";
import {Typography, TextField} from "@mui/material";

import styles from "./Rundeck.module.css";


const Rundeck = props => {
  const [mounted, setMounted] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const title = widgetConfig.title;
  const setTitle = value => handleConfigEdit("title", value);

  const defaultConfig = {
    selected: "",
    filterValue: "",
    title: "Apps"
  };

  useEffect(() => {
    setMounted(true);
    const savedConfig = loadFromLS(props.rglKey) || {...defaultConfig};
    setWidgetConfig(savedConfig);
  }, []);

  const handleConfigEdit = (key, value) => {
    setWidgetConfig(prev => {
      const existing = {...prev};
      existing[key] = value;
      saveToLS(props.rglKey, existing);
      return existing;
    });
  };

  const Settings = <>
    <TextField
      label="Widget name"
      value={title}
      onChange={e => setTitle(e.target.value)}
      size="small"
    />
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
      <div className={styles.container}>
        <DataPlaceholder text="Rundeck" />
      </div>
    </Widget>
  );
};

export default Rundeck;
