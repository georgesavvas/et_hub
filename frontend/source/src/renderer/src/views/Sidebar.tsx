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
      <Flex style={{ width: "100%", marginBottom: "20px" }} gap="small">
        <Button style={{ width: "100%" }} icon={<SettingFilled />}></Button>
        <Button style={{ width: "100%" }} icon={<QuestionCircleFilled />}></Button>
      </Flex>
      <Space>
        <Button type="text">
          <Avatar size={50} icon={<UserOutlined />} />
          <Text>George Savvas</Text>
        </Button>
      </Space>
      <Divider>Layouts</Divider>
      <Space direction="vertical">
        <Button type="text">Layout 1</Button>
        <Button type="text">Layout 1</Button>
        <Button type="text">Layout 1</Button>
      </Space>
      <Divider>Widgets</Divider>
      <Space direction="vertical">
        <Button type="text">App Launcher</Button>
        <Button type="text">Projects</Button>
        <Button type="text">Notes</Button>
      </Space>
      {/* <Menu mode="inline" items={items} style={{ backgroundColor: "none" }} /> */}
    </div>
  );
};

export default Sidebar;
