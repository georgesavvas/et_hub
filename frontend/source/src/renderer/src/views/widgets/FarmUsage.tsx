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
import styles from "./FarmUsage.module.css";
import { useResizeDetector } from "react-resize-detector";

const { Title, Text, Paragraph } = Typography;

const FarmUsage = (props) => {
  const { reels } = useContext(DataContext);
  const { width, height, ref } = useResizeDetector();
  const compact = width < 650 && height < 500;

  return (
    <Widget {...props}>
      <div id="widgetContainer" className={styles.container} ref={ref}></div>
    </Widget>
  );
};

export default FarmUsage;
