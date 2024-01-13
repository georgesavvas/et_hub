import {
  Avatar,
  Button,
  Card,
  ColorPicker,
  Divider,
  Flex,
  Modal,
  Radio,
  Slider,
  Space,
  Switch,
  Typography,
  Upload,
  message,
} from "antd";
import {
  QuestionCircleFilled,
  SettingFilled,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import React, { useContext, useEffect, useState } from "react";

import { ConfigContext } from "../contexts/ConfigContext";
import Logo from "../components/Logo";
import ManageLayouts from "./ManageLayouts";
import type { MenuProps } from "antd";
import type { UploadProps } from "antd";
import styles from "./Sidebar.module.css";
import widgets from "./widgets";

const { Title, Text } = Typography;

const SettingsModal = ({ open, onOk, onCancel }) => {
  const { appLook, setAppLook, resetBgLook, resetWidgetLook, setAppBgImage, backgroundImage } =
    useContext(ConfigContext);
  const [messageApi, contextHolder] = message.useMessage();

  const handleImageChange = (selectedImage) => {
    setAppBgImage(selectedImage);
  };

  const uploadProps: UploadProps = {
    multiple: false,
    customRequest: ({ onSuccess }) => {
      setTimeout(() => {
        onSuccess();
      }, 100);
    },
    onChange(info) {
      console.log(info);
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        messageApi.success(`${info.file.name} file uploaded successfully.`);
        handleImageChange(info.file.originFileObj);
      } else if (status === "error") {
        messageApi.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  const bgColour = appLook.bgColour.toRgb ? appLook.bgColour.toRgb() : appLook.bgColour;
  const previewStyle = {
    filter: `brightness(${appLook.bgBrightness}%)`,
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
    backgroundColor: `rgb(${bgColour.r}, ${bgColour.g}, ${bgColour.b}})`,
  };

  const widgetColour = appLook.widgetColour.toRgb
    ? appLook.widgetColour.toRgb()
    : appLook.widgetColour;
  const previewWidgetStyle = {
    backgroundColor: `rgba(${widgetColour.r}, ${widgetColour.g}, ${widgetColour.b}, ${
      1 - appLook.widgetTranslucency
    })`,
    backdropFilter: `blur(${appLook.widgetBlur}px)`,
  };

  return (
    <Modal
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      mask={false}
      width="40%"
      footer={
        <Button key="ok" onClick={onCancel} type="primary">
          Ok
        </Button>
      }
    >
      {contextHolder}
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <div className={styles.previewContainer} style={previewStyle}>
          <div className={styles.previewWidget} style={previewWidgetStyle} />
        </div>
        <Card
          title="Background Image"
          extra={<Button onClick={resetBgLook}>Revert to defaults</Button>}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <Upload.Dragger {...uploadProps} accept="image/*">
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
            </Upload.Dragger>
            <Button onClick={() => setAppBgImage()}>Remove background image</Button>
            <Space>
              <p>Colour</p>
              <ColorPicker
                disabledAlpha
                value={appLook.bgColour}
                onChange={(value) => setAppLook("bgColour", value)}
              />
            </Space>
            <Space>
              <p>Brightness</p>
              <Slider
                min={0}
                max={100}
                style={{ width: 200 }}
                value={appLook.bgBrightness}
                onChange={(value) => setAppLook("bgBrightness", value)}
              />
            </Space>
          </Space>
        </Card>
        <Card title="Widgets" extra={<Button onClick={resetWidgetLook}>Revert to defaults</Button>}>
          <Space direction="vertical">
            <Space>
              <p>Colour</p>
              <ColorPicker
                disabledAlpha
                value={appLook.widgetColour}
                onChange={(value) => setAppLook("widgetColour", value)}
              />
            </Space>
            <Space>
              <p>Translucency</p>
              <Slider
                min={0}
                max={1}
                step={0.05}
                style={{ width: 200 }}
                value={appLook.widgetTranslucency}
                onChange={(value) => setAppLook("widgetTranslucency", value)}
              />
            </Space>
            <Space>
              <p>Blur</p>
              <Slider
                min={0}
                max={50}
                style={{ width: 200 }}
                value={appLook.widgetBlur}
                onChange={(value) => setAppLook("widgetBlur", value)}
              />
            </Space>
          </Space>
        </Card>
      </Space>
    </Modal>
  );
};

const Sidebar = () => {
  const {
    layoutEditable,
    setLayoutEditable,
    layouts,
    selectedLayout,
    setSelectedLayout,
    pinnedLayouts,
  } = useContext(ConfigContext);
  const { setActivePage, setTempLayout } = useContext(ConfigContext);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [manageLayoutsOpen, setManageLayoutsOpen] = useState(false);

  const getMenuItem = ([id, widget]) => {
    const handleDragStart = (e) => {
      e.dataTransfer.setData("text/hub_view/" + id, "");
      e.dataTransfer.setData("text/hub_view", id);
    };
    return (
      <Button key={id} draggable onDragStart={handleDragStart} style={{ cursor: "grab" }}>
        {widget.config.name}
      </Button>
    );
  };

  const handleLayoutEditableChange = (value) => {
    setLayoutEditable(value);
    if (value) setTempLayout(null);
  };

  console.log({ layouts });

  return (
    <div className={styles.container}>
      <SettingsModal
        open={settingsOpen}
        onCancel={() => setSettingsOpen(false)}
        onOk={() => setSettingsOpen(false)}
      />
      <ManageLayouts open={manageLayoutsOpen} onCancel={() => setManageLayoutsOpen(false)} />
      <Flex style={{ width: "100%" }} gap="small">
        <Button style={{ width: "100%" }} onClick={() => setSettingsOpen(true)}>
          <SettingFilled />
        </Button>
        <Button style={{ width: "100%" }}>
          <QuestionCircleFilled />
        </Button>
      </Flex>
      {/* <div className={styles.avatarButton}>
        <Avatar size="large" icon={<UserOutlined />} />
        <Text style={{ width: "max-content" }}>George Savvas</Text>
      </div> */}
      <Divider style={{ margin: "8px 0" }}>Layout</Divider>
      <div className={styles.menu}>
        <Space align="center">
          <Switch checked={layoutEditable} onChange={handleLayoutEditableChange} />
          <Text onClick={() => setLayoutEditable(!layoutEditable)} style={{ cursor: "pointer" }}>
            Edit Mode
          </Text>
        </Space>
        <Button onClick={() => setManageLayoutsOpen(true)}>Manage</Button>
        <Divider style={{ margin: "8px 0" }} />
        <Radio.Group
          value={selectedLayout}
          onChange={(e) => setSelectedLayout(e.target.value)}
          style={{ display: "flex", flexDirection: "column" }}
        >
          {pinnedLayouts.map((id) => (
            <Radio value={id} key={id}>
              {layouts[id]?.data.name}
            </Radio>
          ))}
        </Radio.Group>
      </div>
      <Divider style={{ margin: "8px 0" }}>Widgets</Divider>
      <Space direction="vertical">
        {Object.entries(widgets).map((widget) => getMenuItem(widget))}
      </Space>
    </div>
  );
};

export default Sidebar;
