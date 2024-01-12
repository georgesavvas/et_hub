import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftOutlined, ArrowRightOutlined, MoreOutlined } from "@ant-design/icons";
import {
  Avatar,
  DatePicker,
  Dropdown,
  Input,
  Modal,
  Popover,
  Space,
  Tooltip,
  Typography,
} from "antd";
import serverRequest, { formatURL } from "../../services/serverRequest";
import { useContext, useEffect, useRef, useState } from "react";

import { ConfigContext } from "../../contexts/ConfigContext";
import { CopyToClipboard } from "../../components/ContextActions";
import { DataContext } from "../../contexts/DataContext";
import DataPlaceholder from "../../components/DataPlaceholder";
import Widget from "./Widget";
import dayjs from "dayjs";
import { hexToHsl } from "../../utils/hexToHsl";
import stc from "string-to-color";
import styles from "./ProjectReels.module.css";
import { useResizeDetector } from "react-resize-detector";

const { Title, Text, Paragraph } = Typography;

const variants = {
  enter: (direction) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
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

const Showcase = (props) => {
  const { width, height, ref } = useResizeDetector();
  const { user } = useContext(ConfigContext);
  const { users } = useContext(DataContext);
  const videoRef = useRef();
  const [summary, setSummary] = useState("");
  const [nickname, setNickname] = useState("");
  const [delivery, setDelivery] = useState();
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { data, vertical, size, compact, paginate, page, direction, messageApi } = props;

  const project = data[page] || {};

  useEffect(() => {
    const project = data[page];
    setSummary(project.summary);
    setNickname(project.nickname);
    setDelivery(project.delivery || undefined);
  }, [page]);

  if (compact) return null;

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
  const projectNumberIndex = project.name.lastIndexOf("_e");
  const showName = nickname || project.name.slice(0, projectNumberIndex);
  const teamNames = [...project.team, ...(project.addUsers || [])]
    .filter((u) => !project.removeUsers?.includes(u) || true)
    .map((member) => ({
      name: member,
      initials: member[0].toUpperCase(),
    }));
  const userInTeam = [...project.team, ...(project.addUsers || [])].includes(user);
  const dropdownItems = [
    { key: "copy", label: "Copy job name" },
    { key: "edit", label: "Edit project info" },
  ];
  if (userInTeam) dropdownItems.push({ key: "removeUser", label: "I didn't work on this" });
  else dropdownItems.push({ key: "addUser", label: "I worked on this" });

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
      opacity: { duration: 0.2 },
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

  const handleActionsChange = ({ key }) => {
    switch (key) {
      case "copy": {
        CopyToClipboard(project.name, messageApi);
        return;
      }
      case "edit": {
        setSettingsOpen(true);
        return;
      }
      case "addUser": {
        const data = {
          project: project.name,
          data: {
            addUsers: [...(project.addUsers || []), user],
            removeUsers: project.removeUsers?.filter((u) => u != user) || [],
          },
        };
        serverRequest("set_project_info", data, "api/v2");
        return;
      }
      case "removeUser": {
        const data = {
          project: project.name,
          data: {
            addUsers: project.addUsers?.filter((u) => u != user) || [],
            removeUsers: [...(project.removeUsers || []), user],
          },
        };
        serverRequest("set_project_info", data, "api/v2");
        return;
      }
      default:
        console.log("Unknown action", key);
    }
  };

  const handleSettingsChange = () => {
    setLoading(true);
    const data = {
      project: project.name,
      data: {
        summary,
        nickname,
        delivery,
      },
    };
    serverRequest("set_project_info", data, "api/v2").then((resp) => {
      if (resp.ok) {
        setSettingsOpen(false);
        setLoading(false);
        messageApi.open({
          type: "success",
          content: "Project info changed",
        });
      } else {
        messageApi.open({
          type: "error",
          content: "Error saving project info",
        });
        setLoading(false);
      }
    });
  };

  const getUserAvatars = () => {
    let maxPerRow = 8;
    let maxRows = 1;
    if (height > 300) {
      maxRows = 2;
      maxPerRow = 10;
    }
    const amount = teamNames.length;
    const rows = Math.min(maxRows, Math.ceil(amount / maxPerRow));
    const avatars = [];
    for (let i = 0; i < rows; i++) {
      const isLast = i == rows - 1;
      const start = i * maxPerRow;
      const end = isLast ? amount : start + maxPerRow;
      avatars.push(
        <Avatar.Group key={i} maxCount={isLast ? maxPerRow - 1 : maxPerRow}>
          {teamNames.slice(start, end).map((u) => (
            <Popover key={u} content={getUserProfile(u.name)}>
              <Avatar
                id={`avatar-${u.name}`}
                src={users[u.name]?.profile.image_32}
                style={{ backgroundColor: hexToHsl(stc(u), 80, 30) }}
              >
                {u.initials}
              </Avatar>
            </Popover>
          ))}
        </Avatar.Group>,
      );
    }
    return avatars;
  };

  const getUserProfile = (name) => {
    const profile = users[name]?.profile || {};
    return (
      <Space>
        <Avatar size={48} src={profile.image_48} />
        <Space direction="vertical">
          <Title level={5} style={{ margin: 0 }}>
            {profile.real_name}
          </Title>
          <Text>{profile.title}</Text>
        </Space>
      </Space>
    );
  };

  return (
    <div className={styles.showcaseContainer} style={containerStyle} ref={ref}>
      <Modal
        open={settingsOpen}
        onCancel={() => setSettingsOpen(false)}
        onOk={handleSettingsChange}
        confirmLoading={loading}
        centered
        title="Projects Settings"
        width="30%"
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 12 }}
            placeholder="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          <Input
            placeholder="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <DatePicker
            placeholder="Select delivery date"
            format="DD/MM/YYYY"
            value={delivery ? dayjs(delivery, "DD/MM/YYYY") : undefined}
            onChange={(_, date) => setDelivery(date)}
            style={{ width: "250px" }}
          />
        </Space>
      </Modal>
      <ArrowLeftOutlined onClick={() => paginate(-1)} style={carouselButtonStyle} />
      <ArrowRightOutlined
        onClick={() => paginate(1)}
        style={{ ...carouselButtonStyle, left: "", right: "10px" }}
      />
      <motion.div {...videoProps} style={{ width: "100%", height: "100%" }}>
        <video
          key={project.reel}
          ref={videoRef}
          autoPlay
          muted
          loop
          controls
          className={styles.video}
          style={vertical ? { width: "100%" } : { height: "100%" }}
          src={project.reel}
        />
        {compact && (
          <div className={styles.showcaseDetailsCompact}>
            <Title
              level={5}
              ellipsis
              style={{ margin: 0, textWrap: "nowrap", textAlign: "center" }}
            >
              {showName}
            </Title>
          </div>
        )}
        {!compact && (
          <div className={styles.showcaseDetails}>
            <div className={styles.showCaseDetailsTop}>
              <Title level={5} style={{ margin: 0 }}>
                {showName}
              </Title>
              <Dropdown
                menu={{ items: dropdownItems, onClick: handleActionsChange }}
                trigger={["click"]}
              >
                <div style={{ cursor: "pointer" }}>
                  <Tooltip title="Actions">
                    <MoreOutlined className={styles.showcaseMoreButton} style={{ fontSize: 18 }} />
                  </Tooltip>
                </div>
              </Dropdown>
            </div>
            {delivery && <Text>Delivery: {delivery}</Text>}
            {summary && (
              <div style={{ overflowY: "auto" }}>
                <Paragraph
                  className={styles.summary}
                  ellipsis={{ rows: 2, expandable: true, symbol: "more" }}
                  style={{ margin: 0, whiteSpace: "pre-line", lineBreak: "loose" }}
                >
                  {summary}
                </Paragraph>
              </div>
            )}
            <Space direction="vertical">{getUserAvatars()}</Space>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const ProjectList = ({ data, onProjectSelect, vertical }) => {
  const style = {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: "5px",
    cursor: "pointer",
  };

  const handleMouseEnter = (e) => {
    e.target.play();
  };

  const handleMouseLeave = (e) => {
    e.target.pause();
  };

  return (
    <div className={styles.projectListContainer}>
      <div
        className={styles.projectListContainerGrid}
        style={vertical ? { marginTop: "10px" } : {}}
      >
        {data?.map((project, index) => {
          const projectNumberIndex = project.name.lastIndexOf("_e");
          const showName = project.name.slice(0, projectNumberIndex);
          return (
            <Tooltip key={project.name} title={showName} color="darkgreen" placement="rightTop">
              <video
                className={styles.showcaseListVideo}
                muted
                loop
                style={style}
                src={project.reel}
                onClick={() => onProjectSelect(index)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              />
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};

const ProjectReels = (props) => {
  const { isElectron } = useContext(ConfigContext);
  const [selectedProject, setSelectedProject] = useState("");
  const { width, height, ref } = useResizeDetector();
  const { projects } = useContext(DataContext);
  const [[page, direction], setPage] = useState([0, 0]);
  // const [messageApi, contextHolder] = message.useMessage();
  const compact = width < 650 && height < 500;
  const vertical = height * (compact ? 1 : 16 / 9) > width;

  const getReel = (file) => {
    // if (isElectron) return `hub://${file}`;
    const name = file.split("/").at(-1);
    return formatURL(`data/reel/latest/${name}`);
  };

  useEffect(() => {
    if (!selectedProject && projects) setSelectedProject(projects[selectedProject]);
  }, [projects]);

  if (!projects || Object.keys(projects).length === 0) return <DataPlaceholder text="No data" />;

  const processedData = [];
  Object.entries(projects).forEach(([name, data]) => {
    if (!data.reel) return;
    processedData.push({
      name,
      ...data,
      reel: getReel(data.reel),
    });
  });

  const style = {
    flexDirection: vertical ? "column" : "row",
  };

  const handleProjectSelect = (index) => {
    setPage([index, page > index ? -1 : 1]);
  };

  const paginate = (newDirection) => {
    setPage([wrap(page + newDirection, 0, processedData.length), newDirection]);
  };

  return (
    <Widget {...props}>
      <div id="widgetContainer" className={styles.container} style={style} ref={ref}>
        <AnimatePresence initial={false} custom={direction}>
          <Showcase
            data={processedData}
            compact={compact}
            vertical={vertical}
            size={[width, height]}
            direction={direction}
            page={page}
            paginate={paginate}
            messageApi={props.messageApi}
          />
        </AnimatePresence>
        {!compact && (
          <ProjectList
            vertical={vertical}
            data={processedData}
            onProjectSelect={handleProjectSelect}
          />
        )}
      </div>
    </Widget>
  );
};

export default ProjectReels;
