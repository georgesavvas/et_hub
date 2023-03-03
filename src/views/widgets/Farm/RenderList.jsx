import { Button, Typography } from "@mui/material";
import React, {useState} from "react";
import styles from "./RenderList.module.css";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import serverRequest from "../../../services/serverRequest";


const Render = ({data, selected, setSelected}) => {
  const expanded = selected === data.name;

  const bottomRowClassName = styles.row + " " + styles.bottomRow + (
    expanded ? ` ${styles.expanded}` : ""
  );

  const handleClick = () => {
    setSelected(data.name);
    serverRequest(`get_render_data/${data.name}`).then(resp =>
      console.log(resp.data.map(d => d.name))
    );
  };

  return (
    <div className={styles.renderContainer} onClick={handleClick}>
      <div className={styles.row}>
        <Typography>{data.name}</Typography>
        <ContentCopyIcon />
      </div>
      <div className={bottomRowClassName}>
        {data.layers.map(layer => {
          return (
            <div key={layer.name} className={styles.layerContainer}>
              <Typography>{layer.name}</Typography>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RenderList = props => {
  const [selected, setSelected] = useState("");
  const {
    selectedArtists,
    selectedProjects,
    layerMask,
    filtersEnabled,
    selectedMetric
  } = props;
  const allowedLayers = layerMask ?
    layerMask.replaceAll(" ", "").split(",") : [];

  const isJobIncluded = job => {
    if (!filtersEnabled) return true;
    if (selectedProjects.length && !selectedProjects.includes(job.show)) return;
    if (selectedArtists.length && !selectedArtists.includes(job.user)) return;
    return true;
  };

  const isLayerIncluded = layer => {
    if (!allowedLayers.length) return true;
    return allowedLayers.some(pref => layer.name.startsWith(pref + "."));
  };

  const dataFormatted = props.data.data?.jobs.filter(isJobIncluded).map(j => {
    const job = {...j};
    job.layers = job.layers.filter(isLayerIncluded);
    return job;
  });

  const getRenderList = () => {
    if (!dataFormatted) return null;
    const data = dataFormatted.map(job => {
      return (
        <Render key={job.name}
          data={job}
          selected={selected}
          setSelected={setSelected}
        />
      );
    });
    return data;
  };

  return (
    <div className={styles.container}>
      {getRenderList()}
    </div>
  );
};

export default RenderList;
