/* eslint-disable react/display-name */
import {CircularProgress, IconButton, Tooltip, Typography} from "@mui/material";
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
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import DataPlaceholder from "../../../components/DataPlaceholder";
import {BasicTooltip} from "@nivo/tooltip";


const COLOURS = {
  waiting: "rgb(120, 120, 120)",
  paused: "rgb(70, 70, 70)",
  running: "rgb(0, 150, 0)",
  error: "rgb(100, 0, 0)",
  finished: "rgb(0, 50, 120)"
};

const theme = {
  axis: {
    textColor: "rgb(200, 200, 200)",
    fontSize: "14px",
    tickColor: "rgb(200, 200, 200)",
    text: {
      fill: "rgb(200, 200, 200)"
    },
    ticks: {
      line: {
        stroke: "rgb(200, 200, 200)"
      },
      text: {
        fontSize: "14px",
        fill: "rgb(200, 200, 200)"
      }
    },
    legend: {
      text: {
        fontSize: "14px",
        fill: "rgb(200, 200, 200)"
      }
    }
  },
  grid: {
    line: {
      // stroke: "rgb(200, 200, 200)",
      strokeWidth: 0.25
    }
  },
  crosshair: {
    line: {
      stroke: "rgb(200, 200, 200)",
      strokeWidth: 2,
      // strokeOpacity: 0.35,
    },
  },
  legends: {
    text: {
      color: "rgb(200, 200, 200)"
    }
  },
  tooltip: {
    container: {
      background: "rgb(20, 20, 20)",
      color: "rgb(200, 200, 200)",
      fontSize: 16
    },
  }
};

const ProgressBar = ({height, data}) => {

  const remap = {
    finished: "succeededFrames",
    running: "runningFrames",
    waiting: "pendingFrames"
  };

  const formattedData = data.map(d => {
    Object.entries(remap).forEach(([name, entry]) => {
      d[name] = d[entry] / d.totalFrames;
    });
    d.nameShort = d.name.split(".")[0];
    return d;
  }).reverse();

  return (
    <ResponsiveBar
      data={formattedData}
      height={height}
      theme={theme}
      margin={{left: 90, bottom: 20}}
      keys={[
        "finished",
        "running",
        "waiting"
      ]}
      indexBy="nameShort"
      layout="horizontal"
      label={node => formattedData[node.index]?.[remap[node.id]]}
      labelTextColor="rgb(200, 200, 200)"
      minValue={0}
      maxValue={1}
      colors={node => COLOURS[node.id]}
      enableLabel={true}
      labelSkipWidth={12}
      enableGridX={false}
      enableGridY={false}
      axisBottom={null}
      axisLeft={{tickSize: 0, tickPadding: 10}}
      tooltip={props => 
        <BasicTooltip
          id={`Frames ${props.id}`}
          value={formattedData[props.index]?.[remap[props.id]]}
          color={props.color}
          enableChip
        /> 
      }
    />
  );
};

const TimesChart = ({height, data, allowedLayers}) => {
  if (data.length < 2) {
    return <DataPlaceholder text="Not enough data" />;
  }

  const dataFormatted = data[0].layerNames.map(name => ({id: name, data: []}));
  let lowestCPU = 0;
  let highestCPU = 0;
  dataFormatted.filter(layer => allowedLayers.includes(layer.id))
    .forEach(layer => {
      data.reverse().forEach(renderVersion => {
        const cpuTimes = renderVersion.cpuTimes;
        const layerName = layer.id;
        const avg = cpuTimes[layerName.replaceAll(".", "_")]?.avg;
        if (avg) {
          const value = Math.round(avg / 60 / 12 * 10) / 10;
          layer.data.push({
            x: renderVersion.version,
            y: value || null
          });
          if (!isNaN(value)) {
            if (value < lowestCPU) lowestCPU = value;
            else if (value > highestCPU) highestCPU = value;
          }
        }
      });
    });
  
  if (dataFormatted.length < 2) {
    return <DataPlaceholder text="Not enough data" />;
  }

  const samples = 5;
  const step = (highestCPU - lowestCPU) / samples;
  const timeValues = [...Array(samples + 1)].map((_, n) => Math.ceil(n * step));
  const timeValuesClean = [...new Set(timeValues)];

  return (
    <ResponsiveLine
      data={dataFormatted}
      theme={theme}
      colors={{scheme: "dark2"}}
      height={height}
      margin={{ top: 10, right: 15, bottom: 50, left: 50 }}
      pointSize={10}
      pointColor={{theme: "background"}}
      pointBorderWidth={2}
      pointBorderColor={{from: "serieColor"}}
      pointLabelYOffset={-12}
      useMesh={true}
      enableSlices="x"
      gridYValues={timeValuesClean}
      axisLeft={{
        tickPadding: 10,
        tickSize: 10,
        tickValues: timeValuesClean
      }}
    />
  );
};

