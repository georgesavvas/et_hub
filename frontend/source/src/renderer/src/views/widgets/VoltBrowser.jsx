import { Carousel, Flex, Typography } from "antd";
import React, {useContext, useEffect, useRef, useState} from "react";

import {ConfigContext} from "../../contexts/ConfigContext";
// import Carousel from "nuka-carousel";
// import {Typography, TextField} from "@mui/material";
import {DataContext} from "../../contexts/DataContext";
import DataPlaceholder from "../../components/DataPlaceholder";
import Widget from "./Widget";
import {formatURL} from "../../services/serverRequest";
import loadFromLS from "../../utils/loadFromLS";
import saveToLS from "../../utils/saveToLS";
import styles from "./VoltBrowser.module.css";
import {useResizeDetector} from "react-resize-detector";

const { Title, Text } = Typography;

const VoltBrowser = props => {
  const [mounted, setMounted] = useState(false);
  const {isElectron} = useContext(ConfigContext);
  const {width, height, ref} = useResizeDetector();
  const {reels} = useContext(DataContext);
  const [widgetConfig, setWidgetConfig] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const title = widgetConfig.title;
  const setTitle = value => handleConfigEdit("title", value);

  const vertical = height > width;

  const defaultConfig = {
    selected: "",
    filterValue: "",
    title: "Volt Browser"
  };

  useEffect(() => {
    setMounted(true);
    const savedConfig = loadFromLS(props.rglKey) || {...defaultConfig};
    setWidgetConfig(savedConfig);
  }, []);

  if (!reels) return <DataPlaceholder text="No data" />;

  const handleConfigEdit = (key, value) => {
    setWidgetConfig(prev => {
      const existing = {...prev};
      existing[key] = value;
      saveToLS(props.rglKey, existing);
      return existing;
    });
  };

  const getReel = file => {
    // if (isElectron) return `hub://${file}`;
    const name = file.split("/").at(-1);
    return formatURL(`data/reel/latest/${name}`);
  };

  const Settings = <>
    {/* <TextField
      label="Widget name"
      value={title}
      onChange={e => setTitle(e.target.value)}
      size="small"
    /> */}
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
      <div id="widgetContainer" className={styles.container} style={style} ref={ref}>
      </div>
    </Widget>
  );
};

export default VoltBrowser;
