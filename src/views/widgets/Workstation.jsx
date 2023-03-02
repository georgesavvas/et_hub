import React, {useState, useContext, useEffect} from "react";
import Typography from "@mui/material/Typography";
import {DataContext} from "../../contexts/DataContext";

import styles from "./Workstation.module.css";
import { Divider } from "@mui/material";


const Workstation = () => {
  const {licenses} = useContext(DataContext);
  const [workstationData, setWorkstationData] = useState(
    {
      cpu: [{id: "cpu", value: 0.5, color: "rgb(0,150,0)"}],
      ram: [{id: "ram", value: 0.5, color: "rgb(0,150,0)"}]
    }
  );

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

  return (
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
  );
};

export default Workstation;
