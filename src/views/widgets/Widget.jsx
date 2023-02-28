import styles from "./Widget.module.css";
import Close from "@mui/icons-material/Close";
import Settings from "@mui/icons-material/Settings";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import React, {useEffect, useState} from "react";
import { Typography } from "@mui/material";

import { useResizeDetector } from "react-resize-detector";
import Farm from "./Farm/Farm";
import Support from "./Support";
import Projects from "./Projects";
import Workstation from "./Workstation";
import Wiki from "./Wiki";
import Apps from "./Apps";
import Todo from "./Todo";
import Notes from "./Notes";
import Rundeck from "./Rundeck";
import Licenses from "./Licenses";
import Modal from "../../components/Modal";


const widgets = {
  projects: {
    widget: Projects,
    title: "Projects"
  },
  workstation: {
    widget: Workstation,
    title: "Workstation"
  },
  farm: {
    widget: Farm,
    title: "Farm"
  },
  support: {
    widget: Support,
    title: "Support"
  },
  wiki: {
    widget: Wiki,
    title: "Wiki"
  },
  apps: {
    widget: Apps,
    title: "Apps"
  },
  todo: {
    widget: Todo,
    title: "Todo"
  },
  notes: {
    widget: Notes,
    title: "Notes"
  },
  licenses: {
    widget: Licenses,
    title: "Licenses"
  },
  rundeck: {
    widget: Rundeck,
    title: "Rundeck"
  }
};

const WidgetSettings = props => {
  return (
    <Modal {...props} />
  );
};

const Widget = props => {
  const { width, height, ref } = useResizeDetector();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState("");

  useEffect(() => {
    setSelectedWidget(widgets[props.widget]);
  }, [props.widget]);

  const handleOpenSettings = () => setSettingsOpen(true);
  const handleCloseSettings = () => setSettingsOpen(false);

  const handleRemovePressed = () => {
    props.onRemove(props.rglKey);
  };

  const SelectedWidget = selectedWidget?.widget;

  return (
    <div className={styles.view}>
      <WidgetSettings open={settingsOpen} onClose={handleCloseSettings} title={props.rglKey} />
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.topLeft}>
            <DragIndicatorIcon className={"dragHandle " + styles.dragHandle} />
          </div>
          <div className={styles.topCentre}>
            <Typography className={styles.title} variant="body1">
              {selectedWidget?.title}
            </Typography>
          </div>
          <div className={styles.topRight}>
            <Settings className={styles.settingsButton}
              onClick={handleOpenSettings} />
            <Close className={styles.closeButton}
              onClick={handleRemovePressed} />
          </div>
        </div>
        <div className={styles.content} ref={ref}>
          {SelectedWidget ? <SelectedWidget size={[width, height]} /> : null}
        </div>
      </div>
    </div>
  );
};

export default Widget;
