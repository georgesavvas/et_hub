import Checkbox from "@mui/material/Checkbox";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { LinearProgress, OutlinedInput } from "@mui/material";
import React, {useState} from "react";
import DataPlaceholder from "../../components/DataPlaceholder";

import styles from "./Todo.module.css";


const SubItem = props => {
  return (
    <div className={styles.subItemContainer}>
      <Checkbox color="success" />
      <OutlinedInput placeholder="Sub Item" size="small" fullWidth />
    </div>
  );
};

const Item = props => {
  const [subItems, setSubItems] = useState([{}, {}]);
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);

  const style = {
    maxHeight: expanded ? "300px" : null
  };

  const expandButtonProps = {
    className: styles.expandButton,
    onClick: () => setExpanded(prev => !prev)
  };

  return (
    <div className={styles.itemContainer} style={style}>
      <div className={styles.firstRow}>
        <Checkbox color="success" size="large" margin="dense" checked={checked} onChange={(e, value) => setChecked(value)} />
        <OutlinedInput placeholder="Item" size="small" fullWidth value={value} onChange={(e, value) => setValue(value)} />
        {expanded ?
          <ExpandLessIcon {...expandButtonProps} />
          : <ExpandMoreIcon {...expandButtonProps} />
        }
      </div>
      {!expanded ? null :
        <div className={styles.row}>
          <div className={styles.subItemListContainer}>
            {subItems.map((item, index) => <SubItem key={index} />)}
          </div>
        </div>
      }
      <LinearProgress color="success" variant="determinate" value={60} />
    </div>
  );
};

const Todo = () => {
  const [mainList, setMainList] = useState([{}, {}, {}]);

  return (
    <div className={styles.container}>
      <div className={styles.listContainer}>
        {mainList.map((item, index) => <Item key={index} />)}
      </div>
    </div>
  );
};

export default Todo;
