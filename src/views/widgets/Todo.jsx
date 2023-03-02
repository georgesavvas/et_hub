import Checkbox from "@mui/material/Checkbox";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ClearIcon from "@mui/icons-material/Clear";
import RepeatIcon from "@mui/icons-material/Repeat";
import {Divider, IconButton, LinearProgress, OutlinedInput, Typography, TextField} from "@mui/material";
import React, {useState} from "react";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import DataPlaceholder from "../../components/DataPlaceholder";
import debounce from "lodash.debounce";
import loadFromLS from "../../utils/loadFromLS";
import saveToLS from "../../utils/saveToLS";
import Widget from "./Widget";

import styles from "./Todo.module.css";
import { useEffect } from "react";


const debounced = debounce(fn => fn(), 500);

const SubTask = props => {
  const {task} = props;
  const {text, checked, today} = task;

  const handleSubTaskChange = (index, field, value) => {
    props.setTasks(prev => {
      const tasks = [...prev];
      const task = tasks[props.taskIndex];
      if (!task) tasks[props.taskIndex] = {};
      const subTasks = tasks[props.taskIndex].subTasks || [];
      if (index == subTasks.length) subTasks.push({taskIndex: props.taskIndex});
      subTasks[index][field] = value;
      tasks[props.taskIndex].subTasks = subTasks;
      return tasks;
    });
  };

  const handleSubTaskClear = () => {
    props.setTasks(prev => {
      const tasks = [...prev];
      const subTasks = tasks[props.taskIndex].subTasks;
      if (props.index < subTasks.length) subTasks.splice(props.index, 1);
      return tasks;
    });
  };

  const handleTextChange = e => {
    handleSubTaskChange(props.index, "text", e.target.value);
  };

  const handleCheckedChange = e => {
    handleSubTaskChange(props.index, "checked", e.target.checked);
  };

  const handleTodayChange = e => {
    handleSubTaskChange(props.index, "today", e.target.checked);
  };

  if (props.compact) return (
    <div className={styles.compactContainer}>
      <Checkbox color="success" disabled={!text || props.disabled} tabIndex={-1}
        checked={checked || false} onChange={handleCheckedChange} margin="dense"
      />
      <Typography variant="h6" style={{color: "rgb(150, 150, 150)"}}>
        {props.parentText} /&nbsp;
      </Typography>
      <Typography variant="h6">{text}</Typography>
    </div>
  );

  return (
    <div className={styles.subItemContainer}>
      <Checkbox color="success" disabled={!text || props.disabled} tabIndex={-1}
        checked={checked || false} onChange={handleCheckedChange} margin="dense"
      />
      <OutlinedInput placeholder="Add subtask..." size="small" fullWidth
        onBlur={() => props.onFocusChange(false)}
        onFocus={() => props.onFocusChange(true)}
        value={text || ""} onChange={handleTextChange} disabled={props.disabled}
      />
      <Checkbox sx={{padding: "5px"}} disabled={props.last || props.disabled}
        onChange={handleTodayChange} checked={today || false}
        icon={<EventAvailableIcon sx={{fontSize: 27}} />} tabIndex={-1}
        checkedIcon={
          <EventAvailableIcon color="warning" sx={{fontSize: 27}}
            tabIndex={-1} />
        }
      />
      <IconButton size="small" color="error" tabIndex={-1}
        disabled={props.last} onClick={handleSubTaskClear}>
        <ClearIcon sx={{fontSize: 27}} />
      </IconButton>
    </div>
  );
};

