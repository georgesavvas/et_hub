import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftOutlined, ArrowRightOutlined, MoreOutlined } from "@ant-design/icons";
import { Avatar, Button, DatePicker, Dropdown, Flex, Input, Modal, Space, Tooltip, Typography, message } from "antd";
import React, {useContext, useEffect, useRef, useState} from "react";
import serverRequest, {formatURL} from "../../services/serverRequest";

import {ConfigContext} from "../../contexts/ConfigContext";
import { CopyToClipboard } from "../../components/ContextActions";
import {DataContext} from "../../contexts/DataContext";
import DataPlaceholder from "../../components/DataPlaceholder";
import Widget from "./Widget.tsx";
import loadFromLS from "../../utils/loadFromLS";
import saveToLS from "../../utils/saveToLS";
import stc from "string-to-color";
import styles from "./ProjectReels.module.css";
import {useResizeDetector} from "react-resize-detector";

const { Title, Text, Paragraph } = Typography;

const variants = {
  enter: (direction) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    };
  }
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
  return Math.abs(offset) * velocity;
};

const wrap = (number, min, max) => {
  if (number < min) return max - 1;
  if (number >= max) return min;
  return number;
};

const Showcase = props => {
  const videoRef = useRef();
  const [description, setDescription] = useState("");
  const [nickname, setNickname] = useState("");
  const [delivery, setDelivery] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const {sources, vertical, size, compact, active, paginate, page, direction} = props;

  useEffect(() => {
    if (!videoRef.current) return;
    if (active) videoRef.current.play();
    else videoRef.current.pause();
  }, [active]);

  if (compact && !active) return null;

  const maxWidth = size[0] - 250;
  const maxHeight = size[1] - 150;
  const minWidth = Math.min(maxWidth, size[1] * (16 / 9));
  const minHeight = Math.min(maxHeight, size[0] / (16 / 9));

  const containerStyle = {
    flexDirection: vertical ? "column" : "row",
    justifyContent: vertical ? "flex-start" : "center",
    alignItems: vertical ? "center" : "flex-start",
    minWidth: vertical ? "" : `${minWidth}px`,
    minHeight: vertical ? `${minHeight}px` : "",
    width: vertical ? "100%" : "auto",
    height: vertical ? "auto" : "100%",
    maxWidth: vertical || compact ? "" : `${maxWidth}px`,
    maxHeight: vertical && !compact ? `${maxHeight}px` : "",
    overflow: "hidden",
  };

  const dropdownItems = [
    { key: "copy", label: "Copy job name" },
    { key: "edit", label: "Edit project info" },
    { key: "addUser", label: "I worked on this" },
    { key: "removeUser", label: "I didn't work on this" },
  ];

  const src = sources[page] || "";
  const projectNumberIndex = src.lastIndexOf("_e");
  const showName = src.slice(0, projectNumberIndex).split("/").at(-1);
  const jobName = src.split("/").at(-1).split(".")[0];

  const carouselButtonStyle = {
    position: "absolute",
    top: "50%",
    left: "10px",
    fontSize: 24,
    zIndex: 2,
    translate: "0 -50%",
  };

  const videoProps = {
    key: page,
    custom: direction,
    variants: variants,
    initial: "enter",
    animate: "center",
    exit: "exit",
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    },
    drag: "x",
    dragConstraints: { left: 0, right: 0 },
    dragElastic: 1,
    onDragEnd: (e, { offset, velocity }) => {
      const swipe = swipePower(offset.x, velocity.x);
      if (swipe < -swipeConfidenceThreshold) paginate(1);
      else if (swipe > swipeConfidenceThreshold) paginate(-1);
    },
  };

  const handleActionsChange = ({key}) => {
    switch (key) {
      case "copy": {
        CopyToClipboard(jobName, messageApi);
        return;
      }
      case "edit": {
        setSettingsOpen(true);
        return;
      }
      default: console.log("Unknown action", key);
    };
  };

  const handleSettingsChange = () => {
    const data = {
      project: "",
      description: description,
      delivery: delivery,
    };
    serverRequest("set_project_description", data).then(resp => {
      if (resp.ok) {
        setSettingsOpen(false);
        messageApi.open({
          type: "success",
          content: "Project info changed",
        });
      } else {
        messageApi.open({
          type: "error",
          content: "Error saving project info",
        });
      }
    });
  };

  return (
    <div className={styles.showcaseContainer} style={containerStyle}>
      {contextHolder}
      <Modal
        open={settingsOpen}
        onCancel={() => setSettingsOpen(false)}
        onOk={handleSettingsChange}
        centered
        title="Projects Settings"
        width="30%"
      >
        <Space direction="vertical" style={{width: "100%"}}>
          <Input.TextArea autoSize={{minRows: 3, maxRows: 12}} placeholder="description" value={description} onChange={e => setDescription(e.target.value)} />
          <Input placeholder="Nickname" value={nickname} onChange={e => setNickname(e.target.value)} />
          <DatePicker placeholder="Select delivery date" onChange={date => setDelivery(date.millisecond())} style={{width: "250px"}} />
        </Space>
      </Modal>
      <ArrowLeftOutlined onClick={() => paginate(-1)} style={carouselButtonStyle} />
      <ArrowRightOutlined onClick={() => paginate(1)} style={{...carouselButtonStyle, left: "", right: "10px"}} />
      <motion.div {...videoProps} style={{width: "100%", height: "100%"}}>
        <video ref={videoRef} autoPlay muted loop controls className={styles.video} style={vertical ? {width: "100%"} : {height: "100%"}} src={src} />
        {compact && <div className={styles.showcaseDetailsCompact}>
          <Title level={5} ellipsis style={{margin: 0, textWrap: "nowrap", textAlign: "center"}}>{showName}</Title>
        </div>}
        {!compact && <div className={styles.showcaseDetails}>
          <div className={styles.showCaseDetailsTop}>
            <Title level={5}>{showName}</Title>
            <Dropdown menu={{ items: dropdownItems, onClick: handleActionsChange }} trigger={["click"]}>
              <Tooltip title="Actions">
                <MoreOutlined className={styles.showcaseMoreButton} style={{fontSize: 18}} />
              </Tooltip>
            </Dropdown>
          </div>
          <div style={{ overflowY: "auto"}}>
            <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: "more" }}>
              Consequat sunt laboris culpa duis laborum deserunt deserunt pariatur nisi deserunt. Sint
              consequat elit magna ipsum quis ex mollit aliquip pariatur. Ut nisi et nisi incididunt qui
              cupidatat dolore irure ipsum veniam magna.
              Consequat sunt laboris culpa duis laborum deserunt deserunt pariatur nisi deserunt. Sint
              consequat elit magna ipsum quis ex mollit aliquip pariatur. Ut nisi et nisi incididunt qui
              cupidatat dolore irure ipsum veniam magna.
              Consequat sunt laboris culpa duis laborum deserunt deserunt pariatur nisi deserunt. Sint
              consequat elit magna ipsum quis ex mollit aliquip pariatur. Ut nisi et nisi incididunt qui
              cupidatat dolore irure ipsum veniam magna.
            </Paragraph>
          </div>
          <Space style={{width: "max-content"}}>
            <Text>Team:</Text>
            <Avatar.Group>
              {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].map(u =>
                <Avatar key={u} style={{ backgroundColor: stc(u) }}>{u}</Avatar>
              )}
            </Avatar.Group>
          </Space>
        </div>}
      </motion.div>
    </div>
  );
};

