import styles from "./Widget.module.css";
import Close from "@mui/icons-material/Close";
import Settings from "@mui/icons-material/Settings";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
// import { Modal, Button } from "react-bootstrap";
// import { withSize } from "react-sizeme";
import React, {useState} from "react";
import { Button, Modal, Typography } from "@mui/material";

function Widget(props) {
  const [showSettings, setShowSettings] = useState(false);
  const [viewSize, setViewSize] = useState({});

  const handleCloseSettings = () => setShowSettings(false);
  const handleShowSettings = () => setShowSettings(true);

  const handleRemovePressed = () => {
    props.handleRemoveView(props.rglKey);
  };

  const drag_handle_style = {
    position: "absolute",
    top: "5px",
    left: "0px",
    color: "rgb(200, 200, 200)",
    opacity: "0.25",
    fontSize: "40"
  };

  return (
    <div className={styles.view}>
      <Typography className={styles.title} variant="h6">{props.title}</Typography>
      <Close className={styles.close_button} onClick={handleRemovePressed} />
      <Settings className={styles.settings_button} onClick={handleShowSettings} />
      <DragIndicatorIcon className="dragHandle" style={drag_handle_style} />
      <div className={styles.content}>
        {props.children}
      </div>
    </div>
  );
}

export default Widget;
