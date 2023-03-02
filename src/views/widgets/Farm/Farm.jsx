import React, {useContext, useState, useEffect} from "react";
import DataPlaceholder from "../../../components/DataPlaceholder";
import {DataContext} from "../../../contexts/DataContext";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import loadFromLS from "../../../utils/loadFromLS";
import saveToLS from "../../../utils/saveToLS";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import debounce from "lodash.debounce";
import Widget from "../Widget";

import styles from "./Farm.module.css";
import { Button, FormControlLabel, FormGroup, OutlinedInput, Switch, TextField } from "@mui/material";
import TreeMap from "./nivo/NivoTreeMap";
// import TreeMap from "./TreeMap";


const debounced = debounce(fn => fn(), 500);

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const COLOURS = {
  Error: "rgb(150, 50, 50)",
  Running: "rgb(50, 150, 50)",
  Finished: "rgb(50, 50, 100)",
  Waiting: "rgb(100, 100, 100)"
};

const METRIC_LABELS = {
  totalFrames: "Total frames",
  runningFrames: "Running frames",
  pendingFrames: "Waiting frames",
  deadFrames: "Dead frames",
  priority: "Priority",
  percentCompleted: "Percent complete"
};

const Farm = props => {
  const [mounted, setMounted] = useState(false);
  const {farm} = useContext(DataContext);
  const [widgetConfig, setWidgetConfig] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [viewType, setViewType] = useState("overview");
  const [filtersEnabled, setFiltersEnabled] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState("runningFrames");
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [layerMask, setLayerMask] = useState("nk, ass, img");
  const [selectedNode, setSelectedNode] = useState("");
  const title = widgetConfig.title;
  const setTitle = value => handleConfigEdit("title", value);

  const defaultConfig = {
    selected: "",
    filterValue: "",
    title: "Farm"
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

  const projects = new Set();
  const artists = new Set();
  farm.data?.jobs.forEach(job => {
    artists.add(job.user);
    projects.add(job.show);
  });

  const handleFiltersClear = () => {
    setSelectedProjects([]);
    setSelectedArtists([]);
  };
  
  const bottomRowStyle = {
    maxHeight: expanded ? "100px" : 0
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
        <div className={styles.topBar}>
          <div className={styles.column}>
            <div className={styles.topRow}>
              <FormControl sx={{width: "150px"}} size="small">
                <InputLabel>View type</InputLabel>
                <Select
                  label="View type"
                  value={viewType}
                  onChange={e => setViewType(e.target.value)}
                >
                  <MenuItem value={"overview"}>Overview</MenuItem>
                  <MenuItem value={"renders"}>Renders</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{width: "180px"}} size="small">
                <InputLabel>Metric</InputLabel>
                <Select
                  label="Metric"
                  value={selectedMetric}
                  onChange={e => setSelectedMetric(e.target.value)}
                >
                  {Object.entries(METRIC_LABELS).map(([value, label]) =>
                    <MenuItem key={value} value={value}>{label}</MenuItem>
                  )}
                </Select>
              </FormControl>
              <TextField label="Layer mask" value={layerMask} size="small"
                onChange={e => setLayerMask(e.target.value)} />
            </div>
            <div className={styles.bottomRow} style={bottomRowStyle}>
              <FormGroup size="small">
                <FormControlLabel
                  control={<Switch checked={filtersEnabled}
                    onChange={e => setFiltersEnabled(e.target.checked)} />}
                  label="Filters"
                />
              </FormGroup>
              <FormControl sx={{flexGrow: 1, flexBasis: 0}} size="small"
                disabled={!filtersEnabled}>
                <InputLabel>Filter by project</InputLabel>
                <Select
                  label="Filter by project"
                  multiple
                  value={selectedProjects}
                  onChange={e => setSelectedProjects(e.target.value)}
                  MenuProps={MenuProps}
                  renderValue={(selected) => selected.join(", ")}
                >
                  {[...projects].map(data =>
                    <MenuItem key={data} value={data}>
                      <Checkbox checked={selectedProjects.includes(data)} />
                      <ListItemText primary={data} />
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
              <FormControl sx={{flexGrow: 0.5, flexBasis: 0}} size="small"
                disabled={!filtersEnabled}>
                <InputLabel>Filter by artist</InputLabel>
                <Select
                  label="Filter by artist"
                  multiple
                  value={selectedArtists}
                  onChange={e => setSelectedArtists(e.target.value)}
                  MenuProps={MenuProps}
                  renderValue={(selected) => selected.join(", ")}
                >
                  {[...artists].map(data =>
                    <MenuItem key={data} value={data}>
                      <Checkbox checked={selectedArtists.includes(data)} />
                      <ListItemText primary={data} />
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
              <Button variant="outlined" color="secondary" disabled={!filtersEnabled}
                onClick={handleFiltersClear}>
                Clear
              </Button>
            </div>          
          </div>
          {/* <div className={styles.expandButton}
            onClick={() => setExpanded(prev => !prev)}>
            {expanded ?
              <ExpandLessIcon sx={{fontSize: 20}} />
              : <ExpandMoreIcon />
            }
          </div> */}
        </div>
        <div className={styles.graphContainer}>
          {viewType === "overview" ?
            <TreeMap
              data={farm}
              colours={COLOURS}
              filtersEnabled={filtersEnabled}
              selectedMetric={selectedMetric}
              selectedArtists={selectedArtists}
              selectedProjects={selectedProjects}
              layerMask={layerMask}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              labels={METRIC_LABELS}
            />
            : null
          }
        </div>
      </div>
    </Widget>
  );
};

export default Farm;
