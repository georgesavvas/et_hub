import { Divider, Link, Typography, TextField } from "@mui/material";
import React, {useState, useEffect} from "react";
import Widget from "./Widget";
import loadFromLS from "../../utils/loadFromLS";
import saveToLS from "../../utils/saveToLS";

import styles from "./Support.module.css";


const SECTIONS = [
  {
    description: "Internal network page to raise support tickets of any topic.",
    name: "ETC Helpdesk",
    icon: "external.svg",
    url: "http://helpdesk.etc.com/"
  },
  {
    description: "Engineering help centre for artists.",
    name: "Engineering Docs",
    icon: "external.svg",
    url: "https://www.notion.so/etcvfx/Help-Center-ce39eae7a7da49afa25ad530db9fa4e6"
  },
  {
    description: "Internal network page to run various tasks, such as rebooting your workstation.",
    name: "Rundeck",
    icon: "external.svg",
    url: "https://rundeck.electrictheatre.tv/"
  },
  {
    description: "Engineering support",
    name: "#support-eng",
    icon: "apps/slack.png",
    slack_url: "slack://channel?team=TUHQE0DPH&id=C02563EEUDV",
    url: "https://etcvfx.slack.com/archives/C02563EEUDV"
  },
  {
    description: "Volt support",
    name: "#support-volt",
    icon: "apps/slack.png",
    slack_url: "slack://channel?team=TUHQE0DPH&id=C024TPB1HV5",
    url: "https://etcvfx.slack.com/archives/C024TPB1HV5"
  },
  {
    description: "Rendering support",
    name: "#support-rendering",
    icon: "apps/slack.png",
    slack_url: "slack://channel?team=TUHQE0DPH&id=C025HQMEGLD",
    url: "https://etcvfx.slack.com/archives/C025HQMEGLD"
  },
  {
    description: "Licenses support",
    name: "#support-licenses",
    icon: "apps/slack.png",
    slack_url: "slack://channel?team=TUHQE0DPH&id=C02H6354ULW",
    url: "https://etcvfx.slack.com/archives/C02H6354ULW"
  },
];

const Support = props => {
  const [mounted, setMounted] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const title = widgetConfig.title;
  const setTitle = value => handleConfigEdit("title", value);

  const defaultConfig = {
    selected: "",
    filterValue: "",
    title: "Support"
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

  const getSections = () => {
    const amount = SECTIONS.length;
    return SECTIONS.map((section, index) => {
      return (
        <div key={index}
          className={styles.sectionContainer}
          onClick={() => window.services.open_url(section.slack_url || section.url)}
        >
          <div className={styles.text}>
            <Typography color="lightskyblue" variant="h6">{section.name}</Typography>
            <Typography color="lightgrey" variant="subtitle1">
              {section.description}
            </Typography>
          </div>
          <img
            alt="link icon"
            src={`media/${section.icon}`}
            className={styles.icon}
          />
        </div>
      );
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
        {getSections()}
      </div>
    </Widget>
  );
};

export default Support;