const ProjectList = ({sources, onProjectSelect, vertical}) => {
  const style = {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: "5px",
    cursor: "pointer",
  };

  const handleMouseEnter = e => {
    e.target.play();
  };

  const handleMouseLeave = e => {
    e.target.pause();
  };

  return (
    <div className={styles.projectListContainer}>
      <div className={styles.projectListContainerGrid} style={vertical ? {marginTop: "10px"} : {}}>
        {sources?.map((src, index) => {
          const projectNumberIndex = src.lastIndexOf("_e");
          const showName = src.slice(0, projectNumberIndex).split("/").at(-1);
          return <Tooltip key={src} title={showName} color="forestgreen">
            <video
              className={styles.showcaseListVideo}
              muted
              loop
              style={style}
              src={src}
              onClick={() => onProjectSelect(index)}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          </Tooltip>
        })}
      </div>
    </div>
  );
};

const ProjectReels = props => {
  const [mounted, setMounted] = useState(false);
  const {isElectron} = useContext(ConfigContext);
  const [selectedReel, setSelectedReel] = useState("");
  const {width, height, ref} = useResizeDetector();
  const {reels} = useContext(DataContext);
  const [[page, direction], setPage] = useState([0, 0]);

  const compact = width < 650 && height < 500;
  const vertical = height * (compact ? 1 : (16 / 9)) > width;

  const defaultConfig = {
    selected: "",
    filterValue: "",
    title: "Project Reels"
  };

  const getReel = file => {
    // if (isElectron) return `hub://${file}`;
    const name = file.split("/").at(-1);
    return formatURL(`data/reel/latest/${name}`);
  };

  const sources = reels.data?.map(src => getReel(src)) || [];

  // useEffect(() => {
  //   setMounted(true);
  //   const savedConfig = loadFromLS(props.rglKey) || {...defaultConfig};
  //   setWidgetConfig(savedConfig);
  // }, []);

  useEffect(() => {
    if (!selectedReel && sources.length > 0) setSelectedReel(sources[0]);
  }, [sources]);

  if (!reels) return <DataPlaceholder text="No data" />;

  const style = {
    flexDirection: vertical ? "column" : "row",
  }

  const handleProjectSelect = index => {
    setPage([index, page > index ? -1 : 1]);
  };

  const paginate = (newDirection) => {
    setPage([wrap(page + newDirection, 0, sources.length), newDirection]);
  };

  return (
    <Widget {...props}>
      <div id="widgetContainer" className={styles.container} style={style} ref={ref}>
        <AnimatePresence initial={false} custom={direction}>
          <Showcase
            sources={sources}
            compact={compact}
            vertical={vertical}
            size={[width, height]}
            direction={direction}
            page={page}
            paginate={paginate}
            active
          />
        </AnimatePresence>
        {!compact && <ProjectList vertical={vertical} sources={sources} onProjectSelect={handleProjectSelect} />}
      </div>
    </Widget>
  );
};

export default ProjectReels;