const formatCoreSeconds = (seconds, level, cores) => {
  return seconds / 60 ^ level / cores;
};

const Render = ({data, expanded, setSelected}) => {
  const {enqueueSnackbar} = useSnackbar();
  const [records, setRecords] = useState([]);
  const [renderCharts, setRenderCharts] = useState(false);
  const {
    showShort,
    name,
    task,
    version,
    shot,
    workarea,
    assetName,
    currentCores,
    coreSeconds,
    totalFrames,
    runningFrames,
    finishedFrames
  } = data;

  useEffect(() => {
    if (!expanded) {
      setRenderCharts(false);
      return;
    }
    setTimeout(() => setRenderCharts(true), 250);
  }, [expanded]);

  const allowedLayers = data.layers.map(l => l.name);

  const handleClick = () => {
    setSelected(prev => prev === name ? "" : name);
    serverRequest(`data/render/${data.name}`).then(resp => {
      setRecords(resp.data);
    });
  };

  const handleCopyClick = e => {
    e.stopPropagation();
    CopyToClipboard(name, enqueueSnackbar);
  };

  const lineChartHeight = 200;
  const barChartHeight = Math.min(data.layers.length * 30 + 20, lineChartHeight);
  const bottomRowStyle = {
    height: expanded ? `${lineChartHeight + 15}px` : 0
  };

  return (
    <div className={styles.renderContainer} onClick={handleClick}>
      <div className={styles.row}>
        <Typography variant="body1">
          {[showShort, shot, task, workarea, assetName, version]
            .filter(s => s.length > 0).join(" / ")
          }
        </Typography>
        <Tooltip title={<Typography>Priority</Typography>} followCursor>
          <div className={styles.iconRow}>
            <PriorityHighIcon sx={{mr: -1, ml: -1, fontSize: "24px"}} />
            <Typography
              sx={{color: currentCores ? COLOURS.running : COLOURS.waiting}}
            >
              {data.priority}
            </Typography>
          </div>
        </Tooltip>
        <Tooltip
          title={
            <Typography>Current cores actively rendering</Typography>
          }
          followCursor
        >
          <div className={styles.iconRow}>
            <img src="media/cpu4.png" className={styles.icon} />
            <Typography
              sx={{color: currentCores ? COLOURS.running : COLOURS.waiting}}
            >
              {currentCores}
            </Typography>
          </div>
        </Tooltip>
        <Tooltip
          title={
            <Typography>Frame status - Finished / Total (Running)</Typography>
          }
          followCursor
        >
          <div className={styles.iconRow}>
            <img src="media/frame.png" className={styles.icon} />
            <Typography
              sx={{color: currentCores ? COLOURS.running : COLOURS.waiting}}
            >
              {finishedFrames} /
              {totalFrames}
              {runningFrames ? ` (${runningFrames})` : ""}
            </Typography>
          </div>
        </Tooltip>
        <Tooltip
          title={
            <Typography>Average minutes per frame on a 12 core box</Typography>
          }
          followCursor
        >
          <div className={styles.iconRow}>
            <img src="media/speed.png" className={styles.icon} />
            {coreSeconds ?
              <Typography
                sx={{color: currentCores ? COLOURS.running : COLOURS.waiting}}
              >
                {formatCoreSeconds(coreSeconds, 2, 12)}
              </Typography>
              : <Typography sx={{color: COLOURS.waiting}}>-</Typography>
            }
          </div>
        </Tooltip>
        <Tooltip
          title={<Typography>Copy job name to clipboard</Typography>}
          followCursor
        >
          <IconButton onClick={handleCopyClick} sx={{p: 0}}>
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
      </div>
      <div className={styles.bottomRow} style={bottomRowStyle}>
        {renderCharts ?
          <>
            <Typography textAlign="center" sx={{pt: 1}}>
              Frames per status
            </Typography>
            <Typography textAlign="center" sx={{pt: 1}}>
              Average minutes per frame on a 12 core box
            </Typography>
            <ProgressBar height={barChartHeight} data={data.layers} />
            <div style={{position: "relative"}}>
              <TimesChart
                height={lineChartHeight}
                data={records}
                allowedLayers={allowedLayers}
              />
            </div>
          </>
          : null
        }
      </div>
    </div>
  );
};

