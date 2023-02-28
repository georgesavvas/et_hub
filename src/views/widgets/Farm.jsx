import React, {useContext, useState} from "react";
import { ResponsiveTreeMap } from "@nivo/treemap";
import DataPlaceholder from "../../components/DataPlaceholder";
import {DataContext} from "../../contexts/DataContext";
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
import { set } from "lodash";


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

const Farm = () => {
  const {farm} = useContext(DataContext);
  const [expanded, setExpanded] = useState(false);
  const [viewType, setViewType] = useState("");
  const [filtersEnabled, setFiltersEnabled] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);

  const getViewState = () => {
    const data = {name: "View Name"};
    const children = [];
    farm.data.jobs.forEach(job => {
      
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
    // maxHeight: expanded ? "100px" : 0,
    // padding: expanded ? "3px 0" : 0
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
          <ResponsiveTreeMap data={farm.data}
            identity="name"
            value="loc"
            // tile="binary"
            valueFormat=" >-.2s"
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            labelSkipSize={12}
            parentLabelPosition="top"
            labelTextColor="lightgrey"
            parentLabelTextColor="lightgrey"
            colors={{ scheme: "nivo" }}
            borderColor={{
              from: "color",
              modifiers: [
                [
                  "darker",
                  2
                ]
              ]
            }}
            animate={false}
            motionConfig="slow"
          />
        </div>
      </div>
    </div>
  );
};

export default Farm;
