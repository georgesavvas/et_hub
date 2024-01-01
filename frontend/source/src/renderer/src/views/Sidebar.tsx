import { Avatar, Button, Divider, Flex, Menu, Space, Typography } from "antd";
import { QuestionCircleFilled, SettingFilled, UserOutlined } from "@ant-design/icons";
import React, { useContext } from "react";

import { ConfigContext } from "../contexts/ConfigContext";
import Logo from "../components/Logo";
import type { MenuProps } from "antd";
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

const Sidebar = () => {
  const { setActivePage } = useContext(ConfigContext);

  return (
    <div className={styles.container}>
      <Flex style={{ width: "100%" }} gap="small">
        <Button style={{ width: "100%" }}>
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
      <Space direction="vertical">
        <Button style={{ width: "100%" }}>Save</Button>
        <Button style={{ width: "100%" }}>Reset</Button>
        <Button style={{ width: "100%" }}>Manage Layouts</Button>
        <Button type="text">Generic</Button>
        <Button type="text">Farm</Button>
      </Space>
      <Divider style={{ margin: "8px 0" }}>Widgets</Divider>
      <Space direction="vertical">
        <Button type="text">App Launcher</Button>
        <Button type="text">Projects</Button>
        <Button type="text">Notes</Button>
      </Space>
      {/* <Menu items={items} style={{ backgroundColor: "none" }} /> */}
    </div>
  );
};

export default Sidebar;
