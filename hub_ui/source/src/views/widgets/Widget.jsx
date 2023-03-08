import styles from "./Widget.module.css";
import Close from "@mui/icons-material/Close";
import Settings from "@mui/icons-material/Settings";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import React, {useEffect, useState} from "react";
import { Typography } from "@mui/material";

import Modal from "../../components/Modal";


const WidgetSettings = props => {
  return (
    <Modal maxWidth="md" open={props.open} onClose={props.onClose}>
      <div className={styles.settingsContainer}>{props.children}</div>
    </Modal>
  );
};

const Widget = props => {

  const handleRemovePressed = () => {
    props.onRemove(props.rglKey);
  };

  return (
    <div className={styles.view}>
      {props.settings ?
        <WidgetSettings
          open={props.settingsOpen}
          onClose={() => props.setSettingsOpen(false)}
        >
          {props.settings}
        </WidgetSettings>
        : null
      }
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.topLeft}>
            <DragIndicatorIcon className={"dragHandle " + styles.dragHandle} />
          </div>
          <div className={styles.topCentre}>
            <Typography className={styles.title} variant="body1">
              {props.title}
            </Typography>
          </div>
          <div className={styles.topRight}>
            <Settings className={styles.settingsButton}
              onClick={() => props.setSettingsOpen(true)} />
            <Close className={styles.closeButton}
              onClick={handleRemovePressed} />
          </div>
        </div>
        <div className={styles.content}>
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default Widget;
