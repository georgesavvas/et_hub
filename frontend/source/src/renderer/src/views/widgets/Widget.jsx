import React, {useContext, useEffect, useState} from "react";

import { ConfigContext } from "../../contexts/ConfigContext";
// import Close from "@mui/icons-material/Close";
// import Settings from "@mui/icons-material/Settings";
// import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { HolderOutlined } from "@ant-design/icons";
// import Modal from "../../components/Modal";
import { Typography } from "antd";
import styles from "./Widget.module.css";

const { Text } = Typography;



const WidgetSettings = props => {
  return (
    <Modal
      maxWidth="md"
      title={`Settings - ${props.title}`}
      open={props.open}
      onClose={props.onClose}
    >
      <div className={styles.settingsContainer}>{props.children}</div>
    </Modal>
  );
};

const Widget = props => {
  const {appLook}  = useContext(ConfigContext);

  const widgetStyle = {
    backgroundColor: `rgba(${appLook.widgetColour.r}, ${appLook.widgetColour.g}, ${
      appLook.widgetColour.b
    }, ${1 - appLook.widgetTranslucency})`,
    backdropFilter: `blur(${appLook.widgetBlur}px)`,
  };

  const handleRemovePressed = () => {
    props.onRemove(props.rglKey);
  };

  return (
    <div className={styles.view} style={widgetStyle}>
      {/* {props.settings ?
        <WidgetSettings
          title={props.rglKey}
          open={props.settingsOpen}
          onClose={() => props.setSettingsOpen(false)}
        >
          {props.settings}
        </WidgetSettings>
        : null
      } */}
      <div className={styles.container}>
        <div className={styles.top}>
          {/* <div className={styles.topLeft}>
            <HolderOutlined className={"dragHandle " + styles.dragHandle} />
          </div> */}
          <div className={styles.topCentre}>
            <Text className={styles.title}>
              {props.title || "No Title"}
            </Text>
          </div>
          {/* <div className={styles.topRight}>
            <Settings className={styles.settingsButton}
              onClick={() => props.setSettingsOpen(true)} />
            <Close className={styles.closeButton}
              onClick={handleRemovePressed} />
          </div> */}
        </div>
        <div className={styles.content}>
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default Widget;
