import { CloseOutlined, SettingFilled } from "@ant-design/icons";
// import Modal from "../../components/Modal";
import { Popconfirm, Space, Typography } from "antd";
import React, {useContext, useEffect, useState} from "react";

import { ConfigContext } from "../../contexts/ConfigContext";
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
  const {appLook, layoutEditable}  = useContext(ConfigContext);

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
      {layoutEditable && <div className={styles.mask} />}
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
          <Text className={styles.title}>
            {props.title || "No Title"}
          </Text>
          <Space gap={5}>
            <SettingFilled className={styles.settingsButton} style={{fontSize: 18}}
              onClick={() => props.setSettingsOpen(true)} />
            <Popconfirm placement="leftTop" title="Remove widget?" onConfirm={handleRemovePressed} okText="Yep" cancelText="Nope">
              <CloseOutlined className={styles.closeButton} style={{fontSize: 18}} />
            </Popconfirm>
          </Space>
        </div>
        <div className={styles.content}>
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default Widget;
