import React, {useContext, useState, useEffect, useRef} from "react";

import styles from "./Projects.module.css";
import Carousel from "nuka-carousel/lib/carousel";
import {Typography, TextField} from "@mui/material";
import {DataContext} from "../../contexts/DataContext";
import { useResizeDetector } from "react-resize-detector";
import Widget from "./Widget";
import loadFromLS from "../../utils/loadFromLS";
import saveToLS from "../../utils/saveToLS";


const Projects = props => {
  const [mounted, setMounted] = useState(false);
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
  const slideStyle = {
    width: `${slideWidth}px`,
    height: `${slideHeight}px`
  };
  const slidesToScroll = Math.round(slidesAmount / 2);

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
      <div className={styles.container} ref={ref}>
        <Carousel autoplay wrapAround enableKeyboardControls withoutControls
          slidesToScroll={slidesToScroll} dragThreshold={0.25}
          slidesToShow={slidesAmount} autoplayInterval={5000} cellAlign="center">
          {reels.data?.map(file =>
            <div key={file} className={styles.slide} style={slideStyle}>
              <div className={styles.overlay}>
                <Typography variant="body2" align="center"
                  className={styles.text}>
                  {file.split("/").at(-1).split(".")[0]}
                </Typography>
              </div>
              <video muted loop autoPlay className={styles.video}
                src={`hub://${file}`} />
            </div>
          )}
        </Carousel>
      </div>
    </Widget>
  );
};

export default Projects;
