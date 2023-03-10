import React from "react";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import styles from "./DynamicList.module.css";
import { Typography } from "@mui/material";


const style = {
  width: "100%",
  height: "100%",
  boxSizing: "border-box",
  backgroundColor: "rgb(20,20,20)",
  overflowY: "scroll",
  flexGrow: 1
};

function createListItem(child, index, dense) {
  return (
    <ListItem key={index} dense={dense}>
      {child}
    </ListItem>
  );
}

function buttons(props) {
  return (
    <div className={styles.buttonContainer}>
      {props.title ? 
        <Typography variant="h5" className={styles.title}>
          {props.title}
        </Typography>
        :null
      }
      <AddIcon className={styles.button} onClick={props.onAdd || null}/>
      <RemoveIcon className={styles.button} onClick={props.onRemove || null}/>
    </div>
  );
}

function DynamicList(props) {
  return (
    <>
      {props.noButtons ? null : buttons(props)}
      <List sx={style} onScroll={props.onScroll} style={props.style} ref={props.innerRef}>
        {
          props.children ?
            props.children.map((child, index) => createListItem(child, index, props.dense)) :
            null
        }
      </List>
    </>
  );
}

export default DynamicList;