const Task = props => {
  const [expanded, setExpanded] = useState(false);
  const {task} = props;
  const {text, checked, today} = task;
  const subTasks = task.subTasks || [];
  const completed = subTasks.filter(st => st.checked);
  const progress = subTasks.length ?
    completed.length / subTasks.length * 100 :
    checked ? 100 : 0;

  const handleTaskChange = (index, field, value) => {
    props.setTasks(prev => {
      const existing = [...prev];
      if (index == existing.length) existing.push({});
      existing[index][field] = value;
      return existing;
    });
  };

  const handleTaskClear = () => {
    props.setTasks(prev => {
      if (props.index >= prev.length) return prev;
      const existing = [...prev];
      existing.splice(props.index, 1);
      return existing;
    });
  };

  const handleTextChange = e => {
    handleTaskChange(props.index, "text", e.target.value);
  };

  const handleCheckedChange = e => {
    handleTaskChange(props.index, "checked", e.target.checked);
  };

  const handleTodayChange = e => {
    handleTaskChange(props.index, "today", e.target.checked);
  };

  const onFocusChange = value => {
    if (value) setExpanded(true);
    else if (!subTasks.length) setExpanded(false);
  };

  const subItemListStyle = {
    maxHeight: expanded ? "300px" : 0,
    padding: expanded ? "3px 0" : 0
  };

  if (props.compact) return (
    <div className={styles.compactContainer}>
      <Checkbox color="success" disabled={!text || props.disabled} tabIndex={-1}
        checked={checked || false} onChange={handleCheckedChange} margin="dense"
      />
      <Typography variant="h6">{text}</Typography>
    </div>
  );

  return (
    <div className={styles.itemContainer}>
      <div className={styles.itemContainerRow}>
        <div className={styles.firstRow}>
          <Checkbox color="success" disabled={!text || subTasks.length > 0}
            margin="dense" tabIndex={-1} onChange={handleCheckedChange}
            checked={checked || subTasks.length ? progress === 100 : false} />
          <OutlinedInput placeholder="Add task..." size="small"
            fullWidth value={text || ""} onChange={handleTextChange} />
          <Checkbox sx={{padding: "5px"}} checked={today || false}
            onChange={handleTodayChange} disabled={props.last}
            icon={<EventAvailableIcon sx={{fontSize: 27}} />} tabIndex={-1}
            checkedIcon={
              <EventAvailableIcon color="warning" tabIndex={-1}
                sx={{fontSize: 27}} />
            }
          />
          <IconButton tabIndex={-1} size="small" color="error"
            disabled={props.last} onClick={handleTaskClear}>
            <ClearIcon sx={{fontSize: 27}} tabIndex={-1} />
          </IconButton>
        </div>
        <div className={styles.subItemListContainer} style={subItemListStyle}>
          {[...subTasks, {}].map((subTask, index) =>
            <SubTask index={index} taskIndex={props.index} disabled={!text}
              key={index} last={index == subTasks.length} task={subTask}
              setTasks={props.setTasks} onFocusChange={onFocusChange}
            />
          )}
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
        <LinearProgress color="success" variant="determinate"
          value={progress} />
      </div>
      <div className={styles.expandButton}
        onClick={() => setExpanded(prev => !prev)}>
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

const Todo = props => {
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [first, setFirst] = useState(true);
  const [tab, setTab] = useState("tasks");
  const [widgetConfig, setWidgetConfig] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const title = widgetConfig.title;
  const setTitle = value => handleConfigEdit("title", value);

  const defaultConfig = {
    selected: "",
    filterValue: "",
    title: "Apps"
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
    if (first) {
      setTasks(loadFromLS("widget_todo") || []);
      setFirst(false);
      return;
    }
    debounced(() => saveToLS("widget_todo", tasks));
  }, [tasks]);

  const getTodayTasks = () => {
    const checked = [];
    const unchecked = [];
    tasks.forEach((task, index) => {
      const hasSubTasks = task.subTasks?.length > 0;
      if (task.today && !hasSubTasks) {
        const list = task.checked ? checked : unchecked;
        list.push(
          <Task key={index} index={index} task={task} setTasks={setTasks}
            compact />
        );
      }
      if (hasSubTasks) {
        task.subTasks.forEach((st, stIndex) => {
          if (task.today || st.today) {
            const stKey = `${index}_${stIndex}`;
            const list = st.checked ? checked : unchecked;
            list.push(
              <SubTask key={stKey} task={st} index={stIndex} taskIndex={index}
                setTasks={setTasks} compact parentText={task.text} />
            );
          }
        });
      }
    });
    return [checked, unchecked];
  };
  const [todayChecked, todayUnchecked] = getTodayTasks();

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
        <TabContext value={tab}>
          <div className={styles.tabsContainer}>
            <TabList onChange={(e, value) => setTab(value)}>
              <Tab sx={tabStyle} label="Tasks" iconPosition="start"
                icon={<FormatListBulletedIcon />} value="tasks" />
              <Tab sx={tabStyle} label="Today" iconPosition="start"
                icon={<EventAvailableIcon />} value="today" />
              <Tab sx={tabStyle} label="Recurring" iconPosition="start"
                icon={<RepeatIcon />} value="repeat" />
            </TabList>
          </div>
          <TabPanel sx={{padding: 0, paddingTop: "10px"}} value="tasks">
            <div className={styles.tasksContainer}>
              {[...tasks, {}].map((task, index) =>
                <Task index={index} task={task} key={index} setTasks={setTasks}
                  last={index == tasks.length}
                />
              )}
            </div>
          </TabPanel>
          <TabPanel value="today">
            <div className={styles.todayContainer}>
              {!todayChecked.length && !todayUnchecked.length
                ? <DataPlaceholder text="No tasks for today..." />
                : null
              }
              {todayUnchecked.length
                ? <>
                  <Typography variant="h6">In Progress</Typography>
                  <div className={styles.todayUnchecked}>
                    {todayUnchecked}
                  </div>
                </>
                : null
              }
              {todayChecked.length
                ? <>
                  <Typography variant="h6" style={{marginTop: "15px"}}>Completed</Typography>
                  <div className={styles.todayChecked}>
                    {todayChecked}
                  </div>
                </>
                : null
              }
            </div>
          </TabPanel>
          <TabPanel value="repeat">
            <div className={styles.repeatContainer}>
              <DataPlaceholder text="Coming soon!" />
            </div>
          </TabPanel>
        </TabContext>
      </div>
    </Widget>
  );
};

export default Todo;
