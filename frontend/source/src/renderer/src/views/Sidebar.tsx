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

const { Title, Paragraph, Text, Link } = Typography;

// type MenuItem = Required<MenuProps>["items"][number];

// function getItem(
//   label: React.ReactNode,
//   key: React.Key,
//   icon?: React.ReactNode,
//   children?: MenuItem[],
//   type?: "group",
// ): MenuItem {
//   return {
//     key,
//     icon,
//     children,
//     label,
//     type,
//   } as MenuItem;
// }

// const items: MenuProps["items"] = [
//   getItem("Layouts", "layouts", null, [
//     getItem("Item 1", "g1", null, [getItem("Option 1", "1"), getItem("Option 2", "2")], "group"),
//     getItem("Item 2", "g2", null, [getItem("Option 3", "3"), getItem("Option 4", "4")], "group"),
//   ]),

//   getItem("Widgets", "widgets", null, [
//     getItem("Option 5", "5"),
//     getItem("Option 6", "6"),
//     getItem("Submenu", "sub3", null, [getItem("Option 7", "7"), getItem("Option 8", "8")]),
//   ]),
// ];

const defaultLayout = [
  {
    w: 3,
    h: 2,
    x: 0,
    y: 0,
    i: "projects_1",
  },
  {
    w: 3,
    h: 2,
    x: 1,
    y: 3,
    i: "projects_2",
  },
  {
    w: 3,
    h: 2,
    x: 2,
    y: 5,
    i: "projects_3",
  },
];

const SettingsModal = ({ open, onOk, onCancel }) => {
  const { appLook, setAppLook } = useContext(ConfigContext);
  const [backgroundImage, setBackgroundImage] = useState(() => {
    return localStorage.getItem("backgroundImage") || null;
  });

  const handleImageChange = (selectedImage) => {
    const imageUrl = URL.createObjectURL(selectedImage);
    localStorage.setItem("backgroundImage", imageUrl);
    setBackgroundImage(imageUrl);
  };

  useEffect(() => {
    return () => {
      if (backgroundImage) {
        URL.revokeObjectURL(backgroundImage);
      }
    };
  }, [backgroundImage]);

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
        message.success(`${info.file.name} file uploaded successfully.`);
        handleImageChange(info.file.originFileObj);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  const previewStyle = {
    filter: `brightness(${appLook.bgBrightness}%)`,
    backgroundImage: `url(${backgroundImage})`,
  };

  const previewWidgetStyle = {
    backgroundColor: `rgba(${appLook.widgetColour.r}, ${appLook.widgetColour.g}, ${
      appLook.widgetColour.b
    }, ${1 - appLook.widgetTranslucency})`,
    // opacity: 1 - appLook.widgetTranslucency,
    backdropFilter: `blur(${appLook.widgetBlur}px)`,
  };

  const setConfig = (key, value) => {
    setAppLook((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Modal open={open} onOk={onOk} onCancel={onCancel} mask={false} width="40%">
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <div className={styles.previewContainer} style={previewStyle}>
          <div className={styles.previewWidget} style={previewWidgetStyle} />
        </div>
        <Card title="Background Image">
          <Space direction="vertical" style={{ width: "100%" }}>
            <Upload.Dragger {...uploadProps} accept="image/*">
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
            </Upload.Dragger>
            <Space>
              <p>Brightness</p>
              <Slider
                min={0}
                max={100}
                style={{ width: 200 }}
                value={appLook.bgBrightness}
                onChange={(value) => setConfig("bgBrightness", value)}
              />
            </Space>
          </Space>
        </Card>
        <Card title="Widgets">
          <Space direction="vertical">
            <Space>
              <p>Colour</p>
              <ColorPicker onChange={(value) => setConfig("widgetColour", value.toRgb())} />
            </Space>
            <Space>
              <p>Translucency</p>
              <Slider
                min={0}
                max={1}
                step={0.05}
                style={{ width: 200 }}
                value={appLook.widgetTranslucency}
                onChange={(value) => setConfig("widgetTranslucency", value)}
              />
            </Space>
            <Space>
              <p>Blur</p>
              <Slider
                min={0}
                max={50}
                style={{ width: 200 }}
                value={appLook.widgetBlur}
                onChange={(value) => setConfig("widgetBlur", value)}
              />
            </Space>
          </Space>
        </Card>
      </Space>
    </Modal>
  );
};

const Sidebar = () => {
  const { layoutEditable, setLayoutEditable, layouts, selectedLayout, setSelectedLayout } =
    useContext(ConfigContext);
  const { setActivePage } = useContext(ConfigContext);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [manageLayoutsOpen, setManageLayoutsOpen] = useState(false);

  const getMenuItem = ([id, name]) => {
    const handleDragStart = (e) => {
      e.dataTransfer.setData("text/hub_view/" + id, "");
      e.dataTransfer.setData("text/hub_view", id);
    };
    return (
      <Button
        key={id}
        // type="text"
        draggable
        onDragStart={handleDragStart}
        style={{ cursor: "grab" }}
      >
        {name}
      </Button>
    );
  };

  const handleLayoutEditableChange = (value) => {
    setLayoutEditable(value);
  };

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
      <div className={styles.avatarButton}>
        <Avatar size="large" icon={<UserOutlined />} />
        <Text style={{ width: "max-content" }}>George Savvas</Text>
      </div>
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
          {/* <Radio value="Default">Default</Radio> */}
          {Object.entries(layouts).map(([id, l]) => (
            <Radio value={id} key={id}>
              {l.data.name}
            </Radio>
          ))}
        </Radio.Group>
      </div>
      <Divider style={{ margin: "8px 0" }}>Widgets</Divider>
      <Space direction="vertical">
        {[
          ["apps", "App Launcher"],
          ["projects", "Projects"],
          ["notes", "Notes"],
        ].map((item) => getMenuItem(item))}
      </Space>
      {/* <Menu items={items} style={{ backgroundColor: "none" }} /> */}
    </div>
  );
};

export default Sidebar;