const RenderList = props => {
  const [selected, setSelected] = useState("");
  const [jobNames, setJobNames] = useState([]);
  const [coreSeconds, setCoreSeconds] = useState([]);

  useEffect(() => {
    setJobNames(props.data?.map(job => job.name));
  }, [props.data]);

  useEffect(() => {
    serverRequest("data/core_seconds", {data: jobNames}).then(resp =>
      setCoreSeconds(resp.data)
    );
  }, [jobNames]);

  if (!props.data) return null;

  const getJobCoreSeconds = jobName => {
    if (!coreSeconds || !coreSeconds.length) return;
    const jobCoreSeconds = coreSeconds.find(j => j.name === jobName);
    if (!jobCoreSeconds) return;
    const averages = Object.values(jobCoreSeconds.cpuTimes).map(l => l.avg);
    return averages.reduce((a, b) => a + b, 0) / averages.length;
  };

  const dataProcessed = props.data
    .map(job => {
      const {show, name, user, version} = job;
      const showShort = show.slice(0, show.lastIndexOf("_"));
      const nameChunks = name.split("-").at(-1).split("_");
      if (nameChunks[0] === user) nameChunks.splice(0, 1);
      const task = nameChunks.splice(0, 1)[0];
      const versionIndex = nameChunks.findIndex(s => s === version);
      const workarea = nameChunks.splice(0, versionIndex).join("_");
      nameChunks.splice(0, 1);
      const assetName = nameChunks.join("_");
      const currentCores = job.layers.map(l => l.currentCores)
        .reduce((a, b) => a + b, 0);
      const finishedFrames = job.layers.map(l => l.succeededFrames)
        .reduce((a, b) => a + b, 0);
      const runningFrames = job.layers.map(l => l.runningFrames)
        .reduce((a, b) => a + b, 0);
      const totalFrames = job.layers.map(l => l.totalFrames)
        .reduce((a, b) => a + b, 0);
      let speed = getJobCoreSeconds(name);
      job.showShort = showShort;
      job.task = task;
      job.workarea = workarea;
      job.assetName = assetName;
      job.currentCores = currentCores;
      job.finishedFrames = finishedFrames;
      job.runningFrames = runningFrames;
      job.totalFrames = totalFrames;
      job.coreSeconds = speed;
      return job;
    })
    .sort((a, b) => {
      const m = props.selectedMetric;
      if (a[m]) {
        if (typeof a[m] === "number") {
          return a[m] - b[m];
        }
        return a[m] < b[m] ? -1 : 1;
      }
      if (typeof a[m] === "number") {
        return a[m] - b[m];
      }
      return a[m] < b[m] ? -1 : 1;
    });

  const getRenderList = () => {
    const data = dataProcessed.reverse().map(job => {
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
