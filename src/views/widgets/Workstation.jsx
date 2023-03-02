import React, {useState, useContext, useEffect} from "react";
import Typography from "@mui/material/Typography";
import {DataContext} from "../../contexts/DataContext";
import Widget from "./Widget";
import loadFromLS from "../../utils/loadFromLS";
import saveToLS from "../../utils/saveToLS";
import {fit} from "../../utils/math";

import styles from "./Workstation.module.css";
import { Divider, TextField } from "@mui/material";


const COLOURS = ["#28ea16", "#70c626", "#a0d904", "#e0d021", "#ff9f0f",
  "#f07407", "#e00000"];
const COLOURS_AMOUNT = COLOURS.length;

const Workstation = props => {
  const [mounted, setMounted] = useState(false);
  const {licenses} = useContext(DataContext);
  const [widgetConfig, setWidgetConfig] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [workstationData, setWorkstationData] = useState({});
  const title = widgetConfig.title;
  const setTitle = value => handleConfigEdit("title", value);

  const cpuAvg = Math.round(workstationData.cpuAvg);
  const memUsed = Math.round(workstationData.memUsed?.usedMemMb / 1000);
  const memTotal = Math.round(workstationData.memUsed?.totalMemMb / 1000);

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
    const removeListener = window.services.onWorkstationData((evt, data) => {
      setWorkstationData(data.data);
    });
    return () => {
      if (removeListener) removeListener();
    };
  }, []);

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

  const cpuInt = Math.floor(
    fit(cpuAvg / 100, 0, 0.999, 0, COLOURS_AMOUNT)
  );
  const cpuColour = COLOURS[cpuInt];

  const memInt = Math.floor(
    fit(memUsed / memTotal, 0, 0.999, 0, COLOURS_AMOUNT)
  );
  const memColour = COLOURS[memInt];

  const cpuStyle = {
    color: cpuColour,
    transition: "color 1s"
  };
  console.log(cpuAvg, cpuInt, cpuColour);
  const memStyle = {
    color: memColour,
    transition: "color 1s"
  };

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
            <Typography variant="h5" style={cpuStyle}>
              {cpuAvg}%
            </Typography>
            <Typography style={cpuStyle}>CPU</Typography>
          </div>
          <Divider orientation="vertical" variant="middle" flexItem />
          <div className={styles.metricContainer}>
            <Typography variant="h5" style={memStyle}>
              {`${memUsed}/${memTotal}GB`}
            </Typography>
            <Typography style={memStyle}>RAM</Typography>
          </div>
        </div>
        {/* <Divider variant="middle" /> */}
        <div className={styles.containerLic}>
          {checkedOutLicenses.map(lic =>
            <div key={lic.app} className={styles.lic}>
              <Typography align="center" fontWeight="bold" variant="subtitle2">
                {lic.app}
              </Typography>
            </div>
          )}
        </div>
      </div>
    </Widget>
  );
};

export default Workstation;
