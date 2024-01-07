import {
  Button,
  Card,
  Checkbox,
  ColorPicker,
  Divider,
  Input,
  Modal,
  Popconfirm,
  Slider,
  Space,
  Typography,
} from "antd";
import { CloseOutlined, SettingFilled } from "@ant-design/icons";
import type { DraggableData, DraggableEvent } from "react-draggable";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

import { ConfigContext } from "../../contexts/ConfigContext";
import Draggable from "react-draggable";
import _ from "lodash";
import styles from "./Widget.module.css";

const { Text } = Typography;

const WidgetSettings = (props) => {
  const { config, setConfigKey, setConfigLookKey, look } = props;
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
  const draggleRef = useRef<HTMLDivElement>(null);

  const hasLookOverride = (key) => {
    return Object.hasOwn(config.look, key);
  };

  const toggleLookOverride = (key) => {
    if (hasLookOverride(key)) setConfigLookKey(key, undefined);
    else setConfigLookKey(key, look[key]);
  };

  const onDragStart = (_event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  return (
    <Modal
      title={
        <div
          style={{
            width: "100%",
            cursor: "move",
          }}
          onMouseOver={() => {
            if (disabled) {
              setDisabled(false);
            }
          }}
          onMouseOut={() => {
            setDisabled(true);
          }}
        >
          Widget Settings
        </div>
      }
      width="35%"
      open={props.open}
      onCancel={props.onCancel}
      cancelText="Ok"
      centered
      mask={false}
      footer={
        <Button key="ok" onClick={props.onCancel} type="primary">
          Ok
        </Button>
      }
      modalRender={(modal) => (
        <Draggable
          disabled={disabled}
          bounds={bounds}
          nodeRef={draggleRef}
          onStart={(event, uiData) => onDragStart(event, uiData)}
        >
          <div ref={draggleRef}>{modal}</div>
        </Draggable>
      )}
    >
      <div className={styles.settingsContainer}>
        <Input
          placeholder="Widget name"
          value={config.title}
          onChange={(e) => setConfigKey("title", e.target.value)}
        />
        <Card title="Look overrides" style={{ width: "100%" }}>
          <Space direction="vertical">
            <Space>
              <Checkbox
                checked={hasLookOverride("widgetColour")}
                onChange={() => toggleLookOverride("widgetColour")}
              >
                Colour
              </Checkbox>
              <ColorPicker
                disabledAlpha
                value={look.widgetColour}
                onChange={(value) => setConfigLookKey("widgetColour", value)}
              />
            </Space>
            <Space>
              <Checkbox
                checked={hasLookOverride("widgetTranslucency")}
                onChange={() => toggleLookOverride("widgetTranslucency")}
              >
                Translucency
              </Checkbox>
              <Slider
                min={0}
                max={1}
                step={0.05}
                style={{ width: 200 }}
                value={look.widgetTranslucency}
                onChange={(value) => setConfigLookKey("widgetTranslucency", value)}
              />
            </Space>
            <Space>
              <Checkbox
                checked={hasLookOverride("widgetBlur")}
                onChange={() => toggleLookOverride("widgetBlur")}
              >
                Blur
              </Checkbox>
              <Slider
                min={0}
                max={50}
                style={{ width: 200 }}
                value={look.widgetBlur}
                onChange={(value) => setConfigLookKey("widgetBlur", value)}
              />
            </Space>
          </Space>
        </Card>
        <Divider />
        {props.children}
      </div>
    </Modal>
  );
};

export const WidgetContext = createContext({});

const Widget = (props) => {
  const { appLook, layoutEditable, layout } = useContext(ConfigContext);
  const [config, setConfig] = useState({ title: "", look: {} });

  const finalLook = { ...appLook, ...layout.look, ...config.look };

  // console.log("App", { ...appLook });
  // console.log("Layout", { ...layout.look });
  // console.log("Widget", { ...appLook });
  // console.log("Final", { ...finalLook });

  const widgetColour = finalLook.widgetColour.toRgb
    ? finalLook.widgetColour.toRgb()
    : finalLook.widgetColour;
  const widgetStyle = {
    backgroundColor: `rgba(${widgetColour.r}, ${widgetColour.g}, ${widgetColour.b}, ${
      1 - finalLook.widgetTranslucency
    })`,
    backdropFilter: `blur(${finalLook.widgetBlur}px)`,
  };

  const handleRemovePressed = () => {
    props.onRemove(props.rglKey);
  };

  const setConfigKey = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const setConfigLookKey = (key, value) => {
    setConfig((prev) => {
      let look = { ...prev.look };
      if (value === undefined) look = _.omit(look, key);
      else look[key] = value;
      return { ...prev, look: look };
    });
  };

  return (
    <div className={styles.view} style={widgetStyle}>
      <WidgetContext.Provider value={[config, setConfigKey]}>
        {props.settings ? (
          <WidgetSettings
            title={props.rglKey}
            config={config}
            look={finalLook}
            setConfigKey={setConfigKey}
            setConfigLookKey={setConfigLookKey}
            open={props.settingsOpen}
            onCancel={() => props.setSettingsOpen(false)}
          >
            {props.settings}
          </WidgetSettings>
        ) : null}
        <div className={styles.container}>
          {layoutEditable && <div className={styles.mask} />}
          <div className={styles.top}>
            <Text className={styles.title}>{config.title || "No Title"}</Text>
            <Space gap={5}>
              <SettingFilled
                className={styles.settingsButton}
                style={{ fontSize: 18 }}
                onClick={() => props.setSettingsOpen(true)}
              />
              <Popconfirm
                placement="leftTop"
                title="Remove widget?"
                onConfirm={handleRemovePressed}
                okText="Yep"
                cancelText="Nope"
              >
                <CloseOutlined className={styles.closeButton} style={{ fontSize: 18 }} />
              </Popconfirm>
            </Space>
          </div>
          <div className={styles.content}>{props.children}</div>
        </div>
      </WidgetContext.Provider>
    </div>
  );
};

export default Widget;
