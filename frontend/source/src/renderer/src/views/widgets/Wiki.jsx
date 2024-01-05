/* eslint-disable react/no-unknown-property */
import React, {useEffect, useState} from "react";

import DataPlaceholder from "../../components/DataPlaceholder";
import Widget from "./Widget";
import loadFromLS from "../../utils/loadFromLS";
import saveToLS from "../../utils/saveToLS";
import styles from "./Wiki.module.css";

const SECTIONS = [
  {
    description: "Internal network site for artists.",
    name: "VFX Docs",
    icon: "external.svg",
    url: "http://et-pipeline.etc.io/pipeline"
  },
  {
    description: "Internal network site about developing for Volt.",
    name: "Pipeline Docs",
    icon: "external.svg",
    url: "http://et-pipeline.etc.io/pipeline"
  },
  {
    description: "",
    name: "More Pipeline Docs",
    icon: "external.svg",
    url: "https://www.notion.so/etcvfx/Volt-3eb62cf74d324664a99beaff550e91b9"
  },
  {
    description: "",
    name: "Renderfarm Docs",
    icon: "external.svg",
    url: "https://www.notion.so/etcvfx/Quick-Start-38cb5e8fb33e4fb6bd54b9172bf27191"
  },
  {
    description: "",
    name: "Notion Staff List",
    icon: "external.svg",
    url: "https://www.notion.so/etcvfx/Staff-List-26d716cc72484dc0bb116a66d0dd53cd"
  },
  {
    description: "",
    name: "Notion ETC Vacancies",
    icon: "external.svg",
    url: "https://www.notion.so/etcvfx/Vacancies-128972dc787846fc8e1d7a2a52438aad"
  },
];

const Wiki = props => {
  const [mounted, setMounted] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const title = widgetConfig.title;
  const setTitle = value => handleConfigEdit("title", value);

  const defaultConfig = {
    selected: "",
    filterValue: "",
    title: "Wiki"
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
            <Typography color="darkseagreen" variant="h6">
              {section.name}
            </Typography>
            {section.description ?
              <Typography color="lightgrey" variant="subtitle1">
                {section.description}
              </Typography>
              : null
            }
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

export default Wiki;
