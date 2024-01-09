import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftOutlined, ArrowRightOutlined, MoreOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Cascader,
  DatePicker,
  Dropdown,
  Flex,
  Input,
  Modal,
  Select,
  Space,
  Tooltip,
  Typography,
  message,
} from "antd";
import React, { useContext, useEffect, useRef, useState } from "react";
import serverRequest, { formatURL } from "../../services/serverRequest";

import { ConfigContext } from "../../contexts/ConfigContext";
import { CopyToClipboard } from "../../components/ContextActions";
import { DataContext } from "../../contexts/DataContext";
import DataPlaceholder from "../../components/DataPlaceholder";
import Widget from "./Widget";
import loadFromLS from "../../utils/loadFromLS";
import saveToLS from "../../utils/saveToLS";
import stc from "string-to-color";
import styles from "./VoltBrowser.module.css";
import { useResizeDetector } from "react-resize-detector";

const { Title, Text, Paragraph } = Typography;

const VoltBrowser = (props) => {
  const { projects } = useContext(DataContext);
  const [project, setProject] = useState("");
  const [context, setContext] = useState("");
  const [treeLoading, setTreeLoading] = useState(false);
  const [data, setData] = useState([]);
  const { width, height, ref } = useResizeDetector();
  const compact = width < 650 && height < 500;

  useEffect(() => {
    if (!project) return;
    setTreeLoading(true);
    serverRequest("get_project_tree", { project: `/project/tvc/${project}` }, "api/v2").then(
      (resp) => {
        setData(resp.data);
        setTreeLoading(false);
      },
    );
  }, [project]);

  useEffect(() => {
    serverRequest("get_assets", { uri: context }, "api/v2").then((resp) => {
      console.log(resp.data);
    });
  }, [context]);

  const getNode = (node) => {
    return {
      value: node.name,
      label: node.name,
      children: node.nodes.map((child) => getNode(child)),
    };
  };

  // const projectTree = data.map((node) => getNode(node));
  // console.log({ data });
  // console.log(projectTree);

  const filterOption = (input: string, option?: { label: string; value: string }) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const onChange = (value: string) => {
    console.log(`selected ${value}`);
    setProject(value);
  };

  if (!projects || Object.keys(projects).length === 0) return <DataPlaceholder text="No data" />;

  const projectList = Object.keys(projects).map((project) => ({
    value: project,
    label: project,
  }));
  console.log(context);
  const displayRender = (labels: string[]) => labels.join(" / ");

  const dropdownRender = (menus: React.ReactNode) => <div className={styles.cascader}>{menus}</div>;

  return (
    <Widget {...props}>
      <div id="widgetContainer" className={styles.container} ref={ref}>
        <Select
          showSearch
          placeholder="Project"
          optionFilterProp="children"
          onChange={onChange}
          filterOption={filterOption}
          options={projectList}
          style={{ width: "50%" }}
        />
        <Cascader
          showSearch
          fieldNames={{ label: "name", value: "name", children: "nodes" }}
          onChange={(value) => setContext(`/project/tvc/${project}/${value.join("/")}`)}
          placeholder="Context"
          options={data}
          expandTrigger="hover"
          changeOnSelect
          displayRender={displayRender}
          style={{ width: "100%" }}
          loading={treeLoading}
          dropdownRender={dropdownRender}
        />
      </div>
    </Widget>
  );
};

export default VoltBrowser;
