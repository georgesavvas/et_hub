import React, {useContext, useState} from "react";
import { ResponsiveTreeMap } from "@nivo/treemap";
import DataPlaceholder from "../../../components/DataPlaceholder";
import {DataContext} from "../../../contexts/DataContext";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import styles from "./Farm.module.css";
import { Button, FormControlLabel, FormGroup, Switch } from "@mui/material";


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

const nivoTheme = {
  fontSize: 14,
  tooltip: {
    container: {
      background: "rgb(20, 20, 20)",
      color: "rgb(200, 200, 200)",
      fontSize: 16
    },
  }
};

const Farm = () => {
  const {farm} = useContext(DataContext);
  const [expanded, setExpanded] = useState(false);
  const [viewType, setViewType] = useState("");
  const [filtersEnabled, setFiltersEnabled] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [layerMask, setLayerMask] = useState("ass, img");
  const [selectedNode, setSelectedNode] = useState("");

  const getViewState = () => {
    const data = {name: "View Name"};
    const shows = {};
    const allowedLayers = layerMask.replaceAll(" ", "").split(",");
    farm.data.jobs.forEach(job => {
      const show = job.show;
      const shot = job.shot;
      if (!shows[show]) shows[show] = {
        name: show,
        shots: {shot: []}
      };
      else if (!shows[show].shots[shot]) shows[show].shots[shot] = {shot: []};
      shows[show].shots[shot].push({
        name: job.name,
        frames: 1
      });
    //   job.layers.forEach(l => {
    //     if (allowedLayers.some(name => l.name.startsWith(name + "."))) {
    //       shows[show].statuses.r += l.runningFrames;
    //       shows[show].statuses.f += l.succeededFrames;
    //       shows[show].statuses.e += l.deadFrames;
    //       shows[show].statuses.w += l.pendingFrames;
    //     }
    //   });
    // });
    // data.children = Object.values(shows).map(show => {
    //   const path = [data.name, show.name].join(".");
    //   const s = path === selectedNode || selectedNode == data.name;
    //   show.children = [
    //     {name: "Running", frames: s ? show.statuses.r : 1},
    //     {name: "Error", frames: s ? show.statuses.e : 1},
    //     // {name: "Finished", frames: s ? show.statuses.f : 1},
    //     {name: "Waiting", frames: s ? show.statuses.w : 1}
    //   ];
    //   return show;
    });
    data.children = Object.values(shows).map(show => {
      show.children = Object.values(shots).map(shot => {
        const path = [data.name, show.name].join(".");
        const s = path === selectedNode || selectedNode == data.name;
        return shot;
      });
      return show;
    });
    return data;
  };

  const projects = new Set();
  const artists = new Set();
  farm.data.jobs.forEach(job => {
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

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.column}>
          <div className={styles.topRow}>
            <FormControl sx={{width: "150px"}} size="small">
              <InputLabel>Graph type</InputLabel>
              <Select
                label="Graph type"
                value="state"
                // value={viewType}
                onChange={e => setViewType(e.target.value)}
              >
                <MenuItem value={"state"}>Frame amount</MenuItem>
              </Select>
            </FormControl>
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
        <div className={styles.expandButton}
          onClick={() => setExpanded(prev => !prev)}>
          {expanded ?
            <ExpandLessIcon sx={{fontSize: 20}} />
            : <ExpandMoreIcon />
          }
        </div>
      </div>
      <div className={styles.graphContainer}>
        <div className={styles.graph}>
          <ResponsiveTreeMap data={getViewState()}
            identity="name"
            value="frames"
            tile="binary"
            valueFormat=".02s"
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            labelSkipSize={18}
            parentLabelSize={24}
            labelTextColor="lightgrey"
            // orientLabel={false}
            parentLabelTextColor="lightgrey"
            // colors={node => COLOURS[node.id] || "rgb(10, 10, 10)"}
            colors={{scheme: "paired"}}
            // nodeOpacity={1}
            // borderColor="rgb(10, 10, 10)"
            // borderWidth={2}
            theme={nivoTheme}
            onClick={node => setSelectedNode(node.path)}
            // animate={false}
            // outerPadding={5}
            // innerPadding={5}
            // leavesOnly
            parentLabel={node => node.path.includes(selectedNode) ? `${node.id}` : ""}
            label={node => node.path.includes(selectedNode) ? `${node.id}` : ""}
            // label={node => `${node.id}: ${node.formattedValue}`}
            motionConfig="slow"
          />
        </div>
      </div>
    </div>
  );
};

export default Farm;
