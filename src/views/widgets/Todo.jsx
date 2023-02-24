import Checkbox from "@mui/material/Checkbox";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import RepeatIcon from "@mui/icons-material/Repeat";
import {LinearProgress, OutlinedInput} from "@mui/material";
import React, {useState} from "react";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import styles from "./Todo.module.css";


const SubItem = props => {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  return (
    <div className={styles.subItemContainer}>
      <Checkbox color="success" disabled={text === ""} margin="dense"
        checked={checked} onChange={(e, value) => setChecked(value)} />
      <OutlinedInput placeholder="Sub Task" size="small" fullWidth value={text}
        onChange={e => setText(e.target.value)} />
      <Checkbox sx={{padding: "5px"}}
        icon={<EventAvailableIcon sx={{fontSize: 27}} />}
        checkedIcon={
          <EventAvailableIcon color="warning" sx={{fontSize: 27}} />
        }
      />
    </div>
  );
};

const Item = props => {
  const [subItems, setSubItems] = useState([{}, {}, {}, {}]);
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  const subItemListStyle = {
    maxHeight: expanded ? "300px" : 0,
    padding: expanded ? "3px 0" : 0
  };

  return (
    <div className={styles.itemContainer}>
      <div className={styles.itemContainerRow}>
        <div className={styles.firstRow}>
          <Checkbox color="success" disabled={text === ""} margin="dense"
            checked={checked} onChange={(e, value) => setChecked(value)} />
          <OutlinedInput placeholder="Task" size="small" fullWidth value={text}
            onChange={e => setText(e.target.value)} />
          <Checkbox sx={{padding: "5px"}}
            icon={<EventAvailableIcon sx={{fontSize: 27}} />}
            checkedIcon={
              <EventAvailableIcon color="warning" sx={{fontSize: 27}} />
            }
          />
        </div>
        <div className={styles.subItemListContainer} style={subItemListStyle}>
          {subItems.map((item, index) => <SubItem key={index} />)}
        </div>
        {/* <div className={styles.bottomBar}>
          <div className={styles.dueDateContainer}>
            <ScheduleIcon />
            <Typography>Add Due Date</Typography>
          </div>
          <div className={styles.tagContainer}>
            <Chip label="farm" size="small" color="error" />
          </div>
        </div> */}
        <LinearProgress color="success" variant="determinate" value={60} />
      </div>
      <div className={styles.addToTodayButton}>
        
      </div>
      <div className={styles.expandButton} onClick={() => setExpanded(prev => !prev)}>
        {expanded ?
          <ExpandLessIcon sx={{fontSize: 20}} />
          : <ExpandMoreIcon />
        }
      </div>
    </div>
  );
};

const tabStyle = {
  padding: 0,
  height: "10px"
};

const Todo = () => {
  const [mainList, setMainList] = useState([{}, {}, {}]);
  const [tab, setTab] = useState("main");

  return (
    <div className={styles.container}>
      <TabContext value={tab}>
        <div className={styles.tabsContainer}>
          <TabList onChange={(e, value) => setTab(value)}>
            <Tab sx={tabStyle} label="Tasks" iconPosition="start" icon={<FormatListBulletedIcon />} value="main" />
            <Tab sx={tabStyle} label="Today" iconPosition="start" icon={<EventAvailableIcon />} value="today" />
            <Tab sx={tabStyle} label="Recurring" iconPosition="start" icon={<RepeatIcon />} value="repeat" />
          </TabList>
        </div>
        <TabPanel sx={{padding: 0, paddingTop: "10px"}} value="main">
          <div className={styles.listContainer}>
            {mainList.map((item, index) => <Item key={index} />)}
          </div>
        </TabPanel>
        <TabPanel value="today">
          <div className={styles.todayContainer}>
          </div>
        </TabPanel>
        <TabPanel value="repeat">
          <div className={styles.repeatContainer}>
          </div>
        </TabPanel>
      </TabContext>
    </div>
  );
};

export default Todo;
