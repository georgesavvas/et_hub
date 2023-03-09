import React, {useContext, useState, useEffect, useRef} from "react";

import styles from "./Projects.module.css";
import Carousel from "nuka-carousel/lib/carousel";
import {Typography, TextField} from "@mui/material";
import {DataContext} from "../../contexts/DataContext";
import {useResizeDetector} from "react-resize-detector";
import Widget from "./Widget";
import loadFromLS from "../../utils/loadFromLS";
import saveToLS from "../../utils/saveToLS";
import {formatURL} from "../../services/serverRequest";
import {ConfigContext} from "../../contexts/ConfigContext";
import { useInView } from "react-intersection-observer";
import DataPlaceholder from "../../components/DataPlaceholder";


const Project = ({src, width, height}) => {
  const widgetContainer = document.getElementById("widgetContainer");
  const {ref, inView} = useInView({root: widgetContainer, threshold: 0.5});
  const videoRef = useRef();

  if (videoRef.current && document.fullscreenElement === null) {
    inView ? videoRef.current.play() : videoRef.current.pause();
  }

  const slideStyle = {
    width: `${width}px`,
    height: `${height}px`
  };

  return (
    <div className={styles.slide} style={slideStyle} ref={ref}>
      <div className={styles.overlay}>
        <Typography variant="body1" align="center"
          className={styles.text}>
          {src.split("/").at(-1).split(".")[0]}
        </Typography>
      </div>
      <video ref={videoRef} muted loop className={styles.video} controls={inView} src={src} />
    </div>
  );
};

const Projects = props => {
  const [mounted, setMounted] = useState(false);
  const {isElectron} = useContext(ConfigContext);
  const {width, height, ref} = useResizeDetector();
  const {reels} = useContext(DataContext);
  const [widgetConfig, setWidgetConfig] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const title = widgetConfig.title;
  const setTitle = value => handleConfigEdit("title", value);

  const defaultConfig = {
    selected: "",
    filterValue: "",
    title: "Projects"
  };

  useEffect(() => {
    setMounted(true);
    const savedConfig = loadFromLS(props.rglKey) || {...defaultConfig};
    setWidgetConfig(savedConfig);
  }, []);

  if (!reels) return <DataPlaceholder text="No data" />;

  const handleConfigEdit = (key, value) => {
    setWidgetConfig(prev => {
      const existing = {...prev};
      existing[key] = value;
      saveToLS(props.rglKey, existing);
      return existing;
    });
  };

  const slideHeight = height;
  const slideWidth = slideHeight * 16/9;
  const placeholderAmount = Math.max((width - 20) / slideWidth, 1);
  const slidesAmount = Math.max((width - 5 * placeholderAmount) / slideWidth, 1);
  const slidesToScroll = Math.round(slidesAmount / 2);

  const getReel = file => {
    if (isElectron) return `hub://${file}`;
    const name = file.split("/").at(-1);
    return formatURL(`data/reel/latest/${name}`);
  };

  const Settings = <>
    <TextField
      label="Widget name"
      value={title}
      onChange={e => setTitle(e.target.value)}
      size="small"
    />
  </>;

  return (
    <Widget
      settings={Settings}
      settingsOpen={settingsOpen}
      setSettingsOpen={setSettingsOpen}
      title={title}
      onRemove={props.onRemove}
      rglKey={props.rglKey}
    >
      <div id="widgetContainer" className={styles.container} ref={ref}>
        <Carousel wrapAround enableKeyboardControls withoutControls
          slidesToScroll={slidesToScroll} dragThreshold={0.25}
          slidesToShow={slidesAmount} autoplayInterval={5000} cellAlign="center"
          autoplay={document.fullscreenElement === null}
        >
          {reels.data?.map(file =>
            <Project key={file}
              src={getReel(file)}
              width={slideWidth}
              height={slideHeight}
            />
          )}
        </Carousel>
      </div>
    </Widget>
  );
};

export default Projects;
