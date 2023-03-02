import React, {useState, useContext, useEffect} from "react";
import Typography from "@mui/material/Typography";
import {DataContext} from "../../contexts/DataContext";
import Widget from "./Widget";
import loadFromLS from "../../utils/loadFromLS";
import saveToLS from "../../utils/saveToLS";

import styles from "./Workstation.module.css";
import { Divider, TextField } from "@mui/material";


const Workstation = props => {
  const [mounted, setMounted] = useState(false);
  const {licenses} = useContext(DataContext);
  const [widgetConfig, setWidgetConfig] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [workstationData, setWorkstationData] = useState({});
  const title = widgetConfig.title;
  const setTitle = value => handleConfigEdit("title", value);

  const defaultConfig = {
    selected: "",
    filterValue: "",
    title: "Workstation"
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

  useEffect(() => {
    window.services.onWorkstationData((evt, data) => {
      setWorkstationData(data.data);
    });
  }, []);

  const formatMem = () => {
    const used = Math.round(workstationData.memUsed?.usedMemMb / 1000);
    const total = Math.round(workstationData.memUsed?.totalMemMb / 1000);
    return `${used}/${total}GB`;
  };

  const checkedOutLicenses = licenses.data?.filter(
    lic => ["ws20", "ws20.london.etc"].includes(lic.ws)
  ) || [];

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
        <div className={styles.containerInner}>
          <div className={styles.metricContainer}>
            <Typography variant="h5">{workstationData.hostname}</Typography>
            <Typography variant="body1">{workstationData.ip}</Typography>
          </div>
          <Divider orientation="vertical" variant="middle" flexItem />
          <div className={styles.metricContainer}>
            <Typography variant="h5" color="success">
              {Math.round(workstationData.cpuAvg)}%
            </Typography>
            <Typography>CPU</Typography>
          </div>
          <Divider orientation="vertical" variant="middle" flexItem />
          <div className={styles.metricContainer}>
            <Typography variant="h5" color="success">
              {formatMem()}
            </Typography>
            <Typography>RAM</Typography>
          </div>
        </div>
        {/* <Divider variant="middle" /> */}
        <div className={styles.containerLic}>
          {checkedOutLicenses.map(lic =>
            <div key={lic.app} className={styles.lic}>
              <Typography align="center" variant="subtitle2">{lic.app}</Typography>
            </div>
          )}
        </div>
      </div>
    </Widget>
  );
};

export default Workstation;
