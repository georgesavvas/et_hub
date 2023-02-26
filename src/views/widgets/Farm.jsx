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
  const [filtersEnabled, setFiltersEnabled] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);

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

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
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
            // value={age}
            label="Filter by project"
            multiple
            value={selectedProjects}
            onChange={e => setSelectedProjects(e.target.value)}
            MenuProps={MenuProps}
            renderValue={(selected) => selected.join(", ")}
            // onChange={handleChange}
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
            // value={age}
            label="Filter by artist"
            multiple
            value={selectedArtists}
            onChange={e => setSelectedArtists(e.target.value)}
            MenuProps={MenuProps}
            // renderValue={(selected) => console.log(selected)}
            renderValue={(selected) => selected.join(", ")}
            // onChange={handleChange}
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
      <ResponsiveTreeMap
        data={farm.data}
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
  );
};

export default Farm;
