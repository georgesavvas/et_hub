import {IconButton, Typography} from "@mui/material";
import React, {useState, useEffect} from "react";
import styles from "./RenderList.module.css";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import serverRequest from "../../../services/serverRequest";
import {CopyToClipboard} from "../../../components/ContextActions";
import {useSnackbar} from "notistack";
// import PauseIcon from "@mui/icons-material/Pause";
// import WatchLaterOutlinedIcon from "@mui/icons-material/WatchLaterOutlined";
// import DirectionsRunOutlinedIcon from "@mui/icons-material/DirectionsRunOutlined";
// import CheckIcon from "@mui/icons-material/Check";
// import ErrorIcon from "@mui/icons-material/Error";
import {ResponsiveBar} from "@nivo/bar";
import {ResponsiveLine} from "@nivo/line";


// const COLOURS = {
//   waiting: "rgb(120, 120, 0)",
//   paused: "rgb(70, 70, 70)",
//   running: "rgb(0, 80, 0)",
//   error: "rgb(100, 0, 0)",
//   finished: "rgb(0, 50, 120)"
// };

const ProgressBar = ({height, data}) => {
  return (
    <ResponsiveBar
      data={data}
      height={height}
      keys={[
        "succeededFrames",
        "runningFrames",
        "pendingFrames"
      ]}
      indexBy="name"
      maxValue={100}
      layout="horizontal"
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={{ scheme: "nivo" }}
      enableLabel={true}
      labelSkipWidth={12}
    />
  );
};

const theme = {
  axis: {
    textColor: "#eee",
    fontSize: "14px",
    tickColor: "#eee",
    text: {
      fill: "rgb(200, 200, 200)"
    }
  },
  grid: {
    stroke: "#888",
    strokeWidth: 1
  },
};

const TimesChart = ({height, data}) => {
  if (!data.length) return null;
  const dataFormatted = data[0].layerNames.map(name => ({id: name, data: []}));
  dataFormatted.forEach(layer => {
    data.forEach(renderVersion => {
      const cpuTimes = renderVersion.cpuTimes;
      const layerName = layer.id;
      if (renderVersion.layerNames.includes(layerName)) {
        layer.data.push({
          x: renderVersion.version,
          y: cpuTimes[layerName.replace(".", "_")]?.avg || 0
        });
      }
    });
  });

  return (
    <ResponsiveLine
      data={dataFormatted}
      theme={theme}
      height={height}
      margin={{ top: 15, right: 15, bottom: 25, left: 50 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: true,
        reverse: false
      }}
      pointSize={10}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      axisLeft={{
        orient: "left",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "Core seconds",
        legendOffset: -50,
        legendPosition: "middle"
      }}
    />
  );
};

const Render = ({data, expanded, setSelected}) => {
  const {enqueueSnackbar} = useSnackbar();
  const [records, setRecords] = useState([]);
  const [renderCharts, setRenderCharts] = useState(false);
  const {show, name, user, version, shot} = data;

  useEffect(() => {
    if (!expanded) {
      setRenderCharts(false);
      return;
    }
    setTimeout(() => setRenderCharts(true), 500);
  }, [expanded]);

  const handleClick = () => {
    setSelected(prev => prev === name ? "" : name);
    serverRequest(`data/render/${data.name}`).then(resp => {
      setRecords(resp.data);
    });
  };

  // const getLayerState = layer => {
  //   if (layer.runningFrames) return "running";
  //   if (layer.pendingFrames) return "waiting";
  //   if (layer.succeededFrames === layer.totalFrames) return "finished";
  // };

  // const getStatusIcon = state => {
  //   switch (state) {
  //   case "finished": return <CheckIcon className={styles.statusIcon} style={getIconStyle("finished")} />;
  //   case "paused": return <PauseIcon className={styles.statusIcon} style={getIconStyle("paused")} />;
  //   case "waiting": return <WatchLaterOutlinedIcon className={styles.statusIcon} style={getIconStyle("waiting")} />;
  //   case "error": return <ErrorIcon className={styles.statusIcon} style={getIconStyle("error")} />;
  //   default: return <DirectionsRunOutlinedIcon className={styles.statusIcon} style={getIconStyle("running")} />;
  //   }
  // };

  // const getIconStyle = state => {
  //   const colour = COLOURS[state];
  //   return {
  //     color: colour,
  //     filter: "brightness(150%)"
  //   };
  // };

  // const getProgressBarStyle = (progress, state) => {
  //   switch (state) {
  //   case "waiting": return {
  //     backgroundColor: "rgb(120, 120, 0)",
  //     width: `${Math.max(1, progress || 100)}px`,
  //     transition: "background-color 1s"
  //   };
  //   case "paused": return {
  //     backgroundColor: "rgb(70, 70, 70)",
  //     width: `${progress || 100}%`,
  //     transition: "background-color 1s"
  //   };
  //   case "error": return {
  //     backgroundColor: "rgb(100, 0, 0)",
  //     transition: "background-color 1s"
  //   };
  //   case "finished": return {
  //     backgroundColor: "rgb(0, 50, 120)",
  //     transition: "background-color 1s"
  //   };
  //   default: return {
  //     backgroundColor: "rgb(0, 80, 0)",
  //     width: `${Math.max(1, progress || 100)}px`,
  //     transition: progress === 0 ? "width 0.1s, background-color 1s" : "width 0.5s, background-color 1s"
  //   };
  //   }
  // };

  const nameChunks = name.split("-").at(-1).split("_");
  if (nameChunks[0] === user) nameChunks.splice(0, 1);
  const task = nameChunks.splice(0, 1)[0];
  const versionIndex = nameChunks.findIndex(s => s === version);
  const workarea = nameChunks.splice(0, versionIndex).join("_");
  nameChunks.splice(0, 1);
  const renderName = nameChunks.join("_");

  const handleCopyClick = e => {
    e.stopPropagation();
    CopyToClipboard(name, enqueueSnackbar);
  };

  const chartHeight = data.layers.length * 25;
  const bottomRowStyle = {
    height: expanded ? `${chartHeight}px` : 0
  };

  return (
    <div className={styles.renderContainer} onClick={handleClick}>
      <div className={styles.row}>
        {/* <Typography>{data.name}</Typography> */}
        <Typography fontWeight="bold">{[show, shot, task, workarea, renderName, version].join(" / ")}</Typography>
        <IconButton onClick={handleCopyClick} sx={{p: 0}}>
          <ContentCopyIcon />
        </IconButton>
      </div>
      <div className={styles.bottomRow} style={bottomRowStyle}>
        {renderCharts ?
          <>
            <ProgressBar height={chartHeight} data={data.layers} />
            <TimesChart height={chartHeight} data={records} />
          </>
          : null
        }
        {/* {data.layers.map(layer => {
          const bgColour = stc(layer.service) + "80";
          const style = {backgroundColor: bgColour};
          const state = getLayerState(layer);
          const progress = layer.percentCompleted;
          return (
            <>
              <div key={layer.name} className={styles.layerName} style={style}>
                <Typography>{layer.name}</Typography>
              </div>
              <div key={layer.name + "_progressBar"}
                className={`${styles.progressBar} ${styles[state]}`}
                style={
                  {...getProgressBarStyle(progress, state), backgroundColor: COLOURS[state]}
                }
              />
            </>
          );
        })} */}
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
    filtersEnabled
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
          expanded={selected === job.name}
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
