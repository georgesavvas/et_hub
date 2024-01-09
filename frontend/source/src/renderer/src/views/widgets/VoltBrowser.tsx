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

const mockTree = [
  {
    value: "build",
    label: "build",
    children: [
      {
        value: "jack",
        label: "jack",
        children: [
          {
            value: "model",
            label: "model",
            children: [
              {
                value: "main",
                label: "main",
              },
            ],
          },
          {
            value: "look",
            label: "look",
            children: [
              {
                value: "main",
                label: "main",
              },
            ],
          },
        ],
      },
      {
        value: "chair",
        label: "chair",
        children: [
          {
            value: "model",
            label: "model",
            children: [
              {
                value: "main",
                label: "main",
              },
            ],
          },
          {
            value: "look",
            label: "look",
            children: [
              {
                value: "main",
                label: "main",
              },
            ],
          },
        ],
      },
      {
        value: "cityGirl",
        label: "cityGirl",
        children: [
          {
            value: "model",
            label: "model",
            children: [
              {
                value: "main",
                label: "main",
              },
            ],
          },
          {
            value: "look",
            label: "look",
            children: [
              {
                value: "main",
                label: "main",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    value: "lot10",
    label: "lot10",
    children: [
      {
        value: "0010",
        label: "0010",
        children: [
          {
            value: "animate",
            label: "animate",
            children: [
              {
                value: "main",
                label: "main",
              },
            ],
          },
          {
            value: "light",
            label: "light",
            children: [
              {
                value: "main",
                label: "main",
              },
            ],
          },
          {
            value: "comp",
            label: "comp",
            children: [
              {
                value: "main",
                label: "main",
              },
            ],
          },
        ],
      },
      {
        value: "0020",
        label: "0020",
        children: [
          {
            value: "animate",
            label: "animate",
            children: [
              {
                value: "main",
                label: "main",
              },
            ],
          },
          {
            value: "light",
            label: "light",
            children: [
              {
                value: "main",
                label: "main",
              },
            ],
          },
          {
            value: "comp",
            label: "comp",
            children: [
              {
                value: "main",
                label: "main",
              },
            ],
          },
        ],
      },
      {
        value: "0030",
        label: "0030",
        children: [
          {
            value: "animate",
            label: "animate",
            children: [
              {
                value: "main",
                label: "main",
              },
            ],
          },
          {
            value: "light",
            label: "light",
            children: [
              {
                value: "main",
                label: "main",
              },
            ],
          },
          {
            value: "comp",
            label: "comp",
            children: [
              {
                value: "main",
                label: "main",
              },
            ],
          },
        ],
      },
    ],
  },
];

const VoltBrowser = (props) => {
  const { projects } = useContext(DataContext);
  const [selectedProject, setSelectedProject] = useState("");
  const { width, height, ref } = useResizeDetector();
  const compact = width < 650 && height < 500;

  useEffect(() => {
    if (!selectedProject) return;
    serverRequest(
      "get_project_tree",
      { project: `/project/tvc/${selectedProject}` },
      "api/v2",
    ).then((resp) => {
      console.log(resp.data);
    });
  }, [selectedProject]);

  const filterOption = (input: string, option?: { label: string; value: string }) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const onChange = (value: string) => {
    console.log(`selected ${value}`);
    setSelectedProject(value);
  };

  const onSearch = (value: string) => {
    console.log("search:", value);
  };

  if (!projects || Object.keys(projects).length === 0) return <DataPlaceholder text="No data" />;

  const data = Object.keys(projects).map((project) => ({
    value: project,
    label: project,
  }));

  const displayRender = (labels: string[]) => labels.join(" / ");

  return (
    <Widget {...props}>
      <div id="widgetContainer" className={styles.container} ref={ref}>
        <Select
          showSearch
          placeholder="Project"
          optionFilterProp="children"
          onChange={onChange}
          onSearch={onSearch}
          filterOption={filterOption}
          options={data}
          style={{ width: "500px" }}
        />
        <Cascader
          placeholder="Context"
          options={mockTree}
          expandTrigger="hover"
          changeOnSelect
          displayRender={displayRender}
          style={{ width: "500px" }}
        />
      </div>
    </Widget>
  );
};

export default VoltBrowser;
