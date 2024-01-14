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
import {
  CloseOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  SettingFilled,
} from "@ant-design/icons";
import type { DraggableData, DraggableEvent } from "react-draggable";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

import { ConfigContext } from "../../contexts/ConfigContext";
import Draggable from "react-draggable";
import _ from "lodash";
import styles from "./Widget.module.css";

const { Text } = Typography;

const WidgetSettings = (props) => {
  const { config, setConfig, look } = props;
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
  const draggleRef = useRef<HTMLDivElement>(null);

  const setConfigLookKey = (key, value) => {
    let look = { ...config.look };
    if (value === undefined) look = _.omit(look, key);
    else look[key] = value;
    setConfig("look", look);
  };

  const hasLookOverride = (key) => {
    if (!config.look) return false;
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
          value={config.name}
          onChange={(e) => setConfig("name", e.target.value)}
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
  const { appLook, layoutEditable, layout, tempLayout, setTempLayout } = useContext(ConfigContext);
  const { rglWidget, config, setConfig } = props;
  const [settingsOpen, setSettingsOpen] = useState(false);

  const finalLook = { ...appLook, ...layout.look, ...config.look };

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

  return (
    <div className={styles.view} style={widgetStyle}>
      <WidgetContext.Provider value={[config, setConfig]}>
        <WidgetSettings
          config={config}
          setConfig={setConfig}
          look={finalLook}
          open={settingsOpen}
          onCancel={() => setSettingsOpen(false)}
        >
          {props.settings}
        </WidgetSettings>
        <div className={styles.container}>
          {layoutEditable && <div className={styles.mask} />}
          <div className={styles.top}>
            <Text className={styles.title}>{config.name || "No Title"}</Text>
            <Space gap={5}>
              {!layoutEditable && (
                <SettingFilled
                  className={styles.settingsButton}
                  style={{ fontSize: 18 }}
                  onClick={() => setSettingsOpen(true)}
                />
              )}
              {layoutEditable && (
                <Popconfirm
                  placement="leftTop"
                  title="Remove widget?"
                  onConfirm={handleRemovePressed}
                  okText="Yep"
                  cancelText="Nope"
                >
                  <CloseOutlined className={styles.closeButton} style={{ fontSize: 18 }} />
                </Popconfirm>
              )}
              {!layoutEditable ? (
                tempLayout === null ? (
                  <FullscreenOutlined
                    onClick={() => setTempLayout({ ...rglWidget, x: 0, y: 0, w: 1, h: 1 })}
                    className={styles.maximiseButton}
                    style={{ fontSize: 18 }}
                  />
                ) : (
                  <FullscreenExitOutlined
                    onClick={() => setTempLayout(null)}
                    className={styles.maximiseButton}
                    style={{ fontSize: 18 }}
                  />
                )
              ) : null}
            </Space>
          </div>
          <div className={styles.content}>{props.children}</div>
        </div>
      </WidgetContext.Provider>
    </div>
  );
};

export default Widget;
